import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      auth.login(email); // ✅ Set the user
      navigate('/');     // ✅ Redirect to home
    } else {
      navigate('/login'); // fallback
    }
  }, [auth, navigate, searchParams]);

  return <p className="text-white text-center mt-10">Logging in via Google...</p>;
};

export default OAuthSuccess;
