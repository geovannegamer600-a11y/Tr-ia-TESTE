import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TrendIndicatorProps {
  trend: number;
}

/**
 * Componente TrendIndicator
 * Exibe um indicador visual (ícone + valor) baseado em uma tendência numérica.
 * Verde para positivo, Vermelho para negativo.
 */
const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  if (trend === 0) return null;

  const isPositive = trend > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  
  // Define classes baseadas no estado da tendência
  const colorClasses = isPositive 
    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/10' 
    : 'text-red-400 bg-red-400/10 border-red-500/10';

  return (
    <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${colorClasses} px-3 py-1.5 rounded-full border shadow-sm`}>
      <Icon className="w-3 h-3 mr-1" />
      <span>
        {isPositive ? '+' : ''}{trend}%
      </span>
    </div>
  );
};

export default TrendIndicator;