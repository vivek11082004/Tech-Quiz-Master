import express from 'express';
import { CreatemyResult, getMyResult } from '../controllers/resultController.js';

const router = express.Router();

router.post("/create", CreatemyResult);
router.get("/my-results", getMyResult);

export default router;