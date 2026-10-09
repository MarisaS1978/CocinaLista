import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  Home,
  CalendarDays,
  ShoppingCart,
  Carrot,
  UtensilsCrossed,
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, pendingShoppingCount } = useApp();

  const items: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'menu', label: 'Mi menú', icon: <CalendarDays className="w-5 h-5" /> },
    {
      id: 'compras',
      label: 'Compras',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: pendingShoppingCount,
    },
    { id: 'despensa', label: 'Mi despensa', icon: <Carrot className="w-5 h-5" /> },
    { id: 'recetas', label: 'Recetas', icon: <UtensilsCrossed className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-lg border-t border-[#263238]/10 px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-5 h-14 items-center max-w-md mx-auto">
        {items.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none ${
                isActive ? 'text-[#39B54A]' : 'text-[#263238]/60 hover:text-[#263238]'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] flex items-center justify-center bg-[#FF5C5C] text-white text-[10px] font-extrabold rounded-full px-1 shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-1 tracking-tight leading-none ${
                  isActive ? 'text-[#39B54A] font-bold' : 'text-[#263238]/70'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
