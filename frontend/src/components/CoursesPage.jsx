import React, { useState, useEffect } from 'react';

// --- Reusable CourseCard Component ---
const CourseCard = ({ title, provider, link }) => {
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
                    src={`https://logo.clearbit.com/${provider.toLowerCase().replace(/\s/g, '').replace(/[&.]/g, '')}.com`} 
                    alt={`${provider} Logo`} 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/374151/E5E7EB?text=Logo'; }} 
                />
                <div>
                    <h5 className="text-xl font-bold text-white">{provider}</h5>
                    <p className="text-sm text-slate-400">Course by:</p>
                </div>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-indigo-300 mb-3 flex-grow min-h-[96px]">
                {title}
            </h3>
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center font-bold text-white py-3 px-5 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 hover:shadow-lg hover:shadow-indigo-500/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 mt-auto"
            >
                View Course
            </a>
        </div>
    );
};


// --- Main Page Component with Search Functionality ---
const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/live-courses';

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("Please enter a subject or keyword to search for courses.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSearched(true);

        try {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            
            // --- FIX HERE: Changed query parameter from 'role' to 'topic' ---
            const url = `${API_BASE_URL}?topic=${encodedQuery}`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    const errorDetail = errorJson.detail[0]?.msg || 'Unknown error';
                    const errorLocation = errorJson.detail[0]?.loc?.join(' -> ') || '';
                    throw new Error(`API Error: ${errorDetail} (at ${errorLocation})`);
                } catch {
                     throw new Error(`Failed to fetch courses. Server responded with: ${errorText}`);
                }
            }

            const data = await response.json();
            setCourses(data.results || []);

        } catch (err) {
            console.error("Failed to fetch courses:", err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto pt-16 sm:pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400">
                        Recommended Courses
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
                        Enter a subject or keyword to discover courses to advance your career.
                    </p>
                </div>

                {/* --- Search Form --- */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 flex items-center gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., Data Science, Python, Digital Marketing..."
                        className="w-full p-4 bg-slate-800/70 border-2 border-slate-700 rounded-full text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="whitespace-nowrap font-bold text-white py-4 px-8 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '...' : 'Find Courses'}
                    </button>
                </form>

                {/* --- UI Status Display --- */}
                {isLoading && (
                 <div className="text-center py-10">
                    <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-300">Searching for courses...</h1>
                </div>
                )}
                {error && <p className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg max-w-xl mx-auto">{error}</p>}

                {/* --- No Results Message --- */}
                {!isLoading && !error && searched && courses.length === 0 && (
                     <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">No Courses Found</h2>
                        <p>We couldn't find any courses for "{searchQuery}". Try a different keyword.</p>
                    </div>
                )}

                {/* --- Course Listings Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id || course.link}
                            title={course.title}
                            provider={course.provider}
                            link={course.link}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;