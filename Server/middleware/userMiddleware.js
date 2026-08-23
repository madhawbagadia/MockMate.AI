import jwt from "jsonwebtoken";
import User from "../models/user.js";
import redisClient from "../config/redis.js";

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Token is not present");
    }

    // Check if token is blacklisted
    const isBlocked = await redisClient.exists(`token:${token}`);

    if (isBlocked) {
      throw new Error("Invalid Token");
    }

    // Verify JWT
    const payload = jwt.verify(token,process.env.JWT_SECRET_KEY);

    const { _id } = payload;

    if (!_id) {
      throw new Error("Invalid token");
    }

    // Find user
    const result = await User.findById(_id);

    if (!result) {
      throw new Error("User doesn't exist");
    }

    req.result = result;

    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message,
    });
  }
};

export default userMiddleware;