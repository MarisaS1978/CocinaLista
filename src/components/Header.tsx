import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { Sparkles, Carrot } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSmartMenuModalOpen,
    setIsCookWithPantryModalOpen,
    pendingShoppingCount,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; badge?: number }[] = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'menu', label: 'Mi menú' },
    { id: 'compras', label: 'Compras', badge: pendingShoppingCount },
    { id: 'despensa', label: 'Mi despensa' },
    { id: 'recetas', label: 'Recetas' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#263238]/8 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39B54A] rounded-xl cursor-pointer group shrink-0"
        >
          <img
            src="/pwa-192x192.png"
            alt="Cocina Lista"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-xs group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#263238] whitespace-nowrap block leading-none">
              Cocina Lista
            </span>
            <span className="text-[10px] font-semibold text-[#263238]/60 hidden sm:block tracking-tight mt-0.5">
              Planificá · Comprá · Cociná
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#263238] bg-white shadow-xs border border-[#263238]/10'
                    : 'text-[#263238]/70 hover:text-[#263238] hover:bg-black/4'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                      isActive
                        ? 'bg-[#39B54A] text-white'
                        : 'bg-[#FF8A3D] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action CTAs & PWA Install */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton compact={true} />

          <button
            onClick={() => setIsCookWithPantryModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#263238] bg-[#FFD447]/40 hover:bg-[#FFD447]/70 border border-[#FFD447] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            title="Ver qué recetas podés preparar con lo que tenés en la despensa"
          >
            <Carrot className="w-3.5 h-3.5 text-[#FF8A3D]" />
            <span>Usar lo que tengo</span>
          </button>

          <button
            onClick={() => setIsSmartMenuModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#39B54A] hover:bg-[#329e41] active:scale-[0.98] rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD447]" />
            <span>Crear menú</span>
          </button>
        </div>
      </div>
    </header>
  );
};
