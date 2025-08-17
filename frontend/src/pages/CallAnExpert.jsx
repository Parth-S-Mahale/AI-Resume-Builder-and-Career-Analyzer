import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- DUMMY DATA ---
// This would typically come from a database/API
const experts = [
  {
    id: 1,
    name: 'Danyal Ahmad',
    role: 'Senior Software Engineer',
    company: 'Google',
    email: 'danyalahmad.22311938@viit.ac.in',
    avatar: 'https://media.istockphoto.com/id/1309328823/photo/headshot-portrait-of-smiling-male-employee-in-office.jpg?s=612x612&w=0&k=20&c=kPvoBm6qCYzQXMAn9JUtqLREXe9-PlZyMl9i-ibaVuY=',
  },
  {
    id: 2,
    name: 'Aisha Khan',
    role: 'Product Manager',
    company: 'Microsoft',
    email: 'aishakhan@example.com',
    avatar: 'https://static.vecteezy.com/system/resources/previews/046/966/581/non_2x/portrait-of-a-young-business-woman-in-a-black-suit-free-photo.jpeg',
  },
  {
    id: 3,
    name: 'Parth Mahale',
    role: 'UX/UI Design Lead',
    company: 'Apple',
    email: 'parthmahale5167@gmail.com',
    avatar: 'https://media.istockphoto.com/id/1424912588/photo/happy-successful-business-leader-in-glasses-head-shot.jpg?s=612x612&w=0&k=20&c=GizPOAVVozzV4PVM77--TREaf1llXST2_n0V58-hEiY=',
  },
  {
    id: 4,
    name: 'Maria Garcia',
    role: 'Data Scientist',
    company: 'Amazon',
    email: 'mariagarcia@example.com',
    avatar: 'https://static.vecteezy.com/system/resources/previews/046/966/581/non_2x/portrait-of-a-young-business-woman-in-a-black-suit-free-photo.jpeg',
  },
  {
    id: 5,
    name: 'James Smith',
    role: 'Cloud Solutions Architect',
    company: 'Netflix',
    email: 'jamessmith@example.com',
    avatar: 'https://media.istockphoto.com/id/1309328823/photo/headshot-portrait-of-smiling-male-employee-in-office.jpg?s=612x612&w=0&k=20&c=kPvoBm6qCYzQXMAn9JUtqLREXe9-PlZyMl9i-ibaVuY=',
  },
  {
    id: 6,
    name: 'Priya Patel',
    role: 'Marketing Director',
    company: 'Facebook',
    email: 'priyapatel@example.com',
    avatar: 'https://static.vecteezy.com/system/resources/previews/046/966/581/non_2x/portrait-of-a-young-business-woman-in-a-black-suit-free-photo.jpeg',
  },
];

// --- STYLES (from your theme) ---
const GlobalStyles = () => (
  <style jsx="true" global="true">{`
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
    .btn-primary {
      background: linear-gradient(90deg, #4f46e5, #818cf8);
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(79, 70, 229, 0.7);
    }
    .btn-secondary {
      background-color: rgba(31, 41, 55, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }
    .btn-secondary:hover {
      background-color: #4f46e5;
    }
    .section-title {
      background: -webkit-linear-gradient(45deg, #818cf8, #e5e7eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `}</style>
);


// --- COMPONENTS ---

// ExpertCard Component: Displays individual expert information
const ExpertCard = ({ expert, onConnect }) => {
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center">
      <img
        src={expert.avatar}
        alt={`Portrait of ${expert.name}`}
        className="w-24 h-24 rounded-full mb-4 border-4 border-gray-700 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/374151/9CA3AF?text='; }}
      />
      <h3 className="text-xl font-bold text-white">{expert.name}</h3>
      <p className="text-md text-indigo-400 font-semibold">{expert.role}</p>
      <p className="text-sm text-gray-400 mb-4">{expert.company}</p>
      <button
        onClick={() => onConnect(expert)}
        className="w-full btn-primary text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Connect
      </button>
    </div>
  );
};

// ConnectModal Component: Modal for entering email and initiating the call
const ConnectModal = ({ expert, onClose }) => {
  const [applicantEmail, setApplicantEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantEmail) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');

    const requestData = {
      applicant_email: applicantEmail,
      expert_email: expert.email,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/jitsi/create-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.meeting_url) {
        window.open(result.meeting_url, '_blank');
        onClose();
      } else {
        throw new Error('Meeting URL not found in response.');
      }

    } catch (err) {
      console.error('Failed to create meeting:', err);
      setError(err.message || 'Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="glass-card p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Connect with {expert.name}</h2>
        <p className="text-center text-gray-400 mb-6">Enter your email to start the video call.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Meeting...' : 'Start Video Call'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full btn-secondary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Main Page Component
export default function CallAnExpertPage() {
  const canvasRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  // Effect for Three.js background animation
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: 0x818cf8 });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 1.5;
    const clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particlesMesh.rotation.y = -0.1 * elapsedTime;
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

  const handleConnectClick = (expert) => {
    setSelectedExpert(expert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpert(null);
  };

  return (
    <div className="bg-[#05041e] text-gray-200 min-h-screen font-sans">
      <GlobalStyles />
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.4 }}></canvas>
      
      <div className="relative z-10">
        <header className="text-center pt-16 pb-12">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight section-title">
                Connect With an Expert
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-400 mt-4">
                Get 1-on-1 guidance for resume reviews, mock interviews, and career advice from seasoned professionals.
            </p>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} onConnect={handleConnectClick} />
            ))}
          </div>
        </main>

        {isModalOpen && selectedExpert && (
          <ConnectModal
            expert={selectedExpert}
            onClose={handleCloseModal}
          />
        )}

        <footer className="text-center py-8 mt-16 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} CareerCrafter.ai. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
