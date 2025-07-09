import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import config from '../config/config';

const GoogleAuthHandler = () => {
  const { updateUser } = useAuth();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      fetch(`${config.API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && updateUser) {
            localStorage.setItem('user', JSON.stringify(data));
            updateUser(data);
          }
        });
      urlParams.delete('token');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [updateUser]);
  return null;
};

export default GoogleAuthHandler; 
