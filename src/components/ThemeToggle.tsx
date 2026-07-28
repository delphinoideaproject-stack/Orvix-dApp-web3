import React from 'react';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('orvix_theme') as Theme) || (localStorage.getItem('theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      root.setAttribute('data-theme', systemTheme);
      return;
    }

    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('orvix_theme', newTheme);
  };

  return { theme, setTheme };
}

export function CapsuleThemeToggle({ 
  currentTheme, 
  onChangeTheme, 
  className 
}: { 
  currentTheme?: Theme; 
  onChangeTheme?: (t: Theme) => void; 
  className?: string; 
}) {
  const hook = useTheme();
  const theme = currentTheme !== undefined ? currentTheme : hook.theme;
  const setTheme = onChangeTheme || hook.setTheme;

  const isLight =
    theme === 'light' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme(isLight ? 'dark' : 'light');
  };

  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setTheme(isLight ? 'dark' : 'light');
        }
      }}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center p-1 rounded-full cursor-pointer select-none transition-colors ${className || ''}`}
    >
      <div
        className={`relative flex items-center justify-start w-[64px] sm:w-[72px] h-[34px] sm:h-[38px] rounded-full px-1.5 transition-colors duration-400 ${
          isLight ? 'bg-slate-300' : 'bg-[#1e293b]'
        }`}
      >
        <div
          className={`w-[26px] sm:w-[30px] h-[26px] sm:h-[30px] rounded-full bg-transparent flex items-center justify-center transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative z-10 ${
            isLight ? 'translate-x-[26px] sm:translate-x-[32px]' : 'translate-x-0'
          }`}
        >
          {/* Sun Icon */}
          <Sun
            className={`w-4 sm:w-5 h-4 sm:h-5 absolute transition-all duration-300 ${
              isLight
                ? 'text-[#0f172a] opacity-0 rotate-90'
                : 'text-[#e2e8f0] opacity-100 rotate-0'
            }`}
          />
          {/* Moon Icon */}
          <Moon
            className={`w-4 sm:w-5 h-4 sm:h-5 absolute transition-all duration-300 ${
              isLight
                ? 'text-[#0f172a] opacity-100 rotate-0'
                : 'text-[#e2e8f0] opacity-0 -rotate-90'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
