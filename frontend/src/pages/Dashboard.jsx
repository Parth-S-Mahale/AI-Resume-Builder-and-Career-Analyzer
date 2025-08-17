import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Settings,
    LogOut,
    Plus,
    X,
    Briefcase,
    Sparkles,
    Loader,
    Target,
    BookCopy,
    BarChart3,
    Lightbulb,
    MessageSquare,
    Cpu,
    Rocket,
    Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_KEY = "AIzaSyBSknbrs7cWQB73MEPRGvsD5usqrtlZmz0";

// --- Mock/Helper Functions (Replace with your actual context/routing) ---
const useAuth = () => ({
    userId: 'user_abc_123', // Added for data structure
    userEmail: 'dev.user@example.com',
    logout: () => console.log('Logged out'),
});
const useNavigate = () => (path) => console.log(`Navigating to ${path}`);
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;


// --- Gemini API Integration (with improved safety and new logic) ---

const callGeminiAPI = async (payload) => {
    if (!API_KEY) {
        console.error("API Key is missing. Please set it in your .env.local file.");
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
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
            return { error: `API Error: ${response.status}`, data: null };
        }

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            console.error("No valid content found in API response:", result);
            return { error: "Invalid API response structure", data: null };
        }

        return { error: null, data: text };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { error: error.message, data: null };
    }
};

const getTrendingSkillsDataFromAI = async () => {
    const prompt = "Generate a JSON array of the top 6 trending tech skills right now (e.g., Machine Learning, Cybersecurity). For each skill, provide a 'skill' name and a 'demand' score from 70 to 100. The JSON should be valid and parseable. Example: [{ \"skill\": \"Machine Learning\", \"demand\": 95 }]. Do not include any text outside of the JSON array.";
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: { type: "STRING" }, demand: { type: "NUMBER" } }, required: ["skill", "demand"] } } } };
    const { error, data } = await callGeminiAPI(payload);
    if (error || !data) return [ { skill: 'AI/ML', demand: 98 }, { skill: 'Cybersecurity', demand: 95 }, { skill: 'Cloud Computing', demand: 92 }, { skill: 'Data Science', demand: 90 }, { skill: 'Blockchain', demand: 85 }, { skill: 'Web3', demand: 82 }, ];
    try { return JSON.parse(data); } catch (e) { return []; }
};

const getJobRecommendationsFromAI = async (userSkills) => {
    const prompt = `Based on the skills [${userSkills.join(', ')}], generate a list of 3 suitable job roles. For each role, provide a percentage match and a list of missing skills.`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "ARRAY", items: { type: "OBJECT", properties: { role: { type: "STRING" }, match: { type: "NUMBER" }, missingSkills: { type: "ARRAY", items: { type: "STRING" } } }, required: ["role", "match", "missingSkills"] } } } };
    const { error, data } = await callGeminiAPI(payload);
    if (error || !data) return [];
    try { return JSON.parse(data); } catch (e) { return []; }
};

const getSkillSuggestionsFromAI = async (userSkills) => {
    const prompt = `I have these tech skills: [${userSkills.join(', ')}]. Suggest 3 related skills I should learn next. Provide only a comma-separated list of the skill names, without any other text.`;
    const { error, data } = await callGeminiAPI({ contents: [{ parts: [{ text: prompt }] }] });
    if (error || !data) return [];
    return data.split(',').map(s => s.trim()).filter(s => s);
};

const getInterviewQuestionsFromAI = async (userSkills, jobRole) => {
    const prompt = `You are an expert interview coach. For a candidate with skills in [${userSkills.join(', ')}] applying for a '${jobRole}' position, generate 5 behavioral questions and 5 technical questions. The technical questions should be relevant to the skills provided. Return the response as a single, valid JSON object with two keys: 'behavioral' and 'technical', where each key holds an array of strings (the questions). Do not include any text outside the JSON object.`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { behavioral: { type: "ARRAY", items: { type: "STRING" } }, technical: { type: "ARRAY", items: { type: "STRING" } } }, required: ["behavioral", "technical"] } } };
    const { error, data } = await callGeminiAPI(payload);
    if (error || !data) return null;
    try { return JSON.parse(data); } catch (e) { return null; }
};

const getProjectIdeaFromAI = async (userSkills) => {
    const prompt = `You are a creative project manager. Based on the tech skills [${userSkills.join(', ')}], generate an exciting and practical portfolio project idea. Return a single, valid JSON object with three keys: 'title', 'description' (a short, compelling summary), and 'features' (an array of 3-5 key features to build). Do not include any text outside the JSON object.`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" }, features: { type: "ARRAY", items: { type: "STRING" } } }, required: ["title", "description", "features"] } } };
    const { error, data } = await callGeminiAPI(payload);
    if (error || !data) return null;
    try { return JSON.parse(data); } catch (e) { return null; }
};

// --- UI Components ---

const SkillPill = ({ skill, onRemove }) => ( <motion.div layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="flex items-center bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-full px-3 py-1 text-sm font-medium text-slate-200"> <span>{skill}</span> <button onClick={() => onRemove(skill)} className="ml-2 text-slate-400 hover:text-white transition-colors"><X size={16} /></button> </motion.div> );
const SuggestedSkillButton = ({ skill, onAdd }) => ( <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAdd(skill)} className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full flex items-center transition-colors"> <Plus className="mr-1.5" size={14} /> {skill} </motion.button> );
const DashboardCard = ({ children, className = '' }) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className={`bg-slate-800/40 backdrop-blur-lg border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/20 ${className}`}> {children} </motion.div> );
const CustomTooltip = ({ active, payload, label }) => { if (active && payload && payload.length) { return ( <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 p-3 rounded-lg text-sm"> <p className="label font-bold text-slate-200">{`${label}`}</p> <p className="intro" style={{ color: payload[0].fill }}>{`Demand: ${payload[0].value}`}</p> </div> ); } return null; };
const InterviewPrepModal = ({ isOpen, onClose, isLoading, questions, jobRole }) => { return ( <AnimatePresence> {isOpen && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}> <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}> <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={24} /></button> <h2 className="text-2xl font-bold text-white mb-2">AI Interview Prep</h2> <p className="text-indigo-300 mb-6">Generated questions for: <span className="font-semibold">{jobRole}</span></p> {isLoading && ( <div className="flex flex-col items-center justify-center h-64"> <Loader className="animate-spin text-indigo-400" size={48} /> <p className="mt-4 text-slate-300">Generating your questions...</p> </div> )} {questions && ( <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4"> <div> <h3 className="text-lg font-semibold text-white flex items-center mb-3"><MessageSquare className="mr-3 text-teal-400" />Behavioral Questions</h3> <ul className="list-decimal list-inside space-y-2 text-slate-300"> {questions.behavioral.map((q, i) => <li key={`b-${i}`}>{q}</li>)} </ul> </div> <div> <h3 className="text-lg font-semibold text-white flex items-center mb-3"><Cpu className="mr-3 text-pink-400" />Technical Questions</h3> <ul className="list-decimal list-inside space-y-2 text-slate-300"> {questions.technical.map((q, i) => <li key={`t-${i}`}>{q}</li>)} </ul> </div> </div> )} </motion.div> </motion.div> )} </AnimatePresence> ); };

// --- Main Dashboard Component ---

export default function CreativeDashboard() {
    const { userId, userEmail, logout } = useAuth();
    // **UPDATED**: Start with an empty array, data will be "fetched"
    const [userSkills, setUserSkills] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Track initial load
    const [newSkill, setNewSkill] = useState('');
    const [trendingSkillsData, setTrendingSkillsData] = useState([]);
    const [jobRecommendations, setJobRecommendations] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [isLoadingSkills, setIsLoadingSkills] = useState(false);
    const [suggestedSkills, setSuggestedSkills] = useState([]);
    const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState(null);
    const [selectedJob, setSelectedJob] = useState('');
    const [projectIdea, setProjectIdea] = useState(null);
    const [isLoadingProject, setIsLoadingProject] = useState(false);

    // **NEW**: Function to simulate saving user data to a backend
    const saveUserDataToBackend = async (skillsToSave) => {
        const userData = {
            userId: userId,
            email: userEmail,
            skills: skillsToSave
        };

        console.log("--- Sending to Backend ---");
        console.log(JSON.stringify(userData, null, 2)); // Pretty print JSON

        // In a real app, you would use fetch() here to send the data:
        /*
        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                throw new Error('Failed to save data');
            }
            const result = await response.json();
            console.log("Backend response:", result);
        } catch (error) {
            console.error("Error saving user data:", error);
        }
        */
    };
    
    // **UPDATED**: Simulate fetching initial data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            // Simulate API call to get user data
            const initialSkills = ['React', 'JavaScript', 'Data Science', 'TailwindCSS'];
            setUserSkills(initialSkills);
            setIsDataLoaded(true); // Mark initial data as loaded

            // Fetch other AI-powered data
            setTrendingSkillsData(await getTrendingSkillsDataFromAI());
        };
        fetchInitialData();
    }, []);

    // **NEW**: useEffect hook to save data when userSkills changes
    useEffect(() => {
        // Only save after the initial data has been loaded to prevent
        // saving an empty array on the first render.
        if (isDataLoaded) {
            saveUserDataToBackend(userSkills);
        }
    }, [userSkills, isDataLoaded]);

    const handleAddSkill = useCallback((skillToAdd) => {
        const formattedSkill = skillToAdd.trim();
        if (formattedSkill && !userSkills.find(skill => skill.toLowerCase() === formattedSkill.toLowerCase())) {
            // This will trigger the useEffect to save the new state
            setUserSkills(prev => [...prev, formattedSkill]);
            setNewSkill('');
            setSuggestedSkills(prev => prev.filter(s => s.toLowerCase() !== formattedSkill.toLowerCase()));
        }
    }, [userSkills]);

    const handleRemoveSkill = useCallback((skillToRemove) => {
        // This will trigger the useEffect to save the new state
        setUserSkills(prev => prev.filter(skill => skill !== skillToRemove));
    }, []);

    const handleFindJobs = async () => {
        setIsLoadingJobs(true);
        setJobRecommendations([]);
        setJobRecommendations(await getJobRecommendationsFromAI(userSkills));
        setIsLoadingJobs(false);
    };

    const handleSuggestSkills = async () => {
        setIsLoadingSkills(true);
        setSuggestedSkills([]);
        setSuggestedSkills(await getSkillSuggestionsFromAI(userSkills));
        setIsLoadingSkills(false);
    };

    const handlePrepForInterview = async (jobRole) => {
        setSelectedJob(jobRole);
        setIsPrepModalOpen(true);
        setIsLoadingQuestions(true);
        setInterviewQuestions(null);
        setInterviewQuestions(await getInterviewQuestionsFromAI(userSkills, jobRole));
        setIsLoadingQuestions(false);
    };

    const handleGenerateProject = async () => {
        setIsLoadingProject(true);
        setProjectIdea(null);
        setProjectIdea(await getProjectIdeaFromAI(userSkills));
        setIsLoadingProject(false);
    };

    const COLORS = ['#00FFFF'];

    return (
        <>
            <InterviewPrepModal isOpen={isPrepModalOpen} onClose={() => setIsPrepModalOpen(false)} isLoading={isLoadingQuestions} questions={interviewQuestions} jobRole={selectedJob} />
            <div className="bg-slate-900 min-h-screen text-slate-300 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-600/30 rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-violet-600/30 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Career Command Center</h1>
                            <p className="text-slate-400">Welcome back, {userEmail?.split('@')[0] || 'Developer'}.</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <div className="lg:col-span-1 xl:col-span-1 space-y-8">
                            <DashboardCard className="p-6">
                                <div className="flex items-center mb-4"><Target className="text-rose-500 mr-3" size={20} /><h3 className="text-lg font-bold text-white">My Skill Arsenal</h3></div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e.target.value)} placeholder="Add skill..." className="w-full bg-slate-900/80 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all" />
                                    <button onClick={() => handleAddSkill(newSkill)} className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-md transition-colors"><Plus size={20} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[50px]"><AnimatePresence>{userSkills.map(skill => (<SkillPill key={skill} skill={skill} onRemove={handleRemoveSkill} />))}</AnimatePresence></div>
                            </DashboardCard>
                            
                            <DashboardCard className="p-6">
                                <div className="flex items-center mb-4"><BookCopy className="text-blue-500 mr-3" size={20} /><h3 className="text-lg font-bold text-white">AI Learning Path</h3></div>
                                 <button onClick={handleSuggestSkills} disabled={isLoadingSkills} className="w-full flex items-center justify-center text-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 transition-colors">
                                    {isLoadingSkills ? <><Loader className="animate-spin mr-2" size={16} /> Analyzing...</> : <><Sparkles className="mr-2 text-blue-400" size={16} /> Suggest New Skills</>}
                                </button>
                                {suggestedSkills.length > 0 && ( <div className="mt-4 pt-4 border-t border-slate-700"> <h4 className="text-sm font-semibold text-slate-400 mb-3">Recommended for you:</h4> <div className="flex flex-wrap gap-2">{suggestedSkills.map(skill => (<SuggestedSkillButton key={skill} skill={skill} onAdd={handleAddSkill} />))}</div> </div> )}
                            </DashboardCard>

                            <DashboardCard className="p-6">
                                <div className="flex items-center mb-4"><Rocket className="text-violet-500 mr-3" size={20} /><h3 className="text-lg font-bold text-white">AI Project Hub</h3></div>
                                <button onClick={handleGenerateProject} disabled={isLoadingProject || userSkills.length === 0} className="w-full flex items-center justify-center text-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 transition-colors">
                                    {isLoadingProject ? <><Loader className="animate-spin mr-2" size={16} /> Building Idea...</> : <><Sparkles className="mr-2 text-violet-400" size={16} /> Generate Project Idea</>}
                                </button>
                                {projectIdea && ( <div className="mt-4 pt-4 border-t border-slate-700"> <h4 className="font-bold text-lg text-white mb-2">{projectIdea.title}</h4> <p className="text-sm text-slate-400 mb-4">{projectIdea.description}</p> <h5 className="text-sm font-semibold text-slate-300 mb-2">Key Features:</h5> <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm"> {projectIdea.features.map((feature, i) => <li key={i}>{feature}</li>)} </ul> </div> )}
                            </DashboardCard>
                        </div>

                        <div className="lg:col-span-2 xl:col-span-3 space-y-8">
                            <DashboardCard className="p-6">
                                <div className="flex items-center mb-4"><BarChart3 className="text-emerald-400 mr-3" size={20}/><h3 className="text-lg font-bold text-white">Top Trending Skills</h3></div>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={trendingSkillsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                            <XAxis dataKey="skill" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} angle={-25} textAnchor="end" height={50} />
                                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                                            <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                                                {trendingSkillsData.map((entry, index) => {
                                                    const isMatched = userSkills.map(s => s.toLowerCase()).includes(entry.skill.toLowerCase());
                                                    return (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={COLORS[index % COLORS.length]} 
                                                            stroke={isMatched ? '#ffffff' : 'none'}
                                                            strokeWidth={isMatched ? 2 : 0}
                                                            style={{ opacity: isMatched ? 1 : 0.6, transition: 'opacity 0.3s ease-in-out' }}
                                                        />
                                                    );
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </DashboardCard>

                            <DashboardCard className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                                    <div className="flex items-center mb-4 md:mb-0"><Briefcase className="text-green-400 mr-3" size={20}/><h3 className="text-lg font-bold text-white">AI Job Opportunities</h3></div>
                                    <button onClick={handleFindJobs} disabled={isLoadingJobs} className="w-full md:w-auto flex items-center justify-center text-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-base font-medium rounded-md text-white disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20">
                                        {isLoadingJobs ? <><Loader className="animate-spin mr-2" size={20} /> Searching...</> : <><Sparkles className="mr-2" size={20} /> Find Matching Jobs</>}
                                    </button>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <AnimatePresence>
                                    {jobRecommendations.map((job, index) => (
                                        <motion.div key={job.role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-lg text-white">{job.role}</h4>
                                                    <div className="text-right flex-shrink-0 ml-4 sm:hidden my-3"><p className="font-bold text-green-400 text-2xl">{job.match}%</p><p className="text-xs text-slate-400">Match</p></div>
                                                    {job.missingSkills?.length > 0 && ( <div className="mt-3"> <h5 className="text-xs font-semibold text-amber-400 mb-2">Skills to develop:</h5> <div className="flex flex-wrap gap-2">{job.missingSkills.map(skill => (<span key={skill} className="bg-amber-500/20 text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>))}</div> </div> )}
                                                </div>
                                                <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                                                    <div className="text-right flex-shrink-0 ml-4 hidden sm:block"><p className="font-bold text-green-400 text-2xl">{job.match}%</p><p className="text-xs text-slate-400">Match</p></div>
                                                    <button onClick={() => handlePrepForInterview(job.role)} className="w-full sm:w-auto flex items-center justify-center text-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"> <Lightbulb className="mr-2 text-yellow-400" size={16} /> Prep for Interview </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    </AnimatePresence>
                                    {!isLoadingJobs && jobRecommendations.length === 0 && ( <div className="text-center py-8"><p className="text-slate-400">Your future awaits. Click the button to find your perfect job match!</p></div> )}
                                </div>
                            </DashboardCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
