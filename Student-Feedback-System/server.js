const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const Feedback = require("./models/Feedback");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===============================
// STORE FEEDBACK
// ===============================

app.post("/feedback", async (req, res) => {

    try {

        const feedback = new Feedback({
            studentName: req.body.studentName,
            registerNo: req.body.registerNo,
            department: req.body.department,
            course: req.body.course,
            faculty: req.body.faculty,
            rating: Number(req.body.rating),
            comments: req.body.comments
        });

        await feedback.save();

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Feedback Submitted</title>
            </head>
            <body>

                <h2>Feedback submitted successfully!</h2>

                <p>Thank you for your feedback.</p>

                <a href="/">Submit another feedback</a>
                <br><br>
                <a href="/admin.html">Go to Admin Page</a>

            </body>
            </html>
        `);

    } catch (error) {

        console.error(error);

        res.status(500).send("Error saving feedback");

    }

});


// ===============================
// GET FEEDBACK
// SEARCH + FILTER
// ===============================

app.get("/feedback", async (req, res) => {

    try {

        const { registerNo, course } = req.query;

        let filter = {};

        // Search by Register Number
        if (registerNo) {

            filter.registerNo = {
                $regex: registerNo,
                $options: "i"
            };

        }

        // Filter by Course
        if (course) {

            filter.course = {
                $regex: course,
                $options: "i"
            };

        }

        const feedbacks = await Feedback.find(filter);

        res.json(feedbacks);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error retrieving feedback"
        });

    }

});


// ===============================
// AVERAGE RATING FOR FACULTY
// ===============================

app.get("/feedback/average/:faculty", async (req, res) => {

    try {

        const faculty = req.params.faculty;

        const result = await Feedback.aggregate([

            {
                $match: {
                    faculty: {
                        $regex: faculty,
                        $options: "i"
                    }
                }
            },

            {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: "$rating"
                    }
                }
            }

        ]);

        if (result.length === 0) {

            return res.json({
                averageRating: 0
            });

        }

        const averageRating =
            Number(result[0].averageRating.toFixed(2));

        res.json({
            averageRating: averageRating
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error calculating average rating"
        });

    }

});


// ===============================
// DELETE FEEDBACK
// ===============================

app.delete("/feedback/:id", async (req, res) => {

    try {

        await Feedback.findByIdAndDelete(req.params.id);

        res.json({
            message: "Feedback deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error deleting feedback"
        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});