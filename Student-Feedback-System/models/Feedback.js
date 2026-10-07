const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    studentName: String,
    registerNo: String,
    department: String,
    course: String,
    faculty: String,
    rating: Number,
    comments: String
});

module.exports = mongoose.model(
    "Feedback",
    feedbackSchema,
    "feedback"
);