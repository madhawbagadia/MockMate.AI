import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import askAI from "../services/openRouter.js"
import User from "../models/user.js";
import Interview from "../models/interviewModel.js";

export const analyzeResume = async(req,res)=>{

    try{
        if(!req.file){
            return res.status(400).json({message:"Resume required"});
        }
        const filepath = req.file.path;   // Multer ne jo file save ki hai, uska path mil raha hai.

        const fileBuffer = await fs.promises.readFile(filepath);  // Ye PDF file ko read karta hai.
        const uint8Array = new Uint8Array(fileBuffer);  //PDF.js ko PDF data ek byte array format mein chahiye.

        const pdf = await pdfjsLib.getDocument({data:uint8Array}).promise;  // Ye PDF.js ko bol raha hai:"Is byte data se PDF load karo."

        let resumeText = "";

        // Extract text from allpages
        for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++){
            const page = await pdf.getPage(pageNum);  // page deta hai.
            const content = await page.getTextContent();  // Ye page ke andar jo text hai uski information deta hai.

            const pageText = content.items.map(item => item.str).join(" ");

            resumeText += pageText + " ";
        }

        resumeText = resumeText.replace(/\s+/g," ").trim();

        const messages = [     // AI: Resume ko analyze karo aur sirf specified JSON format mein result do.
        {
            role: "system",
            content: ` Extract structured data from resume.
                        Return strictly JSON:
                        {
                            "role": "string",
                            "experience": "string",
                            "projects": ["project1", "project2"],
                            "skills": ["skill1", "skill2"]
                        }`,
        },
        {
            role: "user",
            content: resumeText,
        },
        ];

        const aiResponse = await askAI(messages);

        if (!aiResponse || !aiResponse.trim()) {
          return res.status(500).json({
            message: "AI returned empty response.",
          });
        }

        const cleanResponse = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleanResponse);   // String ko JavaScript object mein convert karna

        fs.unlinkSync(filepath);

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        });
    }
    catch(err)
    {
        console.log("Error: "+err.message);

        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({message:err.message});
    }
}


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode are required.",
      });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    if (user.credits < 50) {
      return res.status(400).json({message: "Not enough credits. Minimum 50 required."});
    }
    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
        You are an expert interviewer.
        Generate 5 interview questions based on the following details:

        Role: ${role}
        Experience: ${experience}
        InterviewMode: ${mode}
        Projects: ${projectText}
        Skills: ${skillsText}
        Resume: ${safeResume} `;

    if (!userPrompt.trim()) {
      return res.status(400).json({message: "Prompt content is empty."});
    }

    const messages = [
      {
        role: "system",
        content: `
            You are an expert tech lead and human interviewer conducting a professional ${mode} interview.
            Speak in simple, natural English directly to the candidate.

            Generate exactly 5 interview questions.

            Rules by Interview Mode:
            - If mode is "Coding": generate realistic algorithmic/data structure coding problems or coding challenges.
            - If mode is "Behavioral": generate STAR-method (Situation, Task, Action, Result) scenario questions.
            - If mode is "Technical": generate core architecture, technical concepts, and problem-solving questions.
            - If mode is "HR": generate cultural fit, teamwork, and career goal questions.

            Strict Rules:
            - Each question must be clear, concise, and realistic.
            - Do NOT number them.
            - Do NOT add explanations or markdown headers.
            - One question per line only.

            Difficulty progression:
            Question 1 -> easy
            Question 2 -> easy
            Question 3 -> medium
            Question 4 -> medium
            Question 5 -> hard
            `,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAI(messages);
    // console.log("AI RESPONSE:", aiResponse);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({message: "AI returned empty response."});
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({message: "AI failed to generate questions."});
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
  console.error("GENERATE QUESTION ERROR:", error);

  return res.status(500).json({
    message: error.message,
  });
}
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;
    const interview = await Interview.findById(interviewId);
    const question = interview.questions[questionIndex];
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not answer the question.";
      question.answer = " ";
      await interview.save();
      return res.json({feedback: question.feedback});
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not submitted.";
      question.answer = answer;

      await interview.save();

      return res.json({feedback: question.feedback});
    }
    const messages = [
      {
        role: "system",
        content: `
            You are a professional human interviewer evaluating a candidate's answer in a real interview.

            Evaluate naturally and fairly, like a real person would.

            Score the answer in these areas (0 to 10):

            1. Confidence - Does the answer sound clear, confident, and well-presented?
            2. Communication - Is the language simple, clear, and easy to understand?
            3. Correctness - Is the answer accurate, relevant, and complete?

            Rules:
            - Be realistic and unbiased.
            - Do not give random high scores.
            - If the answer is weak, score low.
            - If the answer is strong and detailed, score high.
            - Consider clarity, structure, and relevance.

            Calculate:
            finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

            Feedback Rules:
            - Write natural human feedback.
            - 10 to 15 words only.
            - Sound like real interview feedback.
            - Can suggest improvement if needed.
            - Do NOT repeat the question.
            - Do NOT explain scoring.
            - Keep tone professional and honest.

            Return ONLY valid JSON in this format:

            {
            "confidence": number,
            "communication": number,
            "correctness": number,
            "finalScore": number,
            "feedback": "short human feedback"
            }
            `,
      },
      {
        role: "user",
        content: `
            Question: ${question.question}
            Answer: ${answer} `,
      },
    ];
    const aiResponse = await askAI(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    const cleanResponse = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanResponse);

    question.answer = answer;
    question.feedback = parsed.feedback;
    question.score = parsed.finalScore;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;

    await interview.save();

    return res.status(200).json({
      feedback: parsed.feedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to submit answer ${error}`,
    });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        message: "Failed to find interview",
      });
    }
    const totalQuestion = interview.questions.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const finalScore = totalQuestion ? totalScore / totalQuestion : 0;
    const avgConfidence = totalQuestion ? totalConfidence / totalQuestion : 0;
    const avgCommunication = totalQuestion
      ? totalCommunication / totalQuestion
      : 0;
    const avgCorrectness = totalQuestion ? totalCorrectness / totalQuestion : 0;
    interview.finalScore = finalScore;
    interview.status = "completed";
    await interview.save();
    return res.status(200).json({
      finalScore: Number(finalScore).toFixed(1),
      confidence: Number(avgConfidence).toFixed(1),
      communication: Number(avgCommunication).toFixed(1),
      correctness: Number(avgCorrectness).toFixed(1),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        feedback: q.feedback || "",
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to finish interview ${error}`,
    });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");
    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({
      message: `failed to get current user interviews ${error}`,
    });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      message: "Interview deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE INTERVIEW ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    const totalQuestion = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    let totalScore = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
      totalScore += q.score || 0;
    });
    const finalScore = totalQuestion ? totalScore / totalQuestion : 0;
    const avgConfidence = totalQuestion ? totalConfidence / totalQuestion : 0;
    const avgCommunication = totalQuestion ? totalCommunication / totalQuestion : 0;
    const avgCorrectness = totalQuestion ? totalCorrectness / totalQuestion : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to find currentuser interview  ${error}` });
  }
};
