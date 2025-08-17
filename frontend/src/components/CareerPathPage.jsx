import React, { useState } from 'react';

const CareerPathPage = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVisualize = async (e) => {
    e.preventDefault();
    if (!currentRole || !targetRole) {
      alert('Please fill in both your current and target roles.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPath(null);

    // This prompt instructs the AI to generate the career path in a specific JSON format.
    const prompt = `
      You are a career path advisor. Generate a realistic, step-by-step career path in the tech industry from a "${currentRole}" to a "${targetRole}". 
      The path should include as much distinct roles as you can. For each role, provide a brief description, an estimated duration, a list of key skills to acquire, and an estimated average monthly salary in Indian Rupees (₹).
      
      Return ONLY a JSON object with a single key "path" which is an array of objects. Do not include any other text or markdown.

      Each object in the "path" array must have these exact keys: "role", "duration", "description", "keySkills" (as an array of strings), and "avgSalary".
    `;

    // This schema enforces the JSON output structure for the AI model.
    const schema = {
      type: "OBJECT",
      properties: {
        path: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              role: { type: "STRING" },
              duration: { type: "STRING" },
              description: { type: "STRING" },
              keySkills: { type: "ARRAY", items: { type: "STRING" } },
              avgSalary: { type: "STRING" },
            },
            required: ["role", "duration", "description", "keySkills", "avgSalary"],
          },
        },
      },
      required: ["path"],
    };

    try {
      // Paste your API key here. Remember to keep it private.
      const apiKey = "AIzaSyBz8BpqNokZLzznpuV2-sYT3f_uPDEh89c";
      
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        throw new Error("API key is missing. Please add it to the code.");
      }
      
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0].content.parts[0].text) {
        const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
        setPath(parsedJson.path || []);
      } else {
        throw new Error("AI response was empty or invalid.");
      }

    } catch (err) {
      console.error("Career path generation failed:", err);
      setError(`Failed to generate path. ${err.message}. Please check your API key and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#05041E] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter section-title">
            Visualize Your Career Trajectory
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Enter your current role and your desired future role to generate a personalized step-by-step career path.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVisualize} className="max-w-2xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="currentRole" className="block text-sm font-medium text-gray-400 mb-2">Your Current Role</label>
              <input
                type="text"
                id="currentRole"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g., Junior Developer"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-gray-400 mb-2">Your Target Role</label>
              <input
                type="text"
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Architect"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg text-center" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Visualize Path'}
          </button>
        </form>

        {/* Path Visualization */}
        {isLoading && (
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
             <p className="mt-4 text-gray-400">The AI is charting your future... please wait.</p>
          </div>
        )}
        
        {error && <p className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg glass-card">{error}</p>}

        {path && (
          <div className="relative animate-fade-in">
            {/* The vertical line */}
            <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gray-700" aria-hidden="true"></div>

            <div className="space-y-12">
              {path.map((step, index) => (
                <div key={index} className="relative pl-16">
                  <div className="absolute left-8 top-4 -ml-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-gray-900"></div>
                  <div className="glass-card p-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-indigo-300">{step.role}</h3>
                        <p className="text-sm font-medium text-gray-400 mt-1">Est. Duration: {step.duration}</p>
                      </div>
                      <h4 className="font-semibold text-white mb-2">Monthly Salary: <span className="text-lg font-bold text-teal-400">{step.avgSalary}</span></h4>
                    </div>
                    <p className="mt-4 text-gray-300">{step.description}</p>
                    <div className="mt-5">
                      <h4 className="font-semibold text-white mb-2">Key Skills to Acquire:</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.keySkills.map(skill => (
                          <span key={skill} className="bg-gray-700/50 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPathPage;