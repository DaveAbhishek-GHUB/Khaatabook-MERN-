const mongoose = require("mongoose");
const joi = require("joi");

mongoose.connect("mongodb://127.0.0.1:27017/khaatabookWithMongoDB");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                // Simple regex for validating email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            message: (props) => `${props.value} is not a valid email address`,
        },
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        // match: [
        //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        //     "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        // ],
    },

    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [0, "Age must be greater than 0"],
        max: [120, "Age cannot exceed 120 years"],
    },
    
    hisaabs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "hisaab",
        },
    ],
});

const validateModel = (data) => {
    const schema = joi.object({
        username: joi.string()
            .min(3)
            .max(30)
            .required(),
        email: joi
            .string()
            .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
            .min(5)
            .max(255)
            .required(),
        password: joi.string()
            .min(8)
            .required(),
        age: joi.number()
            .integer()
            .min(18)
            .max(120)
            .required(),
    });

    let { error } = schema.validate(data);
    return error;
};

let model = mongoose.model('user', userSchema);
module.exports = { model, validateModel };