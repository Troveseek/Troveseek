"use client";

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read current theme on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const currentTheme = savedTheme === 'light' || (!savedTheme && prefersLight) ? 'light' : 'dark';
    
    setTheme(currentTheme);
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) {
    return (
      <button className={styles.toggleBtn} aria-label="Toggle theme" style={{ opacity: 0 }}>
        <Moon size={20} />
      </button>
    );
  }

  return (
    <button 
      className={styles.toggleBtn} 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
