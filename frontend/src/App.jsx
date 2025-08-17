import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import * as THREE from "three";

// --- Page & Component Imports ---
import Navbar from "./components/Navbar.jsx";
import JobsPage from "./components/JobsPage.jsx";
import CoursesPage from "./components/CoursesPage.jsx";
import InternshipsPage from "./components/InternshipsPage.jsx";
import CareerPathPage from "./components/CareerPathPage.jsx";
import ContactPage from "./components/ContactPage.jsx";
import BuildResumePage from "./pages/BuildResumePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import DeleteAccountPage from "./pages/DeleteAccountPage.jsx";
import SkillRoadmapPage from "./pages/SkillRoadmapPage.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";

// --- Context Provider ---
import { AuthProvider } from "./context/AuthContext";
import SelectionPage from "./pages/SelectionPage.jsx";
import AnalyzeResumePage from "./pages/AnalyzeResumePage.jsx";
import AnalyzeWithJD from "./pages/AnalyzeWithJD.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import CallAnExpert from "./pages/CallAnExpert.jsx";


const NotFoundPage = () => (
  <div className="text-white text-center p-20 text-3xl font-bold">
    404 - Page Not Found
  </div>
);

// --- Global Styles Component ---
const GlobalStyles = () => (
  <style jsx="true" global="true">{`
    body {
      font-family: "Inter", sans-serif;
      background-color: #05041e;
      color: #e5e7eb;
      overflow-x: hidden;
    }
    #hero-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.4;
    }
    .hero-content {
      position: relative;
      z-index: 1;
    }
    .glass-card {
      background: rgba(17, 24, 39, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      transition: all 0.3s ease;
    }
    .glass-card:hover {
      transform: translateY(-8px);
      background: rgba(79, 70, 229, 0.2);
      border-color: rgba(79, 70, 229, 0.8);
    }
    .feature-card {
      background: rgba(17, 24, 39, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-8px);
      background: rgba(79, 70, 229, 0.2);
      border-color: rgba(79, 70, 229, 0.8);
    }
    .btn-primary {
      background: linear-gradient(90deg, #4f46e5, #818cf8);
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(79, 70, 229, 0.7);
    }
    .btn-secondary {
      background-color: transparent;
      border: 2px solid #4f46e5;
      transition: all 0.3s ease;
    }
    .btn-secondary:hover {
      background-color: #4f46e5;
      transform: scale(1.05);
    }
    .section-title {
      background: -webkit-linear-gradient(45deg, #818cf8, #e5e7eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .scroll-animation {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .scroll-animation.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `}</style>
);

// --- HomePage Component (with animations) ---
const HomePage = () => {
  const canvasRef = useRef(null);

  // Effect for Three.js background animation
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x818cf8,
    });
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);
    camera.position.z = 1.5;
    const clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particlesMesh.rotation.y = -0.1 * elapsedTime;
      particlesMesh.rotation.x = -0.1 * elapsedTime;
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Effect for scroll animations
  useEffect(() => {
    const scrollAnimations = document.querySelectorAll(".scroll-animation");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    scrollAnimations.forEach((el) => observer.observe(el));
    return () => scrollAnimations.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="antialiased">
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <canvas id="hero-canvas" ref={canvasRef}></canvas>
        <div className="hero-content text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Craft Your Future.
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Land Your Dream Job.
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
            Our AI analyzes your resume, pinpoints your best career moves, and
            prepares you for success. Stop guessing, start growing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/selection-page"
              className="btn-primary text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg text-center"
            >
              Analyze Resume
            </Link>
            <Link
              to="/build-resume"
              className="btn-secondary text-white font-bold py-3 px-8 rounded-full text-lg text-center"
            >
              Build Resume
            </Link>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight section-title">
              Find Your Next Opportunity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <Link
              to="/jobs"
              className="block text-center p-8 glass-card scroll-animation"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                1. Need Jobs
              </h3>
              <p className="text-gray-400">
                Search and apply for top job opportunities from leading
                companies.
              </p>
            </Link>

            <Link
              to="/internships"
              className="block text-center p-8 glass-card scroll-animation"
              style={{ transitionDelay: "200ms" }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                2. Need Internships
              </h3>
              <p className="text-gray-400">
                Kickstart your career with internships from innovative startups
                and established firms.
              </p>
            </Link>

            <Link
              to="/courses"
              className="block text-center p-8 glass-card scroll-animation"
              style={{ transitionDelay: "400ms" }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                3. Need Courses
              </h3>
              <p className="text-gray-400">
                Upskill and enhance your resume with courses from top
                universities and platforms.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-[#0a092d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight section-title">
              Your All-in-One Career Co-Pilot
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Go beyond a simple score. CareerCrafter gives you the tools to
              strategize and win.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl feature-card scroll-animation">
              <h3 className="text-xl font-bold text-white mb-3">
                AI Resume Analysis
              </h3>
              <p className="text-gray-400">
                Get an instant ATS score and keyword analysis to ensure your
                resume beats the bots.
              </p>
            </div>
            <div
              className="p-8 rounded-2xl feature-card scroll-animation"
              style={{ transitionDelay: "100ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                Targeted Job Matching
              </h3>
              <p className="text-gray-400">
                Paste a job description to see how you stack up and get specific
                advice on what to add.
              </p>
            </div>
            <div
              className="p-8 rounded-2xl feature-card scroll-animation"
              style={{ transitionDelay: "200ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                Career Path Navigator
              </h3>
              <p className="text-gray-400">
                Visualize your long-term career growth and the skills needed at
                every step.
              </p>
            </div>
            <div
              className="p-8 rounded-2xl feature-card scroll-animation"
              style={{ transitionDelay: "300ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                Skill Gap & Learning Hub
              </h3>
              <p className="text-gray-400">
                Identify missing skills and get recommendations for courses and
                portfolio projects.
              </p>
            </div>
            <div
              className="p-8 rounded-2xl feature-card scroll-animation"
              style={{ transitionDelay: "400ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                Live Job Postings
              </h3>
              <p className="text-gray-400">
                We fetch real-time job openings from across the web that are a
                perfect fit for you.
              </p>
            </div>
            <div
              className="p-8 rounded-2xl feature-card scroll-animation"
              style={{ transitionDelay: "500ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                AI Interview Prep Coach
              </h3>
              <p className="text-gray-400">
                Generate personalized technical and behavioral questions to ace
                your interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 CareerCrafter.ai. All Rights Reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">Pune, Maharashtra, India</p>
        </div>
      </footer>
    </div>
  );
};

// --- Main App Component (Router Setup) ---
function App() {
  return (
    // Correctly wrap AuthProvider inside Router
    <Router>
      <AuthProvider>
        <Navbar />
        <GlobalStyles />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/selection-page" element={<SelectionPage />} />
            <Route path="/analyze-resume" element={<AnalyzeResumePage />} />
            <Route path="/analyze-jd" element={<AnalyzeWithJD />} />
            <Route path="/build-resume" element={<BuildResumePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/internships" element={<InternshipsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/expert-guidance" element={<CallAnExpert />} />
            <Route path="/career-path" element={<CareerPathPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/premium" element={<SubscriptionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/delete-account" element={<DeleteAccountPage />} />
            <Route path="/learn/:skillName" element={<SkillRoadmapPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
