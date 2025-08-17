import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONS (HeroIcons are great for this) ---
const UploadIcon = () => <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>;
const StrengthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-1.9 3.8z" /></svg>;
const WeaknessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const SuggestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const KeywordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const ScoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const GraduationCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const RocketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ListChecksIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const LoaderIcon = () => <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


// --- Gemini API Integration ---
const API_KEY = "AIzaSyBSknbrs7cWQB73MEPRGvsD5usqrtlZmz0"; // Use environment variables for security

const callGeminiAPI = async (payload) => {
    if (!API_KEY) {
        console.error("API Key is missing.");
        return { error: "API Key Missing", data: null };
    }
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorBody?.error?.message || 'Unknown error'}`);
        }
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Invalid API response structure");
        return { error: null, data: text };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { error: error.message, data: null };
    }
};

const getSkillRoadmapFromAI = async (skillName) => {
    const prompt = `You are an expert curriculum developer. For the skill ${skillName}, generate a detailed learning roadmap. Return a single, valid JSON object with three keys: "prerequisites" (an array of necessary prior skills), "topics" (an array of objects, each with "level" like "Beginner", "Intermediate", "Advanced" and "details" as an array of strings), and "projects" (an array of objects, each with "name" and "description"). Do not include any text outside the JSON object.`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    prerequisites: { type: "ARRAY", items: { type: "STRING" } },
                    topics: { type: "ARRAY", items: { type: "OBJECT", properties: { level: { type: "STRING" }, details: { type: "ARRAY", items: { type: "STRING" } } }, required: ["level", "details"] } },
                    projects: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } }, required: ["name", "description"] } }
                },
                required: ["prerequisites", "topics", "projects"]
            }
        }
    };
    const { error, data } = await callGeminiAPI(payload);
    if (error || !data) return null;
    try { return JSON.parse(data); } catch (e) { return null; }
};


// --- NEW Circular Progress Bar Component ---
const CircularProgressBar = ({ score, label, color = 'indigo' }) => {
    const size = 120;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle className="text-slate-700/50" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={center} cy={center} />
                    <circle className={`text-${color}-400`} stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={center} cy={center} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{Math.round(score)}%</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-semibold text-slate-400 capitalize">{label.replace(/_/g, ' ')}</span>
        </div>
    );
};


// --- A More Dynamic & Styled Card Component with "Show More" functionality ---
const DynamicDetailCard = ({ title, content, color = 'slate', icon, onSkillClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const PREVIEW_LIMIT = 4; // Show this many items initially

    const renderContent = () => {
        if (title === 'missing_skills' && Array.isArray(content)) {
            return (
                <div className="flex flex-wrap gap-2">
                    {content.map((item, i) => (
                        <button 
                            key={i} 
                            onClick={() => onSkillClick(item)}
                            className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-sm font-medium px-3 py-1.5 rounded-full flex items-center transition-all duration-200 hover:shadow-md hover:shadow-amber-500/20"
                        >
                           <GraduationCapIcon className="w-4 h-4 mr-2" /> {item}
                        </button>
                    ))}
                </div>
            );
        }

        if (Array.isArray(content)) {
            const hasMore = content.length > PREVIEW_LIMIT;
            const itemsToShow = isExpanded ? content : content.slice(0, PREVIEW_LIMIT);

            return (
                <>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                        {itemsToShow.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    {hasMore && (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`mt-4 text-sm font-semibold text-${color}-400 hover:text-${color}-300 transition-colors`}
                        >
                            {isExpanded ? 'Show Less' : `Show ${content.length - PREVIEW_LIMIT} More...`}
                        </button>
                    )}
                </>
            );
        }
        
        // For strings (like summary)
        return <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{String(content)}</p>;
    };

    return (
        <div className={`glass-card p-6 h-fit border-l-4 border-${color}-500 transition-all duration-300 hover:shadow-xl hover:shadow-${color}-500/10 hover:-translate-y-1`}>
            <div className="flex items-center mb-4">
                 <div className={`mr-4 p-2 bg-${color}-500/10 rounded-lg text-${color}-400`}>
                    {icon}
                </div>
                <h3 className={`text-xl font-bold text-white capitalize`}>{title.replace(/_/g, ' ')}</h3>
            </div>
            {renderContent()}
        </div>
    );
};

const SkillRoadmapModal = ({ isOpen, onClose, isLoading, roadmap, skillName }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        <h2 className="text-3xl font-bold text-white mb-2">AI Learning Roadmap</h2>
                        <p className="text-indigo-300 text-lg mb-6">A complete guide to mastering: <span className="font-semibold">{skillName}</span></p>

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-80"><LoaderIcon /></div>
                        )}
                        
                        {roadmap && (
                            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h3 className="text-xl font-semibold text-white flex items-center mb-3"><ListChecksIcon className="mr-3 text-blue-400" />Prerequisites</h3>
                                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                                        {roadmap.prerequisites.map((req, i) => <li key={`req-${i}`}>{req}</li>)}
                                    </ul>
                                </div>
                                <div className="border-l-4 border-teal-500 pl-4">
                                    <h3 className="text-xl font-semibold text-white flex items-center mb-3"><GraduationCapIcon className="mr-3 text-teal-400" />Learning Topics</h3>
                                    <div className="space-y-4">
                                        {roadmap.topics.map((topic, i) => (
                                            <div key={`topic-${i}`}>
                                                <h4 className="font-bold text-teal-300">{topic.level}</h4>
                                                <ul className="list-disc list-inside ml-4 space-y-1 text-slate-300">
                                                    {topic.details.map((detail, j) => <li key={`detail-${j}`}>{detail}</li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-l-4 border-amber-500 pl-4">
                                    <h3 className="text-xl font-semibold text-white flex items-center mb-3"><RocketIcon className="mr-3 text-amber-400" />Project Recommendations</h3>
                                    <div className="space-y-4">
                                        {roadmap.projects.map((proj, i) => (
                                            <div key={`proj-${i}`} className="bg-slate-900/50 p-4 rounded-lg">
                                                <h4 className="font-bold text-amber-300">{proj.name}</h4>
                                                <p className="text-slate-400 text-sm">{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const AnalyzeWithJDPage = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
    const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
    const [roadmapData, setRoadmapData] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.name.endsWith('.docx'))) {
            setResumeFile(selectedFile);
            setError(null);
        } else {
            setError("Please upload a valid PDF or DOCX file.");
            e.target.value = null;
        }
    };

    const handleAnalyzeClick = async () => {
        if (!resumeFile || !jobDescription) {
            setError("Please upload a resume and paste a job description.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append("file", resumeFile);
        formData.append("job_description", jobDescription);

        try {
            const response = await fetch("http://localhost:8000/upload-resume-jobmatch", { method: "POST", body: formData });
            const responseText = await response.text();
            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.detail || `Server Error: ${response.status}`);
                } catch (e) {
                    throw new Error(`Server Error: ${response.status}. ${responseText}`,e);
                }
            }
            if (!responseText) throw new Error("Received an empty response from the server.");
            const data = JSON.parse(responseText);
            setAnalysisResult(data);
        } catch (err) {
            console.error("Analysis API Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setResumeFile(null);
        setJobDescription("");
        setAnalysisResult(null);
        setError(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
    
    const handleSkillClick = async (skill) => {
        setSelectedSkill(skill);
        setIsRoadmapModalOpen(true);
        setIsLoadingRoadmap(true);
        setRoadmapData(null);
        
        const roadmap = await getSkillRoadmapFromAI(skill);
        setRoadmapData(roadmap);
        setIsLoadingRoadmap(false);
    };

    // --- RENDER STATES ---

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400 mb-2">Analyzing...</h1>
                    <p className="text-lg text-slate-400">Our AI is meticulously comparing your resume against the job description.</p>
                </div>
            </div>
        );
    }
    
    if (analysisResult) {
        const { ats_analysis, ats_job_match } = analysisResult;

        const scores = {};
        const otherAtsData = {};
        Object.entries(ats_analysis).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && 'raw' in value && 'scaled' in value) {
                scores[key] = value;
            } else if (key !== 'final_score') {
                otherAtsData[key] = value;
            }
        });

        const keyToIconMap = {
            default: <SummaryIcon />,
            strengths: <StrengthIcon />,
            weaknesses: <WeaknessIcon />,
            suggestions_for_improvement: <SuggestionIcon />,
            matched_skills: <KeywordIcon />,
            missing_skills: <KeywordIcon />,
            keywords_matched: <KeywordIcon />,
            missing_keywords: <KeywordIcon />,
        };

        return (
            <>
            <SkillRoadmapModal isOpen={isRoadmapModalOpen} onClose={() => setIsRoadmapModalOpen(false)} isLoading={isLoadingRoadmap} roadmap={roadmapData} skillName={selectedSkill} />
            <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                        <h1 className="text-4xl font-bold text-white text-center sm:text-left mb-4 sm:mb-0">Full Analysis Report</h1>
                         <button onClick={handleReset} className="font-bold text-white py-2 px-8 rounded-full transition-all duration-300 bg-slate-700/50 border border-slate-600 hover:bg-slate-700 hover:border-slate-500">Analyze Another</button>
                    </div>

                    <div className="mb-8 glass-card p-6 border-l-4 border-teal-400">
                        <h2 className="text-2xl font-bold text-teal-400 mb-3">Final Verdict: {ats_job_match.final_verdict}</h2>
                        <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0 text-lg">
                            {/* <p className="text-slate-300">Job Match Score: <span className="font-bold text-white">{ats_job_match.match_score}%</span></p> */}
                            <p className="text-slate-300">Overall Resume Score: <span className="font-bold text-white">{ats_analysis.final_score}%</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
                        {/* Column 1: General Resume Analysis */}
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl font-bold text-white tracking-tight border-b-2 border-indigo-500 pb-2">📄 Resume Breakdown</h2>
                            
                            {/* NEW: Scores section with progress bars */}
                            <div className="glass-card p-6 border-l-4 border-indigo-500">
                                <div className="flex flex-wrap justify-around items-center text-center gap-4">
                                    {Object.entries(scores).map(([key, value]) => (
                                        <CircularProgressBar key={key} score={value.scaled} label={key.replace('_score', '')} color="indigo" />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Render other data */}
                            {Object.entries(otherAtsData).map(([key, value]) => (
                                <DynamicDetailCard key={key} title={key} content={value} color="indigo" icon={keyToIconMap[key] || keyToIconMap.default} />
                            ))}
                        </div>

                        {/* Column 2: Job Match Specifics */}
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl font-bold text-white tracking-tight border-b-2 border-teal-500 pb-2">🎯 Job Match Details</h2>
                            {Object.entries(ats_job_match).filter(([key]) => !['match_score', 'final_verdict'].includes(key)).map(([key, value]) => {
                                 const color = key.includes('strength') || key.includes('matched') ? 'teal' : key.includes('weakness') || key.includes('missing') ? 'amber' : 'slate';
                                 return <DynamicDetailCard key={key} title={key} content={value} color={color} icon={keyToIconMap[key] || keyToIconMap.default} onSkillClick={handleSkillClick} />
                            })}
                        </div>
                    </div>
                </div>
            </div>
            </>
        )
    }

    // Default View: The Upload Form
    return (
        <div className="bg-[#05041E] text-white min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">AI-Powered Job Match Analyzer</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">Upload your resume (PDF/DOCX) and paste a job description to receive a complete analysis.</p>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 items-stretch">
                    <div className="flex-1 glass-card p-8 rounded-2xl flex flex-col">
                        <h2 className="text-2xl font-bold text-white mb-4">Step 1: Upload Resume</h2>
                        <div className="flex-grow flex flex-col">
                             <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" ref={fileInputRef} id="resumeUploadJD"/>
                            <label htmlFor="resumeUploadJD" className="cursor-pointer flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-400 transition-all duration-300 bg-slate-800/30 hover:bg-slate-800/50">
                                <UploadIcon />
                                {resumeFile ? <span className="text-teal-400 font-semibold">{resumeFile.name}</span> : <span className="text-slate-400 font-medium text-center">Click to upload resume</span>}
                                <p className="text-sm text-slate-500 mt-2">PDF or DOCX format</p>
                            </label>
                        </div>
                    </div>
                    <div className="flex-1 glass-card p-8 rounded-2xl flex flex-col">
                         <h2 className="text-2xl font-bold text-white mb-4">Step 2: Paste Job Description</h2>
                         <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." className="w-full flex-grow bg-slate-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"></textarea>
                    </div>
                </div>
                {error && <div className="my-6 text-center bg-red-500/10 text-red-400 font-semibold p-3 rounded-lg">{error}</div>}
                <div className="mt-8 text-center">
                    <button onClick={handleAnalyzeClick} disabled={!resumeFile || !jobDescription || isLoading} className="font-bold text-white text-lg py-4 px-16 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none">
                        {isLoading ? 'Analyzing...' : 'Analyze Match'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyzeWithJDPage;
