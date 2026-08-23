import React from "react";
import { FaTimes } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { motion } from "motion/react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { ServerURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Auth({ isModel = false, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      let User = response.user;
      let name = User.displayName;
      let email = User.email;
      const result = await axios.post(
        ServerURL + "/api/auth/google",
        { name, email },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data));
      if (isModel && onClose) {
        onClose();
      } else {
        navigate("/");
      }
      console.log(response);
    } catch (error) {
      console.error("Google Auth error:", error);
      alert(error.message || "Failed to sign in with Google.");
      dispatch(setUserData(null));
    }
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className={`
                w-full relative
                ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-4xl"}
                bg-white shadow-2xl border border-gray-200
            `}
      >
        {isModel && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-800 hover:text-black text-xl"
          >
            <FaTimes size={18} />
          </button>
        )}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg">MockMate.AI</h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue with
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress, and
          unlock detailed performance insights.
        </p>

        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
        >
          <FcGoogle size={20} />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Auth;