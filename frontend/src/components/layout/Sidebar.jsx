import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Receipt, TrendingUp, BarChart3,
  CreditCard, PiggyBank, Settings, X, Zap, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/cards', icon: CreditCard, label: 'Cards & Accounts' },
  { to: '/budget', icon: PiggyBank, label: 'Budget' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">FinFlow</h1>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase tracking-widest">Smart Finance</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item group ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-brand-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <Icon size={16} className={isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-white'} />
                </div>
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover" />
              : user?.name?.charAt(0).toUpperCase()
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 xl:w-64 flex-shrink-0 bg-[#0a0b12] border-r border-white/5 flex-col">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-[#0a0b12] border-r border-white/5 z-50 lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
