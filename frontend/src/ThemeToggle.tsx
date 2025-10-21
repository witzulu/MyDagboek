import { useTheme } from '../context/ThemeProvider';
import { Moon, Sun, Laptop2 } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme =
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  const Icon =
    theme === 'light' ? Moon : theme === 'dark' ? Laptop2 : Sun;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={`Switch theme (current: ${theme})`}
    >
      <Icon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
    </button>
  );
}
