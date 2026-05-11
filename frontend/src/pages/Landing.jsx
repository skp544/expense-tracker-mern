import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, CreditCard, PieChart, Shield, ArrowRight, BarChart3, Sparkles } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Smart Tracking', desc: 'Track every expense and income with beautiful analytics and insights.' },
  { icon: CreditCard, title: 'Card Management', desc: 'Manage all your credit cards with real-time utilization tracking.' },
  { icon: PieChart, title: 'Budget Planner', desc: 'Set category-wise budgets with smart alerts and progress tracking.' },
  { icon: BarChart3, title: 'Rich Analytics', desc: 'Interactive charts for monthly trends, category breakdowns, and more.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication with bcrypt encryption keeps your data safe.' },
  { icon: Sparkles, title: 'Financial Insights', desc: 'AI-powered spending insights to optimize your financial decisions.' },
];

const stats = [
  { value: '12K+', label: 'Active Users' },
  { value: '₹2.4M', label: 'Tracked Monthly' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'User Rating' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#08090f] text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">FinFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium px-4 py-2">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      <section className="relative z-10 text-center px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-8">
            <Sparkles size={12} />
            Smart Personal Finance Platform
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
            Take control of
            <span className="block text-gradient">your finances</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Track expenses, manage budgets, analyze spending patterns, and make smarter financial decisions with FinFlow's premium dashboard experience.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
              Start Free
              <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              Demo: demo@example.com
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-20 mx-auto max-w-4xl"
        >
          <div className="glass rounded-3xl p-2 border border-white/10 shadow-2xl">
            <div className="bg-[#0a0b12] rounded-2xl p-6 border border-white/5">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Balance', value: '₹24,850', color: 'brand' },
                  { label: 'This Month', value: '-₹3,420', color: 'rose' },
                  { label: 'Income', value: '+₹8,500', color: 'emerald' },
                  { label: 'Savings', value: '₹5,080', color: 'amber' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="glass rounded-xl p-4"
                  >
                    <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                    <p className={`font-display font-bold text-xl ${s.color === 'emerald' ? 'text-emerald-400' : s.color === 'rose' ? 'text-red-400' : s.color === 'amber' ? 'text-amber-400' : 'text-white'}`}>{s.value}</p>
                  </motion.div>
                ))}
              </div>
              <div className="h-32 glass rounded-xl flex items-end justify-around px-4 pb-4 gap-2">
                {[60, 45, 80, 55, 90, 70, 50, 85, 65, 75, 95, 60].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 opacity-80"
                    style={{ maxWidth: 20 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="font-display font-bold text-3xl text-white mb-1">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Everything you need</h2>
            <p className="text-slate-500 max-w-md mx-auto">A complete financial management platform built for modern users.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <f.icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto glass rounded-3xl p-12 border border-white/10"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
            <Zap size={24} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-4">Start your journey</h2>
          <p className="text-slate-400 mb-8">Join thousands of users managing their finances smarter with FinFlow.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Create Free Account
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 py-8 px-6 border-t border-white/5 text-center">
        <p className="text-slate-600 text-sm">© 2026 FinFlow — Built with React, Node.js & MongoDB</p>
      </footer>
    </div>
  );
}
