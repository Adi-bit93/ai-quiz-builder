import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})
connectDB().then(() =>{
    app.listen(process.env.PORT || 5000)
    console.log(`server is running at port : ${process.env.PORT}`);
}).catch((err) =>{
    console.log("MongoDB connection failed!", err);
    
})


// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("AI Quiz Builder Backend Running")
// });
// const PORT = process.env.PORT
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// })
 