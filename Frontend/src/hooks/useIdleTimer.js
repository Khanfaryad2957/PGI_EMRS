import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for tracking user inactivity
 * Detects all user activity: keyboard, mouse, clicks, scrolling, form inputs, etc.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Inactivity timeout in milliseconds (default: 15 minutes)
 * @param {Function} options.onIdle - Callback when user becomes idle
 * @param {Function} options.onActive - Callback when user becomes active
 * @param {boolean} options.enabled - Whether the timer is enabled (default: true)
 * @returns {Object} - { isIdle, resetTimer }
 */
export function useIdleTimer({
  timeout = 15 * 60 * 1000, // 15 minutes default
  onIdle,
  onActive,
  enabled = true
} = {}) {
  const timeoutIdRef = useRef(null);
  const isIdleRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  // Reset the idle timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    const wasIdle = isIdleRef.current;
    lastActivityRef.current = Date.now();
    isIdleRef.current = false;

    // Clear existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Call onActive if user was previously idle
    if (wasIdle && onActive) {
      onActive();
    }

    // Set new timeout
    timeoutIdRef.current = setTimeout(() => {
      isIdleRef.current = true;
      if (onIdle) {
        onIdle();
      }
    }, timeout);
  }, [timeout, onIdle, onActive, enabled]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      // Clear timeout if disabled
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      return;
    }

    // List of events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'blur',
      'input',
      'change',
      'select',
      'submit'
    ];

    // Add event listeners with passive option for better performance
    const options = { passive: true, capture: true };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, options);
    });

    // Track API calls via fetch and XMLHttpRequest
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      handleActivity();
      return originalFetch.apply(this, args);
    };

    // Track XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      this.addEventListener('loadstart', handleActivity, { once: true });
      return originalXHROpen.apply(this, args);
    };

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, options);
      });

      // Restore original functions
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [handleActivity, resetTimer, enabled]);

  return {
    isIdle: isIdleRef.current,
    resetTimer,
    lastActivity: lastActivityRef.current
  };
}

