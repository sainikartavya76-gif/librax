import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red' | 'gray';
}

const colors = {
  blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-500/10',
  green: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/10',
  amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/10',
  red: 'from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-500/10',
  gray: 'from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-500/10',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeLabel, icon: Icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#eaeaea] rounded-xl p-5 flex items-center gap-4 shadow-sm overflow-hidden relative group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className={`p-3 rounded-[10px] bg-gradient-to-br ${colors[color]} border flex-shrink-0 relative z-10`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-[13px] font-medium text-[#666666] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-semibold text-[#171717] tracking-tight">{value}</h3>
          {change !== undefined && (
            <span className={`flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {changeLabel && (
          <p className="text-[11px] text-[#888888] mt-1 truncate">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
