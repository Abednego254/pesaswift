'use client';

import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const darkClassPresent = document.documentElement.classList.contains('dark');
    setIsDark(darkClassPresent);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) return null;

  return (
    <button 
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '10px 18px',
        borderRadius: '30px',
        border: '1px solid var(--border-color)',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease'
      }}
      className="hover-lift"
    >
      <span>{isDark ? '🌙 Midnight Cyberpunk' : '☀️ Eco Emerald'}</span>
    </button>
  );
}
