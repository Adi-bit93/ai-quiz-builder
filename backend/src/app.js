import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();
app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials: true 
}));


app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({ extended: true , limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import authRoutes from './routes/auth.routes.js';
import quizRoutes from './routes/quiz.routes.js';

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/quizzes", quizRoutes);



export { app }