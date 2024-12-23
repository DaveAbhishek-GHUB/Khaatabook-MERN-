const express = require("express");
const app = express();
const path = require("path");
const port = 3000;

// Set EJS as view engine
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Route handler for the root path
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/register", (req, res) => {
  res.render("auth/register");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get("/create", (req, res) => {
  res.render("createhisaab");
});

app.get("/hisaab", (req, res) => {
  res.render("viewHisaab");
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port 3000`);
});
