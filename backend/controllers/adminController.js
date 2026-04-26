// Get a single quiz by id
export const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        res.json({ success: true, quiz });
    } catch (error) {
        console.error("Error fetching quiz by id:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
import Quiz from "../model/Quiz.js";
const LETTERS = ["A", "B", "C", "D"];

// Create a new quiz
export const createQuiz = async (req, res) => {
    const { technology, level, timeLimit, questions } = req.body;
    const createdBy = req.auth?.userId;
    const quiz = await Quiz.findOneAndUpdate(
        {
            technology: technology.toLowerCase(),
            level
        },
        {
            technology,
            level,
            timeLimit,
            questions,
            totalQuestions: questions.length,
            createdBy
        },
        {
            new: true,
            upsert: true
        }
    );
    res.status(201).json({ success: true, quiz });
}

// To get all quizzes
export const getAllQuizzes = async (req, res) => {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json({ success: true, quizzes });
}

// To delete a quiz
export const deleteQuiz = async (req, res) => {
    try {
        const {id} = req.params;
        const quiz = await Quiz.findByIdAndDelete(id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }       
         res.json({ success: true, message: "Quiz deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting quiz:", error);
        res.status(500).json({ success: false, message: "Server error" });
    };
    
}