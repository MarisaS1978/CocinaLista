import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SmartMenuPreferences } from '../types';
import { X, Sparkles, Clock, Users, DollarSign, Leaf, Check } from 'lucide-react';

export const SmartMenuModal: React.FC = () => {
  const { isSmartMenuModalOpen, setIsSmartMenuModalOpen, generateSmartMenu } = useApp();

  const [servings, setServings] = useState<number>(4);
  const [includeLunch, setIncludeLunch] = useState<boolean>(true);
  const [includeDinner, setIncludeDinner] = useState<boolean>(true);
  const [budget, setBudget] = useState<'economico' | 'medio' | 'libre'>('economico');
  const [maxTime, setMaxTime] = useState<number>(45);
  const [diet, setDiet] = useState<'todas' | 'vegetariana' | 'liviana'>('todas');
  const [prioritizePantry, setPrioritizePantry] = useState<boolean>(true);

  if (!isSmartMenuModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefs: SmartMenuPreferences = {
      servings,
      includeLunch,
      includeDinner: !includeLunch ? true : includeDinner,
      budget,
      maxTime,
      diet,
      prioritizePantry,
    };
    generateSmartMenu(prefs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Crear mi menú semanal
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Personalizá tus preferencias y armamos tu semana en segundos.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSmartMenuModalOpen(false)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Porciones / Personas */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#263238]/70 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-[#39B54A]" />
              Cantidad de comensales
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 6].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setServings(num)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    servings === num
                      ? 'bg-[#39B54A] text-white border-[#39B54A] shadow-xs'
                      : 'bg-[#FFFDF7] text-[#263238] border-[#263238]/15 hover:border-[#39B54A]/50'
                  }`}
                >
                  {num} {num === 1 ? 'persona' : 'personas'}
                </button>
              ))}
            </div>
          </div>

          {/* Comidas por día */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#263238]/70 flex items-center gap-1.5 mb-2">
              Comidas a planificar
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIncludeLunch(!includeLunch)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  includeLunch
                    ? 'bg-[#FFD447]/20 border-[#FFD447] text-[#263238]'
                    : 'bg-[#FFFDF7] border-[#263238]/15 text-[#263238]/60'
                }`}
              >
                <span>🍽️ Almuerzos</span>
                {includeLunch && <Check className="w-4 h-4 text-[#FF8A3D]" />}
              </button>

              <button
                type="button"
                onClick={() => setIncludeDinner(!includeDinner)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  includeDinner
                    ? 'bg-[#4D96FF]/15 border-[#4D96FF] text-[#263238]'
                    : 'bg-[#FFFDF7] border-[#263238]/15 text-[#263238]/60'
                }`}
              >
                <span>🌙 Cenas</span>
                {includeDinner && <Check className="w-4 h-4 text-[#4D96FF]" />}
              </button>
            </div>
          </div>

          {/* Tiempo disponible */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#263238]/70 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#FF8A3D]" />
              Tiempo para cocinar
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 25, label: '⚡ Rápido (<30 min)' },
                { val: 45, label: '⏱️ Moderado (<45 min)' },
                { val: 60, label: '🍲 Sin apuro (Cualquiera)' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setMaxTime(opt.val)}
                  className={`p-2.5 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    maxTime === opt.val
                      ? 'bg-[#FF8A3D] text-white border-[#FF8A3D]'
                      : 'bg-[#FFFDF7] text-[#263238] border-[#263238]/15 hover:border-[#FF8A3D]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de alimentación */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#263238]/70 flex items-center gap-1.5 mb-2">
              <Leaf className="w-3.5 h-3.5 text-[#20C9B0]" />
              Preferencia de comidas
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'todas', label: '🥩 Variada (Todo)' },
                { id: 'vegetariana', label: '🥗 Vegetariana' },
                { id: 'liviana', label: '🥒 Liviana & fresca' },
              ].map(d => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDiet(d.id as any)}
                  className={`p-2.5 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    diet === d.id
                      ? 'bg-[#20C9B0] text-white border-[#20C9B0]'
                      : 'bg-[#FFFDF7] text-[#263238] border-[#263238]/15 hover:border-[#20C9B0]/40'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presupuesto */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#263238]/70 flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-[#39B54A]" />
              Enfoque de presupuesto
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'economico', label: '💸 Súper económico' },
                { id: 'medio', label: '⚖️ Estándar' },
                { id: 'libre', label: '✨ Variado' },
              ].map(b => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBudget(b.id as any)}
                  className={`p-2.5 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    budget === b.id
                      ? 'bg-[#39B54A] text-white border-[#39B54A]'
                      : 'bg-[#FFFDF7] text-[#263238] border-[#263238]/15 hover:border-[#39B54A]/40'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aprovechar lo que hay en casa */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#39B54A]/30 flex items-start gap-3">
            <input
              type="checkbox"
              id="prioritizePantryCheck"
              checked={prioritizePantry}
              onChange={e => setPrioritizePantry(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#39B54A] rounded-md border-[#263238]/30 focus:ring-[#39B54A] cursor-pointer"
            />
            <label htmlFor="prioritizePantryCheck" className="text-xs text-[#263238] cursor-pointer">
              <span className="font-bold text-[#39B54A] block">
                🥕 Priorizar lo que ya tenés en la despensa
              </span>
              Sugerir recetas que aprovechen papas, huevos, arroz y pollo que ya tenés para evitar compras innecesarias y reducir desperdicios.
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSmartMenuModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFD447]" />
              <span>Generar mi semana</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
