import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- ICONS ---
const LoaderIcon = () => <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const GraduationCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const RocketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ListChecksIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

// --- Gemini API Integration ---
const API_KEY = "AIzaSyBSknbrs7cWQB73MEPRGvsD5usqrtlZmz0";

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

// --- Roadmap Components ---
const RoadmapSection = ({ icon, title, color, children, delay }) => (
    <motion.div 
        className="relative pl-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.2 }}
    >
        <div className={`absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full bg-${color}-500/10 border-2 border-${color}-500 text-${color}-400`}>
            {icon}
        </div>
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-700"></div>
        <h3 className={`text-2xl font-bold text-white mb-4`}>{title}</h3>
        <div className="glass-card p-6 rounded-lg">{children}</div>
    </motion.div>
);

const SkillRoadmapPage = () => {
    const { skillName } = useParams();
    const [roadmap, setRoadmap] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoadmap = async () => {
            setIsLoading(true);
            setError(null);
            const data = await getSkillRoadmapFromAI(skillName);
            if (data) {
                setRoadmap(data);
            } else {
                setError("Could not generate a roadmap for this skill. Please try another.");
            }
            setIsLoading(false);
        };

        if (skillName) {
            fetchRoadmap();
        }
    }, [skillName]);

    const formattedSkillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
                <LoaderIcon />
                <h1 className="text-3xl font-bold mt-4">Generating Your Roadmap for {formattedSkillName}...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bold text-red-400 mb-4">An Error Occurred</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <Link to="/analyze-jd" className="font-bold text-white py-2 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700">Back to Analyzer</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">AI Learning Roadmap</h1>
                    <p className="mt-4 text-2xl text-indigo-300 font-bold">{formattedSkillName}</p>
                </div>

                <div className="space-y-12">
                    {roadmap.prerequisites && (
                        <RoadmapSection icon={<ListChecksIcon />} title="Prerequisites" color="blue" delay={0}>
                            <ul className="list-disc list-inside space-y-2 text-slate-300">
                                {roadmap.prerequisites.map((req, i) => <li key={i}>{req}</li>)}
                            </ul>
                        </RoadmapSection>
                    )}

                    {roadmap.topics && (
                         <RoadmapSection icon={<GraduationCapIcon />} title="Learning Topics" color="teal" delay={1}>
                             <div className="space-y-6">
                                {roadmap.topics.map((topic, i) => (
                                    <div key={i}>
                                        <h4 className="font-bold text-lg text-teal-300 mb-2">{topic.level}</h4>
                                        <ul className="list-disc list-inside ml-4 space-y-1 text-slate-300">
                                            {topic.details.map((detail, j) => <li key={j}>{detail}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </RoadmapSection>
                    )}

                    {roadmap.projects && (
                        <RoadmapSection icon={<RocketIcon />} title="Project Recommendations" color="amber" delay={2}>
                            <div className="space-y-4">
                                {roadmap.projects.map((proj, i) => (
                                    <div key={i} className="bg-slate-900/50 p-4 rounded-lg">
                                        <h4 className="font-bold text-amber-300">{proj.name}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </RoadmapSection>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillRoadmapPage;
