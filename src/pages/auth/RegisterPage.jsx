import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page since we combined login/register
    navigate('/login');
  }, [navigate]);

  return null;
};

export default RegisterPage;