import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../context/AuthContext"; // Import auth hook
import {
  PDFViewer,
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Font,
  pdf, // Import the 'pdf' renderer
} from "@react-pdf/renderer";

// --- STYLING & FONT REGISTRATION FOR THE PDF DOCUMENT ---
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Open Sans",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.5,
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: 9,
    color: "#4a5568",
    marginTop: 5,
  },
  link: {
    color: "#2b6cb0",
    textDecoration: "none",
  },
  divider: {
    marginHorizontal: 5,
    color: "#cbd5e0",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d3748",
    borderBottomWidth: 1.5,
    borderBottomColor: "#cbd5e0",
    paddingBottom: 3,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  subsection: {
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  company: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#4a5568",
  },
  companyName: {
    fontStyle: "italic",
  },
  description: {
    fontSize: 10,
    textAlign: "justify",
    marginTop: 2,
  },
  listItem: {
    flexDirection: "row",
  },
  bullet: {
    width: 10,
    fontSize: 10,
    textAlign: "center",
  },
  listItemContent: {
    flex: 1,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillCategory: {
    fontWeight: "bold",
  },
  skillText: {
    fontSize: 10,
    width: "100%",
    marginBottom: 2,
  },
  certificationList: {
    paddingLeft: 10,
  },
});

// --- PDF Document Component (with safeguards) ---
const ResumePdfDocument = ({ data }) => (
  <Document
    author={data.personal?.name || "User"}
    title={`Resume - ${data.personal?.name || "Resume"}`}
  >
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{data.personal?.name || ""}</Text>
        <View style={styles.contactInfo}>
          <Link
            style={styles.link}
            src={`mailto:${data.personal?.email || ""}`}
          >
            {data.personal?.email || ""}
          </Link>
          {data.personal?.phone && <Text style={styles.divider}>|</Text>}
          {data.personal?.phone && <Text>{data.personal.phone}</Text>}
          {data.personal?.address && <Text style={styles.divider}>|</Text>}
          {data.personal?.address && <Text>{data.personal.address}</Text>}
        </View>
        <View style={styles.contactInfo}>
          {data.personal?.linkedin && (
            <Link style={styles.link} src={data.personal.linkedin}>
              {data.personal.linkedin}
            </Link>
          )}
          {data.personal?.portfolio && <Text style={styles.divider}>|</Text>}
          {data.personal?.portfolio && (
            <Link style={styles.link} src={data.personal.portfolio}>
              {data.personal.portfolio}
            </Link>
          )}
        </View>
      </View>

      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.description}>{data.summary || ""}</Text>
        </View>
      )}

      {(data.experience || []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {(data.experience || []).map((exp, i) => (
            <View key={i} style={styles.subsection}>
              <View style={styles.company}>
                <Text style={styles.jobTitle}>{exp.title || ""}</Text>
                <Text>
                  {exp.startDate || ""} - {exp.endDate || ""}
                </Text>
              </View>
              <Text style={styles.companyName}>{exp.company || ""}</Text>
              <Text style={styles.description}>{exp.description || ""}</Text>
            </View>
          ))}
        </View>
      )}

      {(data.projects || []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {(data.projects || []).map((proj, i) => (
            <View key={i} style={styles.subsection}>
              <Text style={styles.jobTitle}>{proj.project_name || ""}</Text>
              <Text style={styles.description}>{proj.description || ""}</Text>
              <Text
                style={{
                  fontStyle: "italic",
                  fontSize: 9,
                  color: "#4a5568",
                  marginTop: 2,
                }}
              >
                Tech Stack: {proj.tech_stack || ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(data.education || []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {(data.education || []).map((edu, i) => (
            <View key={i} style={styles.subsection}>
              <View style={styles.company}>
                <Text style={styles.jobTitle}>{edu.degree || ""}</Text>
                <Text>{edu.gradDate || ""}</Text>
              </View>
              <Text style={styles.companyName}>{edu.school || ""}</Text>
            </View>
          ))}
        </View>
      )}

      {(data.achievements || []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {(data.achievements || []).map((ach, i) => (
            <View key={i} style={styles.subsection}>
              <Text style={styles.jobTitle}>{ach.title || ""}</Text>
              <Text style={styles.description}>{ach.description || ""}</Text>
            </View>
          ))}
        </View>
      )}

      {/* --- KEY CHANGE: Conditional rendering for the entire skills section --- */}
      {(data.skills?.languages ||
        data.skills?.frameworks ||
        data.skills?.tools ||
        data.skills?.softskills) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {data.skills.languages && (
            <Text style={styles.skillText}>
              <Text style={styles.skillCategory}>Languages: </Text>
              {data.skills.languages}
            </Text>
          )}
          {data.skills.frameworks && (
            <Text style={styles.skillText}>
              <Text style={styles.skillCategory}>Frameworks/Libraries: </Text>
              {data.skills.frameworks}
            </Text>
          )}
          {data.skills.tools && (
            <Text style={styles.skillText}>
              <Text style={styles.skillCategory}>Tools/Platforms: </Text>
              {data.skills.tools}
            </Text>
          )}
          {data.skills.softskills && (
            <Text style={styles.skillText}>
              <Text style={styles.skillCategory}>Soft Skills: </Text>
              {data.skills.softskills}
            </Text>
          )}
        </View>
      )}

      {(data.certifications || []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certificationList}>
            {(data.certifications || []).map((cert, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemContent}>{cert || ""}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

// --- Helper Components for UI ---
const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-400 mb-2"
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
    />
  </div>
);

const DynamicTextarea = ({ label, name, value, onChange, placeholder }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-400 mb-2"
      >
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows="1"
        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none overflow-hidden"
      ></textarea>
    </div>
  );
};

const SuggestionModal = ({
  isOpen,
  onClose,
  originalText,
  suggestions,
  onSelect,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a092d] border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold text-white mb-4 flex-shrink-0">
          AI Suggestions
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <svg
              className="animate-spin h-8 w-8 text-indigo-400"
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
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
            <div className="border border-slate-600 rounded-lg p-4">
              <h3 className="font-semibold text-gray-400 mb-2">
                Your Original Text
              </h3>
              <p className="text-gray-300 mb-3">{originalText}</p>
              <button
                onClick={() => onSelect(originalText)}
                className="text-sm font-bold text-white py-2 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Keep Original
              </button>
            </div>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-slate-700 rounded-lg p-4 bg-slate-800/30"
              >
                <h3 className="font-semibold text-indigo-300 mb-2">
                  Suggestion {index + 1}
                </h3>
                <p className="text-slate-200 mb-3">{suggestion}</p>
                <button
                  onClick={() => onSelect(suggestion)}
                  className="text-sm font-bold text-white py-2 px-4 rounded-full bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Use This
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full text-center py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-semibold flex-shrink-0"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// --- Main BuildResumePage Component ---
const BuildResumePage = () => {
  const auth = useAuth();
  const navigate = useNavigate(); // Get the navigate function
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    projects: [],
    education: [],
    achievements: [],
    skills: { languages: "", frameworks: "", tools: "", softskills: "" },
    certifications: [],
  });

  const [debouncedResumeData, setDebouncedResumeData] = useState(resumeData);

  const [currentStep, setCurrentStep] = useState("personal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [originalText, setOriginalText] = useState("");
  const [suggestionTarget, setSuggestionTarget] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (auth.isAuthenticated && auth.userEmail) {
      setResumeData((prev) => ({
        ...prev,
        personal: { ...prev.personal, email: auth.userEmail },
      }));
    }
  }, [auth.isAuthenticated, auth.userEmail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResumeData(resumeData);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [resumeData]);

  const [tempExperience, setTempExperience] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [tempProject, setTempProject] = useState({
    project_name: "",
    description: "",
    tech_stack: "",
  });
  const [tempAchievement, setTempAchievement] = useState({
    title: "",
    description: "",
  });
  const [tempEducation, setTempEducation] = useState({
    degree: "",
    school: "",
    location: "",
    gradDate: "",
  });
  const [tempCertification, setTempCertification] = useState("");

  const handlePersonalChange = (e) =>
    setResumeData((p) => ({
      ...p,
      personal: { ...p.personal, [e.target.name]: e.target.value },
    }));
  const handleSummaryChange = (e) =>
    setResumeData((p) => ({ ...p, summary: e.target.value }));
  const handleSkillsChange = (e) =>
    setResumeData((p) => ({
      ...p,
      skills: { ...p.skills, [e.target.name]: e.target.value },
    }));

  const addExperience = () => {
    if (tempExperience.title && tempExperience.company) {
      setResumeData((p) => ({
        ...p,
        experience: [...p.experience, tempExperience],
      }));
      setTempExperience({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  };
  const addProject = () => {
    if (tempProject.project_name) {
      setResumeData((p) => ({ ...p, projects: [...p.projects, tempProject] }));
      setTempProject({ project_name: "", description: "", tech_stack: "" });
    }
  };
  const addAchievement = () => {
    if (tempAchievement.title) {
      setResumeData((p) => ({
        ...p,
        achievements: [...p.achievements, tempAchievement],
      }));
      setTempAchievement({ title: "", description: "" });
    }
  };
  const addEducation = () => {
    if (tempEducation.degree && tempEducation.school) {
      setResumeData((p) => ({
        ...p,
        education: [...p.education, tempEducation],
      }));
      setTempEducation({ degree: "", school: "", location: "", gradDate: "" });
    }
  };
  const addCertification = () => {
    if (
      tempCertification &&
      !resumeData.certifications.includes(tempCertification)
    ) {
      setResumeData((p) => ({
        ...p,
        certifications: [...p.certifications, tempCertification],
      }));
      setTempCertification("");
    }
  };

  const handleGenerateAI = async (textToEnhance, fieldUpdater) => {
    if (!textToEnhance) return;
    setOriginalText(textToEnhance);
    setSuggestionTarget(() => fieldUpdater);
    setAiSuggestions([]);
    setIsModalOpen(true);
    setIsGenerating(true);
    const prompt = `Rewrite the following resume text to be more professional, achievement-oriented, and ATS-friendly. Provide 3 distinct options. Return ONLY a JSON object with a single key "suggestions" which is an array of 3 strings. Do not include any other text or explanation. Original text: "${textToEnhance}"`;
    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              suggestions: { type: "ARRAY", items: { type: "STRING" } },
            },
          },
        },
      };
      const apiKey = "AIzaSyBz8BpqNokZLzznpuV2-sYT3f_uPDEh89c";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.candidates && result.candidates[0].content.parts[0].text) {
        const parsedJson = JSON.parse(
          result.candidates[0].content.parts[0].text
        );
        setAiSuggestions(parsedJson.suggestions || []);
      } else {
        throw new Error("AI suggestion format is invalid.");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      setSaveMessage({
        type: "error",
        text: "AI generation failed. Please try again.",
      });
      setIsModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestion = (text) => {
    if (suggestionTarget) suggestionTarget(text);
    setIsModalOpen(false);
  };

  const handleSavePdf = async () => {
    if (!auth.isAuthenticated) {
      setSaveMessage({
        type: "error",
        text: "You must be logged in to save your resume.",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      const blob = await pdf(
        <ResumePdfDocument data={debouncedResumeData} />
      ).toBlob();

      const formData = new FormData();
      formData.append(
        "file",
        blob,
        `${
          debouncedResumeData.personal?.name?.replace(/\s+/g, "_") || "resume"
        }_Resume.pdf`
      );

      const response = await fetch("http://127.0.0.1:8000/save-resume", {
        method: "POST",
        body: formData,
        credentials: "include", // This is critical for sending session cookies!
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to save the resume.");
      }

      // --- KEY CHANGE: Redirect immediately on success ---
      // The message is no longer needed as we are navigating away.
      navigate("/dashboard");

    } catch (error) {
      console.error("Failed to save PDF:", error);
      setSaveMessage({
        type: "error",
        text: error.message || "An error occurred while saving.",
      });
      setIsSaving(false); // Only set saving to false on error
    } 
    // We don't need a finally block to set isSaving to false,
    // because on success, the component will unmount.
  };

  const renderStep = () => {
    switch (currentStep) {
      case "personal":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Personal Information
            </h3>
            <Input
              label="Full Name"
              name="name"
              value={resumeData.personal.name}
              onChange={handlePersonalChange}
              placeholder="John Doe"
            />
            <Input
              label="Email"
              name="email"
              value={resumeData.personal.email}
              onChange={handlePersonalChange}
              placeholder="john.doe@email.com"
              type="email"
            />
            <Input
              label="Phone"
              name="phone"
              value={resumeData.personal.phone}
              onChange={handlePersonalChange}
              placeholder="+91 12345 67890"
            />
            <Input
              label="Address"
              name="address"
              value={resumeData.personal.address}
              onChange={handlePersonalChange}
              placeholder="City, State"
            />
            <Input
              label="LinkedIn Profile"
              name="linkedin"
              value={resumeData.personal.linkedin}
              onChange={handlePersonalChange}
              placeholder="linkedin.com/in/johndoe"
            />
            <Input
              label="Portfolio/Website"
              name="portfolio"
              value={resumeData.personal.portfolio}
              onChange={handlePersonalChange}
              placeholder="github.com/johndoe"
            />
          </div>
        );
      case "summary":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Professional Summary
            </h3>
            <DynamicTextarea
              label="Summary"
              name="summary"
              value={resumeData.summary}
              onChange={handleSummaryChange}
              placeholder="A brief summary of your career objectives..."
            />
            <button
              onClick={() =>
                handleGenerateAI(resumeData.summary, (text) =>
                  setResumeData((p) => ({ ...p, summary: text }))
                )
              }
              className="btn-secondary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              ✨ Generate with AI
            </button>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Work Experience</h3>
            <Input
              label="Job Title"
              name="title"
              value={tempExperience.title}
              onChange={(e) =>
                setTempExperience({ ...tempExperience, title: e.target.value })
              }
              placeholder="Software Engineer"
            />
            <Input
              label="Company"
              name="company"
              value={tempExperience.company}
              onChange={(e) =>
                setTempExperience({
                  ...tempExperience,
                  company: e.target.value,
                })
              }
              placeholder="Tech Corp"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                name="startDate"
                value={tempExperience.startDate}
                onChange={(e) =>
                  setTempExperience({
                    ...tempExperience,
                    startDate: e.target.value,
                  })
                }
                placeholder="Month YYYY"
              />
              <Input
                label="End Date"
                name="endDate"
                value={tempExperience.endDate}
                onChange={(e) =>
                  setTempExperience({
                    ...tempExperience,
                    endDate: e.target.value,
                  })
                }
                placeholder="Present"
              />
            </div>
            <DynamicTextarea
              label="Description"
              name="description"
              value={tempExperience.description}
              onChange={(e) =>
                setTempExperience({
                  ...tempExperience,
                  description: e.target.value,
                })
              }
              placeholder="Describe your responsibilities..."
            />
            <button
              onClick={() =>
                handleGenerateAI(tempExperience.description, (text) =>
                  setTempExperience((p) => ({ ...p, description: text }))
                )
              }
              className="btn-secondary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              ✨ Enhance Description with AI
            </button>
            <button
              onClick={addExperience}
              className="btn-primary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              Add Experience
            </button>
          </div>
        );
      case "projects":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Projects</h3>
            <Input
              label="Project Name"
              name="project_name"
              value={tempProject.project_name}
              onChange={(e) =>
                setTempProject({ ...tempProject, project_name: e.target.value })
              }
              placeholder="AI Resume Builder"
            />
            <DynamicTextarea
              label="Description"
              name="description"
              value={tempProject.description}
              onChange={(e) =>
                setTempProject({ ...tempProject, description: e.target.value })
              }
              placeholder="Describe the project..."
            />
            <button
              onClick={() =>
                handleGenerateAI(tempProject.description, (text) =>
                  setTempProject((p) => ({ ...p, description: text }))
                )
              }
              className="btn-secondary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              ✨ Enhance Description with AI
            </button>
            <Input
              label="Tech Stack"
              name="tech_stack"
              value={tempProject.tech_stack}
              onChange={(e) =>
                setTempProject({ ...tempProject, tech_stack: e.target.value })
              }
              placeholder="e.g., React, Node.js, Tailwind CSS"
            />
            <button
              onClick={addProject}
              className="btn-primary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              Add Project
            </button>
          </div>
        );
      case "education":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Education</h3>
            <Input
              label="Degree / Certificate"
              name="degree"
              value={tempEducation.degree}
              onChange={(e) =>
                setTempEducation({ ...tempEducation, degree: e.target.value })
              }
              placeholder="B.Tech in Computer Science"
            />
            <Input
              label="School / University"
              name="school"
              value={tempEducation.school}
              onChange={(e) =>
                setTempEducation({ ...tempEducation, school: e.target.value })
              }
              placeholder="University of Technology"
            />
            <Input
              label="Graduation Date"
              name="gradDate"
              value={tempEducation.gradDate}
              onChange={(e) =>
                setTempEducation({ ...tempEducation, gradDate: e.target.value })
              }
              placeholder="Month YYYY"
            />
            <button
              onClick={addEducation}
              className="btn-primary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              Add Education
            </button>
          </div>
        );
      case "achievements":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Achievements</h3>
            <Input
              label="Achievement Title"
              name="title"
              value={tempAchievement.title}
              onChange={(e) =>
                setTempAchievement({
                  ...tempAchievement,
                  title: e.target.value,
                })
              }
              placeholder="e.g., Hackathon Winner"
            />
            <DynamicTextarea
              label="Description"
              name="description"
              value={tempAchievement.description}
              onChange={(e) =>
                setTempAchievement({
                  ...tempAchievement,
                  description: e.target.value,
                })
              }
              placeholder="Describe the achievement..."
            />
            <button
              onClick={() =>
                handleGenerateAI(tempAchievement.description, (text) =>
                  setTempAchievement((p) => ({ ...p, description: text }))
                )
              }
              className="btn-secondary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              ✨ Enhance Description with AI
            </button>
            <button
              onClick={addAchievement}
              className="btn-primary text-white font-bold py-2 px-6 rounded-full text-sm w-full"
            >
              Add Achievement
            </button>
          </div>
        );
      case "skills":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Skills</h3>
            <DynamicTextarea
              label="Programming Languages"
              name="languages"
              value={resumeData.skills.languages}
              onChange={handleSkillsChange}
              placeholder="e.g., JavaScript, Python, Java"
            />
            <DynamicTextarea
              label="Frameworks & Libraries"
              name="frameworks"
              value={resumeData.skills.frameworks}
              onChange={handleSkillsChange}
              placeholder="e.g., React, Node.js, Django"
            />
            <DynamicTextarea
              label="Tools & Platforms"
              name="tools"
              value={resumeData.skills.tools}
              onChange={handleSkillsChange}
              placeholder="e.g., Git, Docker, AWS"
            />
            <DynamicTextarea
              label="Soft Skills"
              name="softskills"
              value={resumeData.skills.softskills}
              onChange={handleSkillsChange}
              placeholder="e.g., Teamwork, Communication"
            />
          </div>
        );
      case "certifications":
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Certifications</h3>
            <div className="flex gap-4">
              <Input
                label="Add a certification"
                name="certification"
                value={tempCertification}
                onChange={(e) => setTempCertification(e.target.value)}
                placeholder="e.g., AWS Certified Developer"
              />
              <button
                onClick={addCertification}
                className="btn-primary text-white font-bold py-2 px-6 rounded-full self-end"
              >
                Add
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    "personal",
    "summary",
    "experience",
    "projects",
    "education",
    "achievements",
    "skills",
    "certifications",
  ];

  return (
    <div className="bg-[#05041E] text-white min-h-screen p-4 sm:p-8">
      <SuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originalText={originalText}
        suggestions={aiSuggestions}
        onSelect={handleSelectSuggestion}
        isLoading={isGenerating}
      />
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter section-title">
          Build Your Resume
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
          Create a professional, ATS-friendly resume with the power of AI.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 md:p-8 space-y-8">
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`capitalize font-semibold py-2 px-4 rounded-full text-sm transition-all whitespace-nowrap ${
                  currentStep === step
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-700 my-4"></div>
          {renderStep()}
        </div>

        <div className="glass-card p-6 flex flex-col h-full">
          <h3 className="text-2xl font-bold text-white mb-4 text-left flex-shrink-0">
            Live Preview
          </h3>
          <div className="flex-grow min-h-[60vh] lg:h-auto border border-slate-700 rounded-lg overflow-hidden">
            <PDFViewer
              width="100%"
              height="100%"
              showToolbar={false}
              style={{ border: "none" }}
            >
              <ResumePdfDocument data={debouncedResumeData} />
            </PDFViewer>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <PDFDownloadLink
              document={<ResumePdfDocument data={debouncedResumeData} />}
              fileName={`${
                resumeData.personal?.name?.replace(" ", "_") || "resume"
              }_Resume.pdf`}
              className="w-full"
            >
              {({ loading }) => (
                <button
                  className="w-full btn-secondary text-white font-bold py-3 px-8 rounded-full text-lg text-center disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Building..." : "Download"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
          {saveMessage.text && (
            <p
              className={`mt-4 text-center text-sm ${
                saveMessage.type === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {saveMessage.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildResumePage;
