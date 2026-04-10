import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme || 'orange';
  });

  const themes = {
    orange: {
      name: 'Orange Blaze',
      primary: '#FF6B00',
      secondary: '#FF8C00',
      gradient: 'linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)',
      background: '#1a1a1a',
      surface: '#2a2a2a',
      text: '#FFE0B2',
      textPrimary: '#FFFFFF',
      border: '#FF6B00',
      accent: '#FF4500',
      buttonHover: '#FF7B00',
      chatBubbleUser: '#FF6B00',
      chatBubbleBot: '#2a2a2a',
    },
    purple: {
      name: 'Deep Purple & Lime',
      primary: '#9B59B6',
      secondary: '#BB8FCE',
      gradient: 'linear-gradient(135deg, #8E44AD, #9B59B6, #BB8FCE)',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#D5F5E3',
      textPrimary: '#FFFFFF',
      border: '#9B59B6',
      accent: '#D4AF37',
      buttonHover: '#A569BD',
      chatBubbleUser: '#9B59B6',
      chatBubbleBot: '#1a1a1a',
    },
    blue: {
      name: 'Ocean Blue',
      primary: '#3498DB',
      secondary: '#5DADE2',
      gradient: 'linear-gradient(135deg, #2980B9, #3498DB, #5DADE2)',
      background: '#0a0e1a',
      surface: '#1a1e2a',
      text: '#D6EAF8',
      textPrimary: '#FFFFFF',
      border: '#3498DB',
      accent: '#F1C40F',
      buttonHover: '#3EA8E8',
      chatBubbleUser: '#3498DB',
      chatBubbleBot: '#1a1e2a',
    },
    green: {
      name: 'Emerald Green',
      primary: '#27AE60',
      secondary: '#52BE80',
      gradient: 'linear-gradient(135deg, #1E8449, #27AE60, #52BE80)',
      background: '#0a1a0e',
      surface: '#1a2a1e',
      text: '#D5F5E3',
      textPrimary: '#FFFFFF',
      border: '#27AE60',
      accent: '#F39C12',
      buttonHover: '#2ECC71',
      chatBubbleUser: '#27AE60',
      chatBubbleBot: '#1a2a1e',
    },
    red: {
      name: 'Crimson Red',
      primary: '#E74C3C',
      secondary: '#EC7063',
      gradient: 'linear-gradient(135deg, #C0392B, #E74C3C, #EC7063)',
      background: '#1a0a0a',
      surface: '#2a1a1a',
      text: '#FADBD8',
      textPrimary: '#FFFFFF',
      border: '#E74C3C',
      accent: '#F1C40F',
      buttonHover: '#EB5E4C',
      chatBubbleUser: '#E74C3C',
      chatBubbleBot: '#2a1a1a',
    },
    cyan: {
      name: 'Cyber Cyan',
      primary: '#00BCD4',
      secondary: '#26C6DA',
      gradient: 'linear-gradient(135deg, #0097A7, #00BCD4, #26C6DA)',
      background: '#0a1a1a',
      surface: '#1a2a2a',
      text: '#E0F7FA',
      textPrimary: '#FFFFFF',
      border: '#00BCD4',
      accent: '#FF5722',
      buttonHover: '#26C6DA',
      chatBubbleUser: '#00BCD4',
      chatBubbleBot: '#1a2a2a',
    },
    pink: {
      name: 'Rose Pink',
      primary: '#E91E63',
      secondary: '#F06292',
      gradient: 'linear-gradient(135deg, #C2185B, #E91E63, #F06292)',
      background: '#1a0a15',
      surface: '#2a1a25',
      text: '#FCE4EC',
      textPrimary: '#FFFFFF',
      border: '#E91E63',
      accent: '#FFD700',
      buttonHover: '#F06A92',
      chatBubbleUser: '#E91E63',
      chatBubbleBot: '#2a1a25',
    },
    gold: {
      name: 'Royal Gold',
      primary: '#F39C12',
      secondary: '#F1C40F',
      gradient: 'linear-gradient(135deg, #D4AC0D, #F39C12, #F1C40F)',
      background: '#1a1a0a',
      surface: '#2a2a1a',
      text: '#FEF9E7',
      textPrimary: '#FFFFFF',
      border: '#F39C12',
      accent: '#E74C3C',
      buttonHover: '#F5B041',
      chatBubbleUser: '#F39C12',
      chatBubbleBot: '#2a2a1a',
    },
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('appTheme', themeName);
    applyTheme(themeName);
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    
    // Set CSS variables for the entire app
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--gradient', theme.gradient);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--surface-color', theme.surface);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--button-hover', theme.buttonHover);
    root.style.setProperty('--chat-bubble-user', theme.chatBubbleUser);
    root.style.setProperty('--chat-bubble-bot', theme.chatBubbleBot);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};