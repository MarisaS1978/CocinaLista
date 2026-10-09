import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, Check, X } from 'lucide-react';

export const SharedMenuImportModal: React.FC = () => {
  const {
    sharedMenuIncoming,
    applySharedMenu,
    dismissSharedMenu,
    recipes,
  } = useApp();

  if (!sharedMenuIncoming) return null;

  const dayNames: { id: keyof typeof sharedMenuIncoming; label: string }[] = [
    { id: 'lunes', label: 'Lunes' },
    { id: 'martes', label: 'Martes' },
    { id: 'miercoles', label: 'Miércoles' },
    { id: 'jueves', label: 'Jueves' },
    { id: 'viernes', label: 'Viernes' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' },
  ];

  const recipeMap = new Map<string, (typeof recipes)[0]>();
  recipes.forEach(r => recipeMap.set(r.id, r));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center text-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#39B54A] uppercase tracking-wider">
                Menú compartido recibido
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[#263238] mt-0.5">
                ¡Te compartieron un menú semanal!
              </h2>
            </div>
          </div>
          <button
            onClick={dismissSharedMenu}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#263238]/80 leading-relaxed bg-[#FFFDF7] p-3 rounded-2xl border border-[#263238]/10">
            Podés revisar las comidas planificadas para cada día. Si decidís aplicarlo, se cargará automáticamente en tu planificador y se calculará tu lista de compras inteligente.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {dayNames.map(d => {
              const dayData = sharedMenuIncoming[d.id];
              const lunchRec = dayData?.almuerzo?.recipeId ? recipeMap.get(dayData.almuerzo.recipeId) : null;
              const lunchName = lunchRec?.name || dayData?.almuerzo?.customName;
              const lunchEmoji = lunchRec?.emoji || dayData?.almuerzo?.customEmoji || '🍽️';

              const dinnerRec = dayData?.cena?.recipeId ? recipeMap.get(dayData.cena.recipeId) : null;
              const dinnerName = dinnerRec?.name || dayData?.cena?.customName;
              const dinnerEmoji = dinnerRec?.emoji || dayData?.cena?.customEmoji || '🍽️';

              return (
                <div
                  key={d.id}
                  className="p-3 rounded-2xl bg-white border border-[#263238]/10 shadow-2xs space-y-1.5"
                >
                  <span className="text-xs font-bold text-[#263238] block">
                    {d.label}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    <div className="p-1.5 rounded-xl bg-[#FFFDF7] border border-[#263238]/8">
                      <span className="text-[10px] text-[#263238]/50 block">Almuerzo</span>
                      <span className="font-medium text-[#263238] truncate block">
                        {lunchName ? `${lunchEmoji} ${lunchName}` : <span className="text-slate-400">Sin planificar</span>}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-[#FFFDF7] border border-[#263238]/8">
                      <span className="text-[10px] text-[#263238]/50 block">Cena</span>
                      <span className="font-medium text-[#263238] truncate block">
                        {dinnerName ? `${dinnerEmoji} ${dinnerName}` : <span className="text-slate-400">Sin planificar</span>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-[#263238]/8 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={dismissSharedMenu}
            className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={applySharedMenu}
            className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar a mi menú semanal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
