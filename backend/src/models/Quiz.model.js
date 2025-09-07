import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
    {
        text: {
            type:String,
            required: true,
            trim: true
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length >= 2,
                message: "At least 2 options required",
            },
        },
        correctIndex: {
            type: Number,
            required: true,
            validate: {
                validator(value){
                    return Number.isInteger(value) && value >= 0 && value < this.options.length;
                },
                message: "correctIndex must point to an existing options",
            },
        },
    },
    {_id: false}
);

const QuizSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 160
        },
        topic: {
            type: String,
            required: true,
            trim: true,
            maxlength: 160
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium", 
            index: true
        },
        questionCount: {
            type: Number,
            min: 1,
            max: 50,
            required: true
        },
        timerMode: {
            type: String, 
            enum: ["quiz", "per-question"],
            default: "per-question"
        },
        timerSeconds: {
            type: Number,
            min: 1, 
            max: 3500, 
            default: 10
        },
        scoring: {
            correct: {type: Number, default: 4},
            speedBonus: {type: Number, default: 1},
            wrongPenalty: {type: Number, default: 0},
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true 
        },
        code: {
            type: String,
            unique: true,
            sparse: true
        },
        questions: {type: [QuestionSchema], default: []}
    }, {timestamps: true}
);
QuizSchema.pre("save", function(next) {
    if(!this.code){
        this.code = Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    next();
});

export const Quiz = mongoose.model("Quiz", QuizSchema);