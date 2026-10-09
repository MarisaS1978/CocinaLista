import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#39B54A] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#4D96FF] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#FF8A3D] shrink-0" />,
  };

  const borderColors = {
    success: 'border-[#39B54A]/30',
    info: 'border-[#4D96FF]/30',
    warning: 'border-[#FF8A3D]/30',
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-xl shadow-black/10 border ${borderColors[toast.type]} pointer-events-auto transform transition-all duration-200 animate-in fade-in slide-in-from-top-4`}
      >
        {icons[toast.type]}
        <p className="text-sm font-semibold text-[#263238] leading-tight">
          {toast.message}
        </p>
      </div>
    </div>
  );
};
