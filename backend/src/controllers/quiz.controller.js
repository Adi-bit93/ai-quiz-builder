import { Quiz } from '../models/Quiz.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateMockQuestions } from '../services/ai.services.js';
import options from 'sanitize-html';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Helper: try to parse JSON from AI text (handles extra text/markdown)
// function tryParseJSON(text) {
//   if (!text || typeof text !== "string") return null;
//   // direct parse
//   try {
//     return JSON.parse(text);
//   } catch (e) {
//     // fallback: extract first {...} block
//     const m = text.match(/(\{[\s\S]*\})/);
//     if (!m) return null;
//     try {
//       return JSON.parse(m[1]);
//     } catch (e2) {
//       return null;
//     }
//   }
// }

// // Normalize & validate questions
// function normalizeQuestions(rawQuestions) {
//   if (!Array.isArray(rawQuestions)) throw new ApiError(500, "AI returned unexpected questions format");

//   return rawQuestions.map((q, idx) => {
//     // accept multiple possible field names for robustness
//     const text = (q.text || q.question || q.prompt || "").toString().trim();
//     const options = Array.isArray(q.options) ? q.options.map(String) : [];
//     // find numeric correct index or try to infer from "answer"/"correct" string
//     let correctIndex = Number.isInteger(q.correctIndex) ? q.correctIndex : undefined;
//     if (correctIndex === undefined && typeof q.correct === "number") correctIndex = q.correct;
//     if (correctIndex === undefined && typeof q.correct === "string") {
//       const idxFound = options.findIndex((o) => o.trim().toLowerCase() === q.correct.trim().toLowerCase());
//       if (idxFound >= 0) correctIndex = idxFound;
//     }

//     // final validations
//     if (!text) throw new ApiError(500, `Question ${idx + 1} is missing text`);
//     if (!Array.isArray(options) || options.length < 2) throw new ApiError(500, `Question ${idx + 1} must have at least 2 options`);
//     // Ensure max 4 options (model may produce different counts) - keep as is or trim
//     if (options.length > 4) options.length = 4;
//     if (correctIndex === undefined || correctIndex < 0 || correctIndex >= options.length) {
//       // try to infer if there's an "answer" field with option text
//       if (q.answer && typeof q.answer === "string") {
//         const inferred = options.findIndex((o) => o.trim().toLowerCase() === q.answer.trim().toLowerCase());
//         if (inferred >= 0) {
//           correctIndex = inferred;
//         } else {
//           throw new ApiError(500, `Question ${idx + 1} has invalid correctIndex/answer`);
//         }
//       } else {
//         throw new ApiError(500, `Question ${idx + 1} has invalid correctIndex`);
//       }
//     }

//     return {
//       text,
//       options,
//       correctIndex,
//     };
//   });
// }
const generateQuizAI = asyncHandler(async (req, res) => {
  const { topic, difficulty, questionCount } = req.body;
  const ownerId = req.user._id;

  if (!topic || !difficulty || !questionCount) {
    throw new ApiError(400, "Topic, difficulty and questionCount are required");
  }

  const prompt = `Generate ${questionCount} multiple-choice questions on topic "${topic}".
  Difficulty: ${difficulty}.
  Each question must have:
  - text
  - 4 options
  - correctIndex (0-3)
  Respond ONLY in strict JSON like:
  {
    "questions": [
      { "text": "...", "options": ["..","..","..",".."], "correctIndex": 1 }
    ]
  }`;

  let aiQuestions;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    // Get text output safely
    let raw = result.response.text();

    // Try parsing JSON from AI output
    raw = raw.replace(/```json|```/g, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error("Raw AI output (no JSON found):", raw);
        throw new Error("AI did not return JSON");
    }
    let parsed;
    try {
        parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error("Raw AI output (invalid JSON):", raw);
        throw new Error("AI did not return valid json");
    }
    aiQuestions = parsed.questions;
    if (!aiQuestions || !Array.isArray(aiQuestions)) {
      throw new Error("Invalid AI response format");
    }
  } catch (error) {
    console.error("AI generation failed:", error);
    throw new ApiError(500, "Failed to generate quiz via AI");
  }

  // save quiz in DB
  const quiz = await Quiz.create({
    ownerId,
    title: `${topic} Quiz`,
    topic,
    difficulty,
    questionCount,
    questions: aiQuestions,
    status: "draft",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, quiz, "Quiz generated and saved successfully"));
});



 

const createQuiz = asyncHandler(async (req, res) => {
    const { title, topic, difficulty, questionCount, timerMode, timerSeconds } = req.body;

    if (!title || !topic || !questionCount) {
        throw new ApiError(500, "All fields are required");
    }

    const questions = generateMockQuestions({ topic, difficulty, questionCount });
    if (!questions || questions.length === 0) {
        throw new ApiError(500, "Failed to generate questions");
    }

    const quiz = await Quiz.create({
        ownerId: req.user._id,
        title,
        topic,
        questionCount,
        difficulty: difficulty || "medium",
        timerMode: timerMode || "quiz",
        timerSeconds: timerSeconds || 600,
        questions
    });

    return res
        .status(201)
        .json(new ApiResponse(201, quiz, "Quiz created successfully"))
});

const getQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({
        ownerId: req.user?._id
    }).sort({ createdAt: -1 });

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

    if (!quiz) throw new ApiError(404, "Quiz not found");

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

    if (quiz.status !== 'draft') throw new ApiError(400, "Quiz already published/archived");

    quiz.status = 'published';
    await quiz.save();

    return res
        .status(200)
        .json(new ApiResponse(200, quiz, "Quiz published successfully"));
});

const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findOneAndDelete({
        _id: req.params.id,
        ownerId: req.user?._id
    });

    if (!quiz) throw new ApiError(404, "Quiz not found");

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Quiz deleted successfuly"))
});

const joinQuizByCode = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findOne({
        code: req.params.code,
        status: "published"
    });

    if (!quiz) {
        throw new ApiError(404, "Quiz not found or not available");
    }

    const safeQuiz = quiz.toObject();
    safeQuiz.questions = safeQuiz.questions.map((q) => ({
        text: q.text,
        options: q.options
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, safeQuiz, "Quiz joined successfully"));
});


export {
    generateQuizAI,
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    joinQuizByCode,
}

