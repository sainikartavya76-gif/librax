import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar, MobileSidebar } from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Theme toggle
  function toggleTheme() {
    const html = document.documentElement;
    const dark = html.classList.toggle('dark');
    setIsDark(dark);
    localStorage.setItem('librax-theme', dark ? 'dark' : 'light');
  }

  // Apply saved theme
  useEffect(() => {
    const saved = localStorage.getItem('librax-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', useDark);
    setIsDark(useDark);
  }, []);

  // Global Command Palette shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar drawer */}
      <MobileSidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Universal Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onThemeToggle={toggleTheme}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setMobileNavOpen(true)}
          onThemeToggle={toggleTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isDark={isDark}
        />

        <main className="flex-1 overflow-hidden relative bg-bg">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="min-h-full p-4 md:p-6"
              >
                <div className="max-w-[1400px] mx-auto">
                  <Outlet />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
