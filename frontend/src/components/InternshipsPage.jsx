import React, { useState, useEffect } from 'react';

// --- Reusable InternshipCard Component (No changes needed) ---
const InternshipCard = ({ companyLogo, companyName, internshipTitle, address, applyLink, postDate }) => {
    const [postedAgo, setPostedAgo] = useState('');

    useEffect(() => {
        const calculateTimeAgo = () => {
            if (!postDate || postDate === 'N/A') {
                setPostedAgo('Date not available');
                return;
            }
            const postDateObj = new Date(postDate);
            const now = new Date();

            if (postDateObj > now) {
                 setPostedAgo('Future posting');
                 return;
            }

            const timeDiff = now.getTime() - postDateObj.getTime();
            const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24));

            if (daysAgo < 0) {
                 setPostedAgo('Future posting');
            } else if (daysAgo === 0) {
                setPostedAgo('Posted today');
            } else if (daysAgo === 1) {
                setPostedAgo('Posted 1 day ago');
            } else {
                setPostedAgo(`Posted ${daysAgo} days ago`);
            }
        };
        calculateTimeAgo();
    }, [postDate]);

    useEffect(() => {
        const cards = document.querySelectorAll('.feature-card');
        const handleMouseMove = (e) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };
        cards.forEach(card => card.addEventListener('mousemove', handleMouseMove));
        
        return () => {
            cards.forEach(card => card.removeEventListener('mousemove', handleMouseMove));
        }
    }, []);

    return (
        <div className="feature-card p-6 rounded-2xl flex flex-col h-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 shadow-lg transition-all duration-300 hover:border-indigo-500/80">
            <div className="flex items-center mb-4">
                <img 
                    className="w-16 h-16 rounded-full mr-4 object-cover bg-slate-700" 
                    src={companyLogo} 
                    alt={`${companyName} Logo`} 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/374151/E5E7EB?text=Logo'; }} 
                />
                <div>
                    <h5 className="text-xl font-bold text-white">{companyName}</h5>
                    <p className="text-sm text-slate-400">Hiring Interns for:</p>
                </div>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-indigo-300 mb-3 flex-grow min-h-[64px]">
                {internshipTitle}
            </h3>
            <div className="flex items-center text-slate-400 mb-2">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                <span>{address || 'Remote'}</span>
            </div>
             <div className="flex items-center text-sm text-slate-500 mb-6">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                <span>{postedAgo}</span>
            </div>
            <a 
                href={applyLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center font-bold text-white py-3 px-5 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 hover:shadow-lg hover:shadow-indigo-500/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
                Apply Now
            </a>
        </div>
    );
};


// --- Main Page Component with Search Functionality ---
const InternshipsPage = () => {
    const [internships, setInternships] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    // --- MODIFIED: Updated API base URL ---
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/live-internships';

    // --- MODIFIED: This function now uses GET with a query parameter ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("Please enter a title or keyword to search for internships.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSearched(true);

        try {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            
            // Construct the full URL with the 'role' query parameter
            const url = `${API_BASE_URL}?role=${encodedQuery}`;

            // Make a GET request
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to fetch internships. Server responded with: ${errorData}`);
            }

            const data = await response.json();
            // Assuming the response structure is { "results": [...] }
            setInternships(data.results || []);

        } catch (err) {
            console.error("Failed to fetch internships:", err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setInternships([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto pt-16 sm:pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400">
                        Internship Board
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
                        Enter a role or keyword to find the perfect internship.
                    </p>
                </div>

                {/* --- Search Form (No changes needed) --- */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 flex items-center gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., Marketing Intern, Web Developer..."
                        className="w-full p-4 bg-slate-800/70 border-2 border-slate-700 rounded-full text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="whitespace-nowrap font-bold text-white py-4 px-8 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '...' : 'Find Internships'}
                    </button>
                </form>

                {/* --- UI Status Display (No changes needed) --- */}
                {isLoading && (
                 <div className="text-center py-10">
                    <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-300">Searching for internships...</h1>
                </div>
                )}
                {error && <p className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg max-w-xl mx-auto">{error}</p>}

                {/* --- No Results Message (No changes needed) --- */}
                {!isLoading && !error && searched && internships.length === 0 && (
                     <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">No Internships Found</h2>
                        <p>We couldn't find any internships for "{searchQuery}". Try a different keyword.</p>
                    </div>
                )}

                {/* --- Internship Listings Grid (No changes needed) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {internships.map((internship) => (
                        <InternshipCard
                            key={internship.id || internship.url}
                            companyLogo={`https://logo.clearbit.com/${internship.company.toLowerCase().replace(/\s/g, '').replace(/,/g, '')}.com`}
                            companyName={internship.company}
                            internshipTitle={internship.title}
                            address={internship.location}
                            applyLink={internship.url}
                            postDate={internship.posted_datetime}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InternshipsPage;