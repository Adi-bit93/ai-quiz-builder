import { Quiz } from '../models/Quiz.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateMockQuestions } from '../services/ai.services.js';

const createQuiz = asyncHandler(async (req, res) => {
    const {title, topic, difficulty, questionCount, timerMode, timerSeconds} = req.body;

    if (!title || !topic || !questionCount)  {
        throw new ApiError(500, "All fields are required");
    }

    const questions = generateMockQuestions({topic, difficulty, questionCount});
    if (!questions || questions.length === 0) {
        throw new ApiError(500, "Failed to generate questions");
    }

    const quiz = await Quiz.create({
        ownerId: req.user._id,
        title,
        topic,
        difficulty: difficulty || "medium",
        timerMode: timerMode || "quiz",
        timerSeconds: timerSeconds || 600,
        questions
    });

    return res
        .status(201)
        .json(new ApiResponse(201, quiz,"Quiz created successfully"))
});

const getQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({
        ownerId:req.user?._id
    }).sort({createdAt: -1});

    return res 
        .status(200)
        .json(new ApiResponse(200, quizzes, "Quizzes fetched successfully"))
});

const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findOne(
        {
            _id: req.params.id,
            ownerId: req.user?._id
        }
    );

    if(!quiz) throw new ApiError(404, "Quiz not found");

    return res
        .status(200)
        .json(new ApiResponse(200, quiz, "Quiz fetched successfully"));
});

const updateQuiz = asyncHandler(async (req, res) => {
    const { title, topic, difficulty, questionCount, timerMode, timerSeconds } = req.body;

    const quiz = await Quiz.findOneAndUpdate(
        {
            _id: req.params.id,
            ownerId: req.user?._id
        },
        {
            title,
            topic,
            difficulty,
            questionCount,
            timerMode,
            timerSeconds
        },
        { new: true }
    );

    if (!quiz) throw new ApiError(404, "Quiz not found");

    return res
        .status(200)
        .json(new ApiResponse(200, quiz, "Quiz updated successfully"));
});

const publishQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findOne({
        _id: req.params.id,
        ownerId: req.user?._id
    });

    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    if(quiz.status !== 'draft') throw new ApiError(400, "Quiz already published/archived");

   quiz.status = 'published';
   await quiz.save();

   return res
       .status(200)
       .json(new ApiResponse(200, quiz, "Quiz published successfully"));
});


export {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,

}

