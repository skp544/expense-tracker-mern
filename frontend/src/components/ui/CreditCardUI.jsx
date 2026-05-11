import { motion } from 'framer-motion';
import { maskCardNumber } from '../../utils/helpers';
import { Wifi, Zap } from 'lucide-react';

const CardChip = () => (
  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 relative overflow-hidden">
    <div className="absolute inset-0 grid grid-cols-3 gap-px p-1">
      {Array(9).fill(0).map((_, i) => (
        <div key={i} className="bg-yellow-600/30 rounded-sm" />
      ))}
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-5 h-3 border border-yellow-600/50 rounded-sm" />
    </div>
  </div>
);

const VisaLogo = () => (
  <span className="font-display font-black text-xl text-white italic tracking-wider" style={{ fontStyle: 'italic', letterSpacing: '0.05em' }}>VISA</span>
);

const MastercardLogo = () => (
  <div className="flex items-center -space-x-2">
    <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
    <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-90" />
  </div>
);

const AmexLogo = () => (
  <span className="font-display font-black text-sm text-white tracking-widest">AMEX</span>
);

const CardBrandLogo = ({ type }) => {
  if (type === 'Visa') return <VisaLogo />;
  if (type === 'Mastercard') return <MastercardLogo />;
  if (type === 'Amex') return <AmexLogo />;
  return <span className="text-white/70 text-sm font-bold">{type}</span>;
};

export default function CreditCardUI({ card, index = 0, onClick, compact = false }) {
  const util = card.creditLimit > 0 ? Math.round((card.currentUsage / card.creditLimit) * 100) : 0;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onClick?.(card)}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.cardColor} p-4 cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
        style={{ aspectRatio: '1.6' }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <CardChip />
            <CardBrandLogo type={card.cardType} />
          </div>
          <div>
            <p className="text-white/60 text-xs font-mono mb-1">{maskCardNumber(card.cardNumber)}</p>
            <p className="text-white font-semibold text-sm">{card.cardHolderName}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick?.(card)}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.cardColor} p-6 cursor-pointer group hover:scale-[1.02] transition-transform duration-300 shadow-card`}
      style={{ minHeight: 200 }}
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% -20%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at -20% 100%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/10 translate-y-10 -translate-x-10" />

      <div className="relative z-10 flex flex-col h-full gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-mono">{card.bankName}</p>
            <p className="text-white font-semibold text-sm mt-0.5">Credit Card</p>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={18} className="text-white/60" />
            <CardBrandLogo type={card.cardType} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CardChip />
        </div>

        <div className="space-y-1">
          <p className="text-white/80 font-mono text-lg tracking-[0.2em]">
            {maskCardNumber(card.cardNumber)}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Card Holder</p>
              <p className="text-white font-medium text-sm">{card.cardHolderName}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Expires</p>
              <p className="text-white font-medium text-sm">{card.expiryDate}</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Credit Used</span>
            <span className="text-white font-medium">{util}%</span>
          </div>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(util, 100)}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${util > 80 ? 'bg-red-400' : util > 50 ? 'bg-yellow-400' : 'bg-white/80'}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
