import React, { useEffect, useRef, useState } from "react";

// --- HELPER & UI COMPONENTS (No changes here) ---
const ScoreDonut = ({ score }) => {
  const size = 160;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = circumference - (score / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  const scoreColor =
    score >= 80
      ? "text-teal-400"
      : score >= 60
      ? "text-indigo-400"
      : "text-amber-400";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-slate-700/50"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          className={scoreColor}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs font-medium text-slate-400 tracking-widest">
          SCORE
        </span>
      </div>
    </div>
  );
};

const InfoListCard = ({ title, items }) => (
  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 shadow-lg rounded-2xl p-6 h-auto">
    <h3 className="text-xl font-bold text-white mb-5">{title}</h3>
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <svg
            className="w-5 h-5 text-indigo-400 mr-3 mt-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-slate-300">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// --- NEW: Reusable Card Components from other files ---
const JobCard = ({
  companyLogo,
  companyName,
  jobTitle,
  address,
  applyLink,
  postDate,
}) => {
  const [postedAgo, setPostedAgo] = useState("");

  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!postDate || postDate === "N/A") {
        setPostedAgo("Date not available");
        return;
      }
      const jobPostDate = new Date(postDate);
      const now = new Date();

      if (jobPostDate > now) {
        setPostedAgo("Future posting");
        return;
      }

      const timeDiff = now.getTime() - jobPostDate.getTime();
      const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysAgo < 0) {
        setPostedAgo(`Future posting`);
      } else if (daysAgo === 0) {
        setPostedAgo("Posted today");
      } else if (daysAgo === 1) {
        setPostedAgo("Posted 1 day ago");
      } else {
        setPostedAgo(`Posted ${daysAgo} days ago`);
      }
    };
    calculateTimeAgo();
  }, [postDate]);

  return (
    <div className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/60 hover:border-indigo-500 transition-all transform hover:-translate-y-1 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <img
          className="w-12 h-12 rounded-full mr-4 object-cover bg-gray-700"
          src={companyLogo}
          alt={`${companyName} Logo`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/100x100/374151/E5E7EB?text=Logo";
          }}
        />
        <div>
          <h5 className="text-lg font-bold text-white">{companyName}</h5>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-indigo-300 mb-3 flex-grow min-h-[56px]">
        {jobTitle}
      </h3>
      <div className="text-sm text-gray-400 mb-2">{address}</div>
      <div className="text-xs text-gray-500 mb-4">{postedAgo}</div>
      <a
        href={applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-white font-bold py-3 px-5 rounded-full text-center mt-auto"
      >
        View Job &rarr;
      </a>
    </div>
  );
};

const InternshipCard = ({
  companyLogo,
  companyName,
  internshipTitle,
  address,
  applyLink,
  postDate,
}) => {
  const [postedAgo, setPostedAgo] = useState("");

  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!postDate || postDate === "N/A") {
        setPostedAgo("Date not available");
        return;
      }
      const jobPostDate = new Date(postDate);
      const now = new Date();

      if (jobPostDate > now) {
        setPostedAgo("Future posting");
        return;
      }

      const timeDiff = now.getTime() - jobPostDate.getTime();
      const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysAgo < 0) {
        setPostedAgo("Future posting");
      } else if (daysAgo === 0) {
        setPostedAgo("Posted today");
      } else if (daysAgo === 1) {
        setPostedAgo("Posted 1 day ago");
      } else {
        setPostedAgo(`Posted ${daysAgo} days ago`);
      }
    };
    calculateTimeAgo();
  }, [postDate]);

  return (
    <div className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/60 hover:border-indigo-500 transition-all transform hover:-translate-y-1 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <img
          className="w-12 h-12 rounded-full mr-4 object-cover bg-gray-700"
          src={companyLogo}
          alt={`${companyName} Logo`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/100x100/374151/E5E7EB?text=Logo";
          }}
        />
        <div>
          <h5 className="text-lg font-bold text-white">{companyName}</h5>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-indigo-300 mb-3 flex-grow min-h-[56px]">
        {internshipTitle}
      </h3>
      <div className="text-sm text-gray-400 mb-2">{address}</div>
      <div className="text-xs text-gray-500 mb-4">{postedAgo}</div>
      <a
        href={applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-white font-bold py-3 px-5 rounded-full text-center mt-auto"
      >
        View Internship &rarr;
      </a>
    </div>
  );
};

const CourseCard = ({ title, provider, link }) => {
  return (
    <div className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/60 hover:border-indigo-500 transition-all transform hover:-translate-y-1 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <img
          className="w-12 h-12 rounded-full mr-4 object-cover bg-gray-700"
          src={`https://logo.clearbit.com/${provider
            .toLowerCase()
            .replace(/\s/g, "")
            .replace(/[&.]/g, "")}.com`}
          alt={`${provider} Logo`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/100x100/374151/E5E7EB?text=Logo";
          }}
        />
        <h5 className="text-md font-semibold text-gray-300">{provider}</h5>
      </div>
      <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex-grow min-h-[84px]">
        {title}
      </h3>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-white font-bold py-3 px-5 rounded-full text-center mt-auto"
      >
        View Course &rarr;
      </a>
    </div>
  );
};

// --- NEW: Modular Section for Jobs ---
const JobsSection = () => {
  const [jobs, setJobs] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dropdown?source=jobs`);
        if (!response.ok) throw new Error("Failed to fetch keywords");
        const data = await response.json();
        setKeywords(data.keywords || []);
      } catch (err) {
        setError("Could not load job categories.", err);
      }
    };
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (!selectedKeyword) {
      setJobs([]);
      return;
    }
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/dropdown/data?source=jobs&keyword=${encodeURIComponent(
            selectedKeyword
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data.results || []);
      } catch (err) {
        setError(`Failed to load jobs for "${selectedKeyword}".`, err);
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [selectedKeyword]);

  return (
    <div>
      <div className="max-w-md mx-auto mb-8">
        <select
          onChange={(e) => setSelectedKeyword(e.target.value)}
          value={selectedKeyword}
          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
          disabled={keywords.length === 0}
        >
          <option value="">
            {keywords.length > 0
              ? "Select a job category..."
              : "Loading categories..."}
          </option>
          {keywords.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <p className="text-center">Loading jobs...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      {!isLoading && !error && selectedKeyword && jobs.length === 0 && (
        <p className="text-center text-slate-400">
          No jobs found for "{selectedKeyword}".
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            companyLogo={`https://logo.clearbit.com/${job.company
              .toLowerCase()
              .replace(/\s/g, "")
              .replace(/,/g, "")}.com`}
            companyName={job.company}
            jobTitle={job.title}
            address={job.location}
            applyLink={job.url}
            postDate={job.posted_datetime}
          />
        ))}
      </div>
    </div>
  );
};

// --- NEW: Modular Section for Internships ---
const InternshipsSection = () => {
  const [internships, setInternships] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/dropdown?source=internships`
        );
        if (!response.ok) throw new Error("Failed to fetch keywords");
        const data = await response.json();
        setKeywords(data.keywords || []);
      } catch (err) {
        setError("Could not load internship categories.", err);
      }
    };
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (!selectedKeyword) {
      setInternships([]);
      return;
    }
    const fetchInternships = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/dropdown/data?source=internships&keyword=${encodeURIComponent(
            selectedKeyword
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch internships");
        const data = await response.json();
        setInternships(data.results || []);
      } catch (err) {
        setError(`Failed to load internships for "${selectedKeyword}".`, err);
        setInternships([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInternships();
  }, [selectedKeyword]);

  return (
    <div>
      <div className="max-w-md mx-auto mb-8">
        <select
          onChange={(e) => setSelectedKeyword(e.target.value)}
          value={selectedKeyword}
          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
          disabled={keywords.length === 0}
        >
          <option value="">
            {keywords.length > 0
              ? "Select an internship category..."
              : "Loading categories..."}
          </option>
          {keywords.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <p className="text-center">Loading internships...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      {!isLoading && !error && selectedKeyword && internships.length === 0 && (
        <p className="text-center text-slate-400">
          No internships found for "{selectedKeyword}".
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <InternshipCard
            key={internship.id}
            companyLogo={`https://logo.clearbit.com/${internship.company
              .toLowerCase()
              .replace(/\s/g, "")
              .replace(/,/g, "")}.com`}
            companyName={internship.company}
            internshipTitle={internship.title}
            address={internship.location}
            applyLink={internship.url}
            postDate={internship.posted_datetime}
          />
        ))}
      </div>
    </div>
  );
};

// --- NEW: Modular Section for Courses ---
const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dropdown?source=courses`);
        if (!response.ok) throw new Error("Failed to fetch keywords");
        const data = await response.json();
        setKeywords(data.keywords || []);
      } catch (err) {
        setError("Could not load course categories.", err);
      }
    };
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (!selectedKeyword) {
      setCourses([]);
      return;
    }
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/dropdown/data?source=courses&keyword=${encodeURIComponent(
            selectedKeyword
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data.results || []);
      } catch (err) {
        setError(`Failed to load courses for "${selectedKeyword}".`, err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [selectedKeyword]);

  return (
    <div>
      <div className="max-w-md mx-auto mb-8">
        <select
          onChange={(e) => setSelectedKeyword(e.target.value)}
          value={selectedKeyword}
          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
          disabled={keywords.length === 0}
        >
          <option value="">
            {keywords.length > 0
              ? "Select a course category..."
              : "Loading categories..."}
          </option>
          {keywords.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <p className="text-center">Loading courses...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      {!isLoading && !error && selectedKeyword && courses.length === 0 && (
        <p className="text-center text-slate-400">
          No courses found for "{selectedKeyword}".
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            provider={course.provider}
            link={course.link}
          />
        ))}
      </div>
    </div>
  );
};

// --- AnalyzeResumePage Component (Main component with updates) ---
const AnalyzeResumePage = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  // --- REMOVED state for jobs, internships, courses ---
  const [activeTab, setActiveTab] = useState("jobs");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
      e.target.value = null;
    }
  };

  // --- UPDATED: handleAnalyzeClick function to remove old data fetching ---
  const handleAnalyzeClick = async () => {
    if (!file) {
      alert("Please upload a resume file first.");
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const backendUrl = "http://localhost:8000/upload-resume";

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      if (data && data.ats_analysis) {
        setAnalysisResult(data.ats_analysis);
      } else {
        throw new Error("Invalid data format from server.");
      }
      // --- REMOVED fetching for jobs, internships, courses ---
    } catch (error) {
      console.error("Operation failed:", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setActiveTab("jobs");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading && !analysisResult) {
    // Show full-page loader only on initial analysis
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400 mb-2">
            Analyzing Your Resume...
          </h1>
          <p className="text-lg text-slate-400">
            Our AI is working its magic. This might take a moment.
          </p>
        </div>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* --- Analysis Result Section (No Changes) --- */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-white text-center sm:text-left mb-4 sm:mb-0">
              Analysis for{" "}
              <span className="text-indigo-400">
                {analysisResult.resume_summary.name}
              </span>
            </h1>
            <button
              onClick={handleReset}
              className="font-bold text-white py-2 px-8 rounded-full transition-all duration-300 bg-slate-700/50 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
            >
              Analyze Another
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Overall ATS Score
                </h3>
                <ScoreDonut score={analysisResult.ats_score} />
                <p className="text-slate-300 mt-6 text-base">
                  {analysisResult.final_verdict}
                </p>
              </div>
              <InfoListCard
                title="Strengths"
                items={analysisResult.strengths}
              />
              <InfoListCard
                title="Weaknesses"
                items={analysisResult.weaknesses}
              />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <InfoListCard
                title="Suggestions for Improvement"
                items={analysisResult.suggestions_for_improvement}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoListCard
                  title="Missing Keywords"
                  items={analysisResult.missing_keywords}
                />
                <InfoListCard
                  title="Missing Skills"
                  items={[
                    ...analysisResult.missing_hard_skills,
                    ...analysisResult.missing_soft_skills,
                  ]}
                />
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-5">
                  Job Role Recommendations
                </h3>
                <div className="space-y-4">
                  {analysisResult.job_role_recommendations.map((job, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-900/60 rounded-lg border border-slate-700/80 transition-all hover:border-indigo-400 hover:bg-slate-800/50"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-indigo-300">
                          {job.job_role}
                        </h4>
                        <span className="font-bold text-lg text-teal-400">
                          {job.match_percentage}% Match
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {job.reason}
                      </p>
                      {job.missing_skills.length > 0 && (
                        <p className="text-sm text-amber-400 mt-2">
                          Skills to develop: {job.missing_skills.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- UPDATED: Opportunities Section --- */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Opportunities For You
            </h2>
            <div className="flex justify-center border-b border-slate-700 mb-8">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === "jobs"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab("internships")}
                className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === "internships"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Internships
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === "courses"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Courses
              </button>
            </div>

            {/* --- Render the correct modular component based on the active tab --- */}
            <div className="min-h-[400px]">
              {activeTab === "jobs" && <JobsSection />}
              {activeTab === "internships" && <InternshipsSection />}
              {activeTab === "courses" && <CoursesSection />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // --- Initial Upload Page and History (No Changes) ---
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-start p-4 sm:p-8">
      <div className="w-full max-w-2xl text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
          Analyze Your Resume
        </h1>
        <p className="text-xl text-slate-300 mb-10">
          Get an instant ATS score and actionable feedback by uploading your PDF
          resume.
        </p>

        <div className="w-full">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            id="resumeUpload"
          />
          <label
            htmlFor="resumeUpload"
            className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl hover:border-indigo-400 transition-all duration-300 bg-slate-800/30 hover:bg-slate-800/50"
          >
            <svg
              className="w-16 h-16 text-slate-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            {file ? (
              <span className="text-teal-400 font-semibold text-lg">
                {file.name}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Click to browse or drag & drop
              </span>
            )}
            <p className="text-sm text-slate-500 mt-2">PDF format only</p>
          </label>
        </div>

        <button
          onClick={handleAnalyzeClick}
          disabled={!file}
          className="mt-8 font-bold text-white text-lg py-3 px-12 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Analyze Now
        </button>
      </div>

    </div>
  );
};

export default AnalyzeResumePage;
