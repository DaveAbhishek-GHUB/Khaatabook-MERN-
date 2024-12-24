// Import required modules
const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session');
const bcrypt = require('bcrypt');
const { model, validateModel } = require("./models/user-model");
const { validateHisaab, hisaabModel } = require("./models/hisaab-model");
const port = 3000;

// Set EJS as view engine
app.set("view engine", "ejs");

// Add session middleware
app.use(session({
  secret: 'random',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Route handler for the root path
app.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    let user = await model.findById(req.session.userId).populate("hisaabs")

    if (!user) {
      return res.redirect('/login');
    }

    // Render profile with the user's hisaabs
    res.render("profile", { hisaabs: user.hisaabs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user data");
  }
});

// Route handlers for authentication pages
app.get("/register", (req, res) => {
  res.render("auth/register");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/create", (req, res) => {
  res.render("createhisaab");
});

app.get("/hisaab/:hisaabid", async(req, res) => {
  try {
    // Add await here
    let hisaab = await hisaabModel.findById(req.params.hisaabid);
    
    if (!hisaab) {
      return res.status(404).send("Hisaab not found");
    }

    console.log(hisaab);
    
    // Render the hisaab view with the data
    res.render("viewHisaab", { hisaab });
    
  } catch (error) {
    console.error("Error fetching hisaab:", error);
    res.status(500).send("Error fetching hisaab");
  }
});

// POST route handler for user registration
app.post("/user/register", async (req, res) => {
  let { username, email, password, age } = req.body;

  // Validate input data
  const error = validateModel({ username, email, password, age });

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let createdUser = await model.create({
      username,
      email,
      password: hashedPassword,
      age
    });

    // Set session
    req.session.userId = createdUser._id;
    console.log(req.session);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// POST route handler for user login
app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await model.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password");
    }

    // Set session
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

app.post("/create/hisaab", async (req, res) => {
  try {
    // Destructure the form data from request body
    const {
      fileName,
      fileDescription,
      encrypt,
      shareable,
      password,
      editPermission
    } = req.body;

    // Convert password to a number if provided, otherwise null
    const passcode = password ? parseInt(password) : null;

    // Create validation object that matches our Joi schema
    const hisaabData = {
      name: fileName,
      content: fileDescription,
      isEncrypt: encrypt === "encrypt",
      passcode: passcode,
      isSharable: shareable === "shareable",
      isEditable: editPermission === "editPermission"
    };

    // Validate the data using our Joi validation
    const validationError = validateHisaab(hisaabData);

    if (validationError) {
      return res.status(400).json({
        error: validationError.details[0].message
      });
    }

    // If validation passes, create the hisaab document
    let createdHisaab = await hisaabModel.create({
      name: fileName,
      content: fileDescription,
      isEncrypt: encrypt === "encrypt",
      passcode: passcode,
      isSharable: shareable === "shareable",
      isEditable: editPermission === "editPermission",
      data: new Date() // Set current date
    });

    // Add the user ID to the hisaab's user array
    createdHisaab.user.push(req.session.userId);
    await createdHisaab.save();

    // Add the hisaab ID to the user's hisaabs array
    await model.findByIdAndUpdate(
      req.session.userId,
      {
        $push: {
          hisaabs: createdHisaab._id
        }
      },
      {
        new: true // Return the updated document
      }
    );

    // Redirect to home page after successful creation
    res.redirect("/");

  } catch (error) {
    // Log the error for debugging
    console.error('Error creating hisaab:', error);

    // Check if it's a validation error from MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Invalid data provided'
      });
    }

    // For any other errors, send a generic error message
    res.status(500).json({
      error: "Error creating hisaab. Please try again."
    });
  }
});

// Route to handle the update of the Hisaab content
app.post("/update/:hisaabid", async (req, res) => {
  const { content } = req.body;

  try {
    // Find the Hisaab by ID and update its content
    let updatedHisaab = await hisaabModel.findByIdAndUpdate(
      req.params.hisaabid,
      { content: content },
      { new: true } // Return the updated document
    );

    // Redirect back to the Hisaab page after updating
    res.redirect(`/hisaab/${updatedHisaab._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating the Hisaab");
  }
});


app.post("/delete/:hisaabid", async (req, res) => {
  try {
    await hisaabModel.findOneAndDelete({ _id: req.params.hisaabid });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting the record");
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port 3000`);
});