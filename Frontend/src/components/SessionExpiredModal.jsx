import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { AlertCircle, LogIn } from 'lucide-react';

/**
 * Modal displayed when session expires due to inactivity
 * Freezes the UI and prevents all interaction until user logs in again
 */
const SessionExpiredModal = () => {
  const { isSessionExpired, handleLogout } = useSession();
  const navigate = useNavigate();

  if (!isSessionExpired) {
    return null;
  }

  const handleLogin = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop that blocks all interaction */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 9998,
          cursor: 'not-allowed',
          userSelect: 'none',
          pointerEvents: 'all'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={(e) => e.preventDefault()}
        onKeyDown={(e) => e.preventDefault()}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          zIndex: 9999,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '24px' }}>
          <AlertCircle
            size={64}
            style={{
              color: '#ef4444',
              margin: '0 auto'
            }}
          />
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#1f2937'
          }}
        >
          Session Expired
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}
        >
          Your session has expired due to inactivity. For security reasons, please log in again to continue.
        </p>


        <button
          onClick={handleLogin}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          <LogIn size={20} />
          Go to Login
        </button>
      </div>
    </>
  );
};

export default SessionExpiredModal;

