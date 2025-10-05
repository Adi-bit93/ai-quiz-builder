import express from 'express';
import {
    createQuiz,
    getQuizById,
    getQuizzes,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    joinQuizByCode,
    generateQuizAI,
    getQuizByCode
} from '../controllers/quiz.controller.js';

import { protect } from '../middlewares/auth.middleware.js';
import { rateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

router.get("/join/:code",
    rateLimit({
        windowInSeconds:30,
        maxRequests:10
    }),
    joinQuizByCode);
    router.get("/code/:code", getQuizByCode);

router.use(protect);

//AI Quiz Generator
router.post("/ai/generate", 
    rateLimit({
        windowInSeconds: 60,
        maxRequests: 3,
    }),
    generateQuizAI
)

router.post("/",
    rateLimit({
        windowInSeconds: 60,
        maxRequests: 5
    }),
    createQuiz
);
router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.put("/:id/update", updateQuiz);
router.patch("/:id/publish",
    rateLimit({
        windowInSeconds: 60,
        maxRequests: 3
    }),
    publishQuiz
);
router.delete("/:id", deleteQuiz);



export default router;