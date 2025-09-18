import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/signin?error=auth_failed');
          return;
        }

        if (data.session) {
          // Successfully authenticated
          navigate('/');
        } else {
          // No session found
          navigate('/signin');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/signin?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div>🔄 Completing authentication...</div>
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        Please wait while we redirect you.
      </div>
    </div>
  );
};
