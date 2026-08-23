import { BsRobot } from "react-icons/bs";

function Footer() {
  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pb-10 pt-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-gray-200 py-8 px-6 text-center">
        
        <div className="flex justify-center items-center gap-3 mb-3">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={16} />
          </div>

          <h2 className="font-semibold">MockMate.AI</h2>
        </div>

        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          AI-powered interview preparation platform designed to improve
          communication skills, technical depth and professional confidence.
        </p>

        <div className="border-t border-gray-200 mt-6 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-gray-400">
            © 2026 MockMate.AI. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="/terms"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Terms & Conditions
            </a>

            <a
              href="/privacy"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Footer;