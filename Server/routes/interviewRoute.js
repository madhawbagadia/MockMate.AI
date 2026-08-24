import express from "express"
import { upload } from "../middleware/multer.js";
import { analyzeResume, finishInterview, generateQuestion, submitAnswer } from "../controllers/interviewController.js";
import isAuth from "../middleware/isAuth.js";


const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);
interviewRouter.post("/generate-question", isAuth, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish-interview", isAuth, finishInterview);

export default interviewRouter;