import React, { useState, useRef } from 'react';

// Reusable Input Field Component
const InputField = ({ id, label, value, onChange, placeholder, type = 'text', required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={id}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Main Component
const CoverLetterGenerator = () => {
  // State for user credentials and resume
  const [userEmail, setUserEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // State for form inputs
  const [formData, setFormData] = useState({
    yourName: '',
    hiringManagerName: '',
    companyName: '',
    jobTitle: '',
    keySkills: '',
  });

  // State for the generated letter and UI feedback
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');

  // State for email sending and results
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);


  const letterOutputRef = useRef(null);

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Handle resume file selection
  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };
  
  // Clear error/success messages
  const clearMessages = () => {
      if(error) setError('');
      if(copySuccess) setCopySuccess('');
      if(sendResult) setSendResult(null);
  }

  // Generate the basic cover letter from form data
  const handleGenerate = (e) => {
    e.preventDefault();
    clearMessages();

    const { yourName, companyName, jobTitle, keySkills } = formData;

    if (!yourName || !companyName || !jobTitle || !keySkills) {
      setError('Please fill out Your Name, Company Name, Job Title, and Key Skills.');
      return;
    }
    
    setIsGenerating(true);

    setTimeout(() => {
      const { hiringManagerName } = formData;
      const salutation = hiringManagerName ? `Dear ${hiringManagerName},` : `Dear Hiring Team at ${companyName},`;

      const letter = `Subject: Application for the ${jobTitle} Position

${salutation}

I am writing to express my keen interest in the ${jobTitle} position at ${companyName}, which I discovered through [Platform where you saw the ad, e.g., LinkedIn, company website]. Having followed your company's progress and innovations, I am confident that my skills and experience align perfectly with the requirements of this role.

In my previous roles, I have developed a strong skill set in the following areas:
${keySkills}

I am particularly drawn to this opportunity at ${companyName} because of [Mention something specific about the company, e.g., its mission, a recent project, or its company culture]. I am eager to contribute to your team and believe my background will allow me to make a significant impact.

Thank you for considering my application. I have attached my resume for your review and look forward to the possibility of discussing my qualifications further.

Best regards,

${yourName}
`;
      setGeneratedLetter(letter);
      setIsGenerating(false);
    }, 500);
  };

  // Enhance the cover letter using the Gemini API
  const handleEnhanceWithAI = async () => {
    if (!generatedLetter) {
        setError("Please generate a basic letter first.");
        return;
    }
    clearMessages();
    setIsEnhancing(true);

    const { yourName, companyName, jobTitle, keySkills, hiringManagerName } = formData;
    
    const prompt = `
      My name is ${yourName}. I am applying for the ${jobTitle} position at ${companyName}.
      ${hiringManagerName ? `The hiring manager's name is ${hiringManagerName}.` : ''}
      Here are my key skills and experiences: ${keySkills}.

      Please rewrite the following cover letter to be more professional, persuasive, and impactful. 
      Make sure to naturally integrate my key skills into the body of the letter.
      The tone should be confident but not arrogant.
      Keep the placeholders like "[Platform where you saw the ad...]" and "[Mention something specific about the company...]".
      Do not change the subject line, the closing ("Best regards,"), or my name at the end.
      ---
      ${generatedLetter}
      ---
    `;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyBSknbrs7cWQB73MEPRGvsD5usqrtlZmz0" // Replace with your actual Gemini API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        
        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            const enhancedText = result.candidates[0].content.parts[0].text;
            setGeneratedLetter(enhancedText.replace("Of course, here's the rewritten cover letter:", "").trim());
        } else {
            throw new Error("Received an unexpected response structure from the API.");
        }
    } catch (err) {
        console.error("Error enhancing with AI:", err);
        setError("Failed to enhance the letter. Please try again.");
    } finally {
        setIsEnhancing(false);
    }
  };

  // Copy to clipboard functionality
  const handleCopyToClipboard = () => {
    if (!generatedLetter || !letterOutputRef.current) return;
    clearMessages();

    navigator.clipboard.writeText(letterOutputRef.current.innerText).then(() => {
        setCopySuccess('Copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
        setCopySuccess('Failed to copy!');
        console.error('Failed to copy text: ', err);
    });
  };

  // --- UPDATED AND FINAL VERSION of handleSendEmails ---
  const handleSendEmails = async (e) => {
    e.preventDefault();
    clearMessages();

    // 1. --- IMPROVED FRONTEND VALIDATION ---
    const validationErrors = [];
    if (!userEmail.trim()) validationErrors.push("Your Email Address");
    if (!appPassword.trim()) validationErrors.push("Your Email App Password");
    if (!generatedLetter.trim()) validationErrors.push("a Generated Cover Letter");
    if (!resumeFile) validationErrors.push("a Resume File");

    if (validationErrors.length > 0) {
        setError(`Please provide the following before sending: ${validationErrors.join(', ')}.`);
        return;
    }
    
    setIsSending(true);

    // 2. Create FormData with CORRECTED keys to match the backend
    const submissionData = new FormData();
    submissionData.append('user_email', userEmail);
    submissionData.append('user_app_password', appPassword); // CORRECTED KEY
    submissionData.append('cover_letter', generatedLetter);
    submissionData.append('upload_pdf_resume', resumeFile); // CORRECTED KEY

    // 3. Send to Backend
    try {
        const response = await fetch('http://127.0.0.1:8000/send-emails', {
            method: 'POST',
            body: submissionData,
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw responseData; 
        }

        setSendResult(responseData);

    } catch (err) {
        console.error("Error sending emails:", err);
        
        let errorMessage = "An unknown error occurred.";

        if (err && err.detail) {
            if (Array.isArray(err.detail)) {
                errorMessage = err.detail.map(d => d.msg || JSON.stringify(d)).join('. ');
            } else {
                errorMessage = err.detail;
            }
        } else if (err.message) {
            errorMessage = err.message;
        }

        setError(`Failed to send emails: ${errorMessage}`);
        setSendResult(null);

    } finally {
        setIsSending(false);
    }
  };


  return (
    <div className="bg-[#0a092d] text-white min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            AI-Powered Cold Email Assistant
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-300">
            Enter your details, generate a cover letter, and automatically email it to relevant HRs.
          </p>
        </div>

        {/* --- Main form for submitting to backend --- */}
        <form onSubmit={handleSendEmails} className="space-y-12">
            
            {/* --- Section 1: User Credentials & App Password Tutorial --- */}
            <div className="glass-card p-8 md:p-10 rounded-xl">
                <h2 className="text-3xl font-bold text-white mb-6">Step 1: Your Credentials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="userEmail" label="Your Email Address" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="e.g., your.email@gmail.com" type="email" required />
                    <InputField id="appPassword" label="Your Email App Password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} placeholder="Enter 16-digit app password" type="password" required />
                </div>
                <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-indigo-400 mb-3">How to Generate an App Password?</h3>
                    <p className="text-gray-300 mb-4">To send emails directly from our app, you need a special 16-digit "App Password" from your Google Account. This is safer than using your main password. Here's how:</p>
                    <ol className="list-decimal list-inside text-gray-400 space-y-2 mb-4">
                        <li>Go to your <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Account</a>.</li>
                        <li>Navigate to the "Security" section.</li>
                        <li>Under "How you sign in to Google," ensure 2-Step Verification is **ON**.</li>
                        <li>Click on "App passwords". You may need to sign in again.</li>
                        <li>Under "Select app," choose "Other (Custom name)," name it "Cold Email Tool," and click "Generate."</li>
                        <li>Copy the 16-digit password and paste it above.</li>
                    </ol>
                    <div className="aspect-w-16 aspect-h-9 flex justify-center">
                         <iframe width="560" height="315" src="https://www.youtube.com/embed/N_J3HCATA1c?si=bZhn4jh7Z98-HKQr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                </div>
            </div>

            {/* --- Section 2: Cover Letter Generator --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="glass-card p-8 md:p-10 rounded-xl">
                <h2 className="text-3xl font-bold text-white mb-6">Step 2: Generate Cover Letter</h2>
                <div className="space-y-6">
                  <InputField id="yourName" label="Your Full Name" value={formData.yourName} onChange={handleChange} placeholder="e.g., Jane Doe" required />
                  <InputField id="hiringManagerName" label="Hiring Manager's Name (Optional)" value={formData.hiringManagerName} onChange={handleChange} placeholder="e.g., John Smith" />
                  <InputField id="companyName" label="Company Name" value={formData.companyName} onChange={handleChange} placeholder="e.g., Acme Inc." required />
                  <InputField id="jobTitle" label="Job Title You're Applying For" value={formData.jobTitle} onChange={handleChange} placeholder="e.g., Software Engineer" required />
                  <div>
                    <label htmlFor="keySkills" className="block text-sm font-medium text-gray-400 mb-2">Your Key Skills & Experience</label>
                    <textarea name="keySkills" id="keySkills" rows="5" value={formData.keySkills} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Briefly describe your most relevant skills and accomplishments..." required></textarea>
                  </div>
                  <div>
                    <button type="button" onClick={handleGenerate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all disabled:opacity-50" disabled={isGenerating}>
                      {isGenerating ? 'Generating...' : 'Generate Letter'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 md:p-10 rounded-xl flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-3xl font-bold text-white">Generated Letter</h2>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={handleEnhanceWithAI} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2" disabled={!generatedLetter || isEnhancing}>
                            {isEnhancing ? 'Enhancing...' : '✨ Enhance with AI'}
                        </button>
                        <button type="button" onClick={handleCopyToClipboard} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50" disabled={!generatedLetter}>
                            Copy
                        </button>
                    </div>
                </div>
                {copySuccess && <p className="text-center text-green-400 mb-4">{copySuccess}</p>}
                <div className="bg-gray-900/70 rounded-lg p-6 border border-gray-700 flex-grow h-[450px] overflow-y-auto">
                  {generatedLetter ? (
                    <pre ref={letterOutputRef} className="text-gray-300 whitespace-pre-wrap text-base font-sans">{generatedLetter}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Your cover letter will appear here...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Section 3: Resume Upload & Final Submission --- */}
            <div className="glass-card p-8 md:p-10 rounded-xl">
                <h2 className="text-3xl font-bold text-white mb-6">Step 3: Add Your Resume & Send</h2>
                <div>
                    <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-400 mb-2">Upload Your Resume (PDF only)</label>
                    <input
                        type="file"
                        id="resumeFile"
                        name="resumeFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                        required
                    />
                    {resumeFile && <p className="text-green-400 mt-2">File selected: {resumeFile.name}</p>}
                </div>
                <div className="mt-8">
                     <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3" disabled={isSending}>
                        {isSending ? 'Sending Applications...' : '🚀 Send to HRs'}
                    </button>
                </div>
            </div>

             {/* --- Global Error/Success Display --- */}
            {error && <p className="text-center text-red-400 mt-4 text-lg">{error}</p>}

        </form>

        {/* --- Section to Display Backend Response --- */}
        {sendResult && sendResult.status === 'success' && (
            <div className="mt-16 glass-card p-8 md:p-10 rounded-xl">
                <h2 className="text-3xl font-bold text-green-400 mb-6">🎉 Success! Applications Sent</h2>
                <p className="text-gray-300 mb-6">Your resume and cover letter were successfully sent to the following contacts:</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">HR Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Email Sent To</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Time Sent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {sendResult.details.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-white">{item.hr_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{item.hr_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{item.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{item.email_sent_to}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(item.time_sent).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CoverLetterGenerator;
