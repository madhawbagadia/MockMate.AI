import React, { useEffect } from "react";
import { motion } from "motion/react";
import femaleVideo from "../assets/videos/female-ai.mp4";
import maleVideo from "../assets/videos/male-ai.mp4";
import Timer from "./Timer";
import { useState, useRef } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import { useReactMediaRecorder } from "react-media-recorder";
import {
  FaMicrophone,
  FaStop,
  FaPause,
  FaPlay,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaCode,
  FaTerminal,
} from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";
import { ServerURL } from "../App";
const Step2Interview = ({ interviewData, onFinish }) => {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);

  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [isCamOn, setIsCamOn] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const userVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const toggleCamera = async () => {
    if (isCamOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsCamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        mediaStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        setIsCamOn(true);
      } catch (err) {
        alert("Camera permission denied or camera not available.");
      }
    }
  };

  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try male voices
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first available voice
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();

    // Fix for browsers where voices load later
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // return () => {
    //   window.speechSynthesis.onvoiceschanged = null;
    // };
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;
  /* ---------------- SPEAK FUNCTION ---------------- */

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92; // slightly slower than normal
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);
        if (isMicOn) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };
      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName},it's great to meet you today. I hope you're feeling confident and ready.`,
        );
        await speakText(
          "I'll ask you a few question .just answer naturally, and take your time.lets begin.",
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (isSubmitting) return;
    if (isAIPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting, isAIPlaying]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const submitAnswer = async () => {
    if (isSubmitting) return;

    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerURL + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );

      setFeedback(result.data.feedback);

      await speakText(result.data.feedback);

      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);

    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(true);

    try {
      const result = await axios.post(
        ServerURL + "/api/interview/finish-interview",
        { interviewId },
        { withCredentials: true },
      );
      console.log(result.data);

      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/* video section */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative bg-black">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
              🤖 AI Interviewer
            </span>
          </div>

          {/* Candidate Webcam Feed */}
          {isCamOn && (
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-md relative bg-gray-900 border border-emerald-500/30">
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-40 object-cover scale-x-[-1]"
              />
              <span className="absolute bottom-2 left-2 bg-emerald-600/80 backdrop-blur-md text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                📹 You (Live Feed)
              </span>
            </div>
          )}

          {/* subtitle */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* timer Area */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>

              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600">
                  {isAIPlaying ? "AI speaking..." : ""}
                </span>
              )}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-400 block">Current Question</span>
              </div>

              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-400 block">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text / Code Answer Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-600">
              AI Smart Interview
            </h2>

            {/* Mode Switchers: Microphone, Camera, Code Editor */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleCamera}
                whileTap={{ scale: 0.95 }}
                title={isCamOn ? "Turn Camera Off" : "Turn Camera On"}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition ${
                  isCamOn
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {isCamOn ? <FaVideo size={14} /> : <FaVideoSlash size={14} />}
                <span>{isCamOn ? "Cam On" : "Cam Off"}</span>
              </motion.button>

              <motion.button
                onClick={() => setIsCodeMode(!isCodeMode)}
                whileTap={{ scale: 0.95 }}
                title="Toggle Code Editor View"
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition ${
                  isCodeMode
                    ? "bg-purple-100 text-purple-700 border-purple-300"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                <FaCode size={14} />
                <span>{isCodeMode ? "Text Mode" : "Code View"}</span>
              </motion.button>
            </div>
          </div>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 text-emerald-800">
                  {currentQuestion?.difficulty || "Medium"}
                </span>
              </div>

              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}

          {/* Answer Box (Text Area vs Code Editor View) */}
          {isCodeMode ? (
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-gray-800 shadow-lg bg-gray-950">
              <div className="bg-gray-900 px-4 py-2.5 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                  <FaTerminal className="text-purple-400" />
                  <span>Code Editor</span>
                </div>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="bg-gray-800 text-gray-200 text-xs px-3 py-1 rounded-lg border border-gray-700 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <textarea
                onChange={(e) => setAnswer(e.target.value)}
                value={answer}
                placeholder={`// Write your ${codeLanguage} solution here...\nfunction solution() {\n  // Your code\n}`}
                className="flex-1 bg-gray-950 text-emerald-400 p-4 font-mono text-sm resize-none outline-none leading-relaxed"
              />
            </div>
          ) : (
            <textarea
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              placeholder="Type or speak your answer here..."
              className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
            />
          )}
          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </motion.button>
              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled: bg-gray-500"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition"
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Interview;