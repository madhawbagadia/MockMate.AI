import User from "../models/user.js";
import genToken from "../config/token.js";
import redisClient from "../config/redis.js";
import jwt from "jsonwebtoken";

export const googleAuth = async (req,res) => {

  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
      });
    }

    let token = await genToken(user._id);
    // const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Google Auth error " });
  }
};

export const logOut = async (req, res) => {
  try {
    // const isProduction = process.env.NODE_ENV === "production";
    const { token } = req.cookies;

    if (!token) {
      return res.status(200).json({message: "User already logged out"});
    }

    const payload = jwt.verify(token,process.env.JWT_SECRET_KEY);

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`,payload.exp);

    res.clearCookie("token", {
      // httpOnly: true,
      // secure: isProduction,
      // sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      message: "User logged out successfully",
    });

  } catch (err) {
    console.log(err);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
