import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerURL } from "../App";
import { FaArrowLeft } from "react-icons/fa";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerURL + "/api/interview/get-interviews",
          {
            withCredentials: true,
          },
        );
        setInterviews(result.data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    };
    getMyInterviews();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      await axios.delete(
        ServerURL + `/api/interview/delete/${deleteId}`,
        {
          withCredentials: true,
        }
      );

      setInterviews((prev) =>
        prev.filter((item) => item._id !== deleteId)
      );

      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting interview:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete interview."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10">
      <div className="w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto">
        <div className="mb-10 w-full flex items-start gap-4">
          <button
            onClick={() => navigate("/")}
            className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview History
            </h1>
            <p className="text-gray-500 mt-2">
              Track your past interviews and performance reports
            </p>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500">
              No interviews found. Start your first interview.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((item, index) => (
              <div
                key={item._id}
                onClick={() => navigate(`/report/${item._id}`)}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.role}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {item.experience} • {item.mode}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* SCORE */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {item.finalScore || 0}/10
                      </p>

                      <p className="text-xs text-gray-400">Overall Score</p>
                    </div>

                    {/* STATUS BADGE */}
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-medium ${
                        item.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* DELETE */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(item._id);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl shrink-0">
                ⚠️
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Delete Interview?
                </h2>

                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Are you sure you want to delete this interview?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;