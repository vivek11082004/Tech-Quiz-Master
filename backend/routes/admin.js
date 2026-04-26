import express from 'express';
import {getStats} from "../controllers/userController.js";

import { deleteQuiz, getAllQuizzes, createQuiz, getQuizById } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post("/upload-quiz", protect, createQuiz);

router.get("/stats", getStats);
router.get("/quizzes", getAllQuizzes);

router.get("/quiz/:id", getQuizById);
router.delete("/quiz/:id", protect, deleteQuiz);


export default router;