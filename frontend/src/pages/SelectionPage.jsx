import React from "react";
import { Link } from "react-router-dom";

// --- ICONS ---

// Card-specific header icons
const AnalyzeWithJDIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 mb-4 text-indigo-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

const AnalyzeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 mb-4 text-teal-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 10-4.243-4.242 3 3 0 004.243 4.242z"
    />
  </svg>
);

// Feature list icons
const FeatureIcon = ({ d }) => (
  <svg
    className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d={d}
    ></path>
  </svg>
);

const FeatureListItem = ({ iconPath, text }) => (
  <li className="flex items-center">
    <FeatureIcon d={iconPath} />
    <span className="text-slate-300">{text}</span>
  </li>
);

const SelectionPage = () => {
  return (
    <div className="bg-[#05041E] text-white min-h-screen flex items-center justify-center p-4 selection-page-bg">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Resume Analysis Hub
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Choose your path to a standout resume and unlock new opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Option 1: Analyze Resume with Job Description */}
          <div className="glass-card group p-8 flex flex-col text-center rounded-2xl transition-all duration-300 hover:border-indigo-500/80 hover:shadow-2xl hover:shadow-indigo-500/20 transform hover:-translate-y-2">
            <div className="flex-shrink-0 mb-6">
              <AnalyzeWithJDIcon />
              <h2 className="text-2xl font-bold text-white">
                Analyze with Job Description
              </h2>
            </div>
            <ul className="text-left space-y-4 mb-8 flex-grow">
              <FeatureListItem
                iconPath="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                text="In-depth keyword & ATS match score"
              />
              <FeatureListItem
                iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                text="Pinpoint missing skills and qualifications"
              />
              <FeatureListItem
                iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                text="Actionable, role-specific improvement tips"
              />
            </ul>
            <Link
              to="/analyze-jd"
              className="w-full btn-primary text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg text-center transition-all duration-300 group-hover:shadow-indigo-500/40"
            >
              Start Targeted Analysis
            </Link>
          </div>

          {/* Option 2: Analyze Resume without Job Description */}
          <div className="glass-card group p-8 flex flex-col text-center rounded-2xl transition-all duration-300 hover:border-teal-500/80 hover:shadow-2xl hover:shadow-teal-500/20 transform hover:-translate-y-2">
            <div className="flex-shrink-0 mb-6">
              <AnalyzeIcon />
              <h2 className="text-2xl font-bold text-white">
                General Resume Analysis
              </h2>
            </div>
            <ul className="text-left space-y-4 mb-8 flex-grow">
              <FeatureListItem
                iconPath="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                text="Get instant feedback on strengths & weaknesses"
              />
              <FeatureListItem
                iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                text="Evaluates formatting & use of action verbs"
              />
              <FeatureListItem
                iconPath="M21 13.255A23.931 23.931 0 0112 15c-3.18 0-6.168-.53-9-1.545"
                text="Recommends relevant jobs, internships & courses"
              />
            </ul>
            <Link
              to="/analyze-resume"
              className="w-full btn-primary text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg text-center transition-all duration-300 group-hover:shadow-indigo-500/40"
            >
              Start General Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionPage;
