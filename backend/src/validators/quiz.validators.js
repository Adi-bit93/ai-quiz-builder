import { z } from "zod";

export const generateSchema = z.object({
    topic: z.string().min(3).max(160),
    difficulty: z.enum(["easy", "medium", "hard"]),
    questionCount: z.number().int().min(1).max(30)
});

const questionSchema = z.object({
    text: z.string().trim().min(3),
    options: z.array(z.string().trim().min(1)).min(2),
    correctIndex: z.number().int().nonnegative()
}).refine((q) => q.correctIndex < q.options.length, {
    message: "correctIndex must be within options range",
    path: ["correctIndex"]
});

export const createQuizSchema = z.object({
    title: z.string()
        .trim()
        .min(3)
        .max(160),
    topic: z.string()
        .trim()
        .min(3)
        .max(160),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    questionCount: z.number()
                .int()
                .min(1)
                .max(50),
    timerMode: z.enum(["quiz", "per-question"]).default("quiz"),
    timerSeconds: z.number()
        .int()
        .min(10)
        .max(3600)
        .default(600),
    scoring: z.object({
        correct: z.number()
            .int()
            .default(4),
        speedBonus: z.number()
            .int()
            .default(0),
        wrongPenalty: z.number()
            .int()
            .default(0),
    }).optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    questions: z.array(questionSchema).min(1),
})