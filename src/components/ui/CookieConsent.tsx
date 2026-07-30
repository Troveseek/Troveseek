'use client';

import React, { useEffect, useState } from 'react';
import styles from './CookieConsent.module.css';
import Button from './Button';
import { Cookie } from 'lucide-react';

interface CookieConsentProps {
  privacyUrl?: string | null;
}

export default function CookieConsent({ privacyUrl }: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className={styles.cookieConsentOverlay}>
      <div className={styles.cookieConsentCard}>
        <div style={{ background: 'rgba(124,111,255,0.1)', padding: '12px', borderRadius: '50%', color: 'var(--clr-primary)' }}>
          <Cookie size={28} />
        </div>
        
        <div className={styles.cookieContent}>
          <h4>We value your privacy</h4>
          <p>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            {privacyUrl && (
              <> Read more in our <a href={privacyUrl}>Privacy Policy</a>.</>
            )}
          </p>
        </div>

        <div className={styles.cookieActions}>
          <Button variant="secondary" onClick={handleDecline}>Decline</Button>
          <Button variant="primary" onClick={handleAccept}>Accept All</Button>
        </div>
      </div>
    </div>
  );
}
