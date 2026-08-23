import express from "express";
import { googleAuth, logOut } from "../controllers/authenticate.js";   
const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.get("/logout", logOut);

export default authRouter;
