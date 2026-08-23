import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from "../services/openRouter.js";

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
        const parsed = JSON.parse(aiResponse);   // String ko JavaScript object mein convert karna

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