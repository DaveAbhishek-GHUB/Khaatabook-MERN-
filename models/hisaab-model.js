const mongoose = require("mongoose");
const joi = require("joi");

mongoose.connect("mongodb://127.0.0.1:27017/khaatabookWithMongoDB");

const hisaabSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        minlength: [5, "Content must be at least 5 characters long"],
    },
    isEncrypt: {
        type: Boolean,
    },
    passcode: {
        type: Number,
    },
    isSharable: {
        type: Boolean,
    },
    isEditable: {
        type: Boolean,
    },
    data: {
        type: Date,
        default: Date.now()
    },
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    ],
});

const validateHisaab = (data) => {
    const schema = joi.object({
        name: joi.string().min(3).max(50).required(),
        content: joi.string().min(5).required(),
        isEncrypt: joi.boolean().required(),
        passcode: joi.number().integer().min(1000).max(9999).allow(null),
        isSharable: joi.boolean(),
        isEditable: joi.boolean(),
        date: joi.date()
    });
    let { error } = schema.validate(data);
    return error;
};


let hisaabModel = mongoose.model('hisaab', hisaabSchema);

module.exports = { hisaabModel, validateHisaab };