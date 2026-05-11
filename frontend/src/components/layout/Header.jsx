import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/income': 'Income',
  '/analytics': 'Analytics',
  '/cards': 'Credit Cards',
  '/budget': 'Budget Planner',
  '/settings': 'Settings',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [dark, setDark] = useState(true);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 lg:px-8 h-16 bg-[#08090f]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 className="font-display font-semibold text-white text-lg leading-tight">
            {PAGE_TITLES[pathname] || 'FinFlow'}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          title="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </button>

        <Link to="/settings" className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : user?.name?.charAt(0).toUpperCase()
            }
          </div>
        </Link>
      </div>
    </header>
  );
}
