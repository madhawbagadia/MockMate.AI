import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FaTimes } from "react-icons/fa";
import Auth from "../pages/Auth";

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    if (userData) {
      onClose();
    }
  }, [userData, onClose]);
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md">
        <Auth isModel={true} onClose={onClose} />
      </div>
    </div>
  );
}

export default AuthModel;