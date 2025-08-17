import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const auth = useAuth(); // ✅ Get auth context

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed.');
            }

            // ✅ Call login(email) on success
            auth.login(email);

            navigate('/'); // redirect to homepage

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                        Welcome Back!
                    </h1>
                    <p className="text-slate-400 mt-2">Login to access your career dashboard.</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                placeholder="********"
                            />
                        </div>

                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold py-3 rounded-full"
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-indigo-400 hover:text-indigo-300">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
