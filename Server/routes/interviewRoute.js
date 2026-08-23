import express from "express"
import { upload } from "../middleware/multer.js";
import { analyzeResume } from "../controllers/interviewController.js";
import isAuth from "../middleware/isAuth.js";


const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);

export default interviewRouter;