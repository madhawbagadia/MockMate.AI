import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Token is not present");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);

    if (isBlocked) {
      throw new Error("Token is blocked by Redis");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = payload.userId;

    if (!userId) {
      throw new Error("userId missing from token");
    }

    req.userId = userId;

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message);

    return res.status(401).json({
      message: err.message,
    });
  }
};

export default isAuth;