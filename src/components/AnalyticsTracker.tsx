import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Generate a session ID for the visitor
const generateSessionId = () => {
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('analytics_session_id', newId);
  return newId;
};

// Track page visit
const trackPageView = async (data: {
  page_url: string;
  page_title: string;
  referrer_url: string;
  session_id: string;
}) => {
  try {
    await fetch('https://trhbdcrkolubvgytjkhi.supabase.co/functions/v1/track-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        user_agent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track visit duration when page unloads
const trackVisitDuration = async (sessionId: string, startTime: number) => {
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  try {
    await fetch('https://trhbdcrkolubvgytjkhi.supabase.co/functions/v1/track-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        visit_duration: duration,
      }),
    });
  } catch (error) {
    console.error('Visit duration tracking error:', error);
  }
};

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const sessionId = generateSessionId();
    const startTime = Date.now();

    // Track page view
    trackPageView({
      page_url: window.location.href,
      page_title: document.title,
      referrer_url: document.referrer,
      session_id: sessionId,
    });

    // Track visit duration on page unload
    const handleBeforeUnload = () => {
      trackVisitDuration(sessionId, startTime);
    };

    // Use both beforeunload and pagehide for better coverage
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      // Track duration on component unmount (route change)
      trackVisitDuration(sessionId, startTime);
    };
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;