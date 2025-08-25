import express from 'express';
import {
    createQuiz,
    getQuizById,
    getQuizById,
    getQuizzes,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    joinQuizByCode,
} from '../controllers/quiz.controller';

import { protect } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

router.use(protect);

router.post("/",
    rateLimit({
        windowInSeconds: 60,
        maxRequests: 5
    }),
    createQuiz
);
router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.put("/:id", updateQuiz);
router.patch("/:id/publish",
    rateLimit({
        windowInSeconds: 60,
        maxRequests: 3
    }),
    publishQuiz
);
router.delete("/:id", deleteQuiz);

router.get("/join/:code",
    rateLimit({
        windowInSeconds:30,
        maxRequests:10
    }),
    joinQuizByCode);

export default router;