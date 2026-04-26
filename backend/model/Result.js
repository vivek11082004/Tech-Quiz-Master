import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    userId: { type: String, required: true }, //For a particular user can see
    userName: { type: String },
    userEmail: { type: String },
    technology: { type: String, required: true },
    level: { type: String, required: true },

    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    score: { type: Number, required: true },

    timeTaken: Number,
    startDate: Date,
}, { timestamps: true });

const Result = mongoose.model("Result", resultSchema);

export default Result;
