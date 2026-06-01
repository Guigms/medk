'use client';

import { useTheme } from '@/components/ThemeProvider'; // 🌟 Consome o motor
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita erros de sincronização visual no Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-yellow-400 border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer z-50"
      title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}