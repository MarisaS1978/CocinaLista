import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  ShoppingCart,
  Carrot,
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { DayOfWeek } from '../types';

export const HomeView: React.FC = () => {
  const {
    weeklyMenu,
    recipes,
    pantry,
    pendingShoppingCount,
    setActiveTab,
    setIsSmartMenuModalOpen,
    setIsCookWithPantryModalOpen,
    setSelectedRecipeDetail,
    pantryMatches,
    expiringItems,
    resetToDemoData,
  } = useApp();

  const recipeMap = new Map(recipes.map(r => [r.id, r]));

  const daysList: { id: DayOfWeek; name: string }[] = [
    { id: 'lunes', name: 'Lunes' },
    { id: 'martes', name: 'Martes' },
    { id: 'miercoles', name: 'Miércoles' },
    { id: 'jueves', name: 'Jueves' },
    { id: 'viernes', name: 'Viernes' },
    { id: 'sabado', name: 'Sábado' },
    { id: 'domingo', name: 'Domingo' },
  ];

  // Best recipe ideas from pantry matches
  const topIdea = pantryMatches.find(m => m.matchPercent >= 80) || pantryMatches[0];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Saludo y Hero */}
      <section className="bg-gradient-to-br from-[#FFFDF7] via-white to-[#39B54A]/5 rounded-3xl p-6 sm:p-8 border border-[#39B54A]/20 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#39B54A]/10 text-[#2b8838] text-xs font-bold mb-2">
              <span>🌱 Planificá tus comidas · Nosotros armamos tu lista</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
              ¡Hola! 👋
            </h1>
            <p className="text-base sm:text-lg text-[#263238]/80 font-medium mt-1">
              ¿Qué vamos a cocinar esta semana?
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsSmartMenuModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#39B54A]/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFD447]" />
              <span>Generar menú</span>
            </button>
            <button
              onClick={resetToDemoData}
              title="Restablecer datos de demostración"
              className="p-2.5 rounded-2xl border border-[#263238]/15 bg-white hover:bg-slate-50 text-[#263238]/60 hover:text-[#263238] transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Grid principal: Menú resumen + Destacado de compras */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Resumen del Menú Semanal (7 columnas en desktop) */}
        <section className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#263238]/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4D96FF]/15 text-[#4D96FF] flex items-center justify-center font-bold">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-[#263238]">
                Resumen de tu menú
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs font-bold text-[#4D96FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver semana completa
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Listado resumido de Lunes a Domingo */}
          <div className="space-y-2.5">
            {daysList.slice(0, 5).map(d => {
              const slotAlm = weeklyMenu[d.id]?.almuerzo;
              const slotCen = weeklyMenu[d.id]?.cena;
              const recAlm = slotAlm?.recipeId ? recipeMap.get(slotAlm.recipeId) : null;
              const recCen = slotCen?.recipeId ? recipeMap.get(slotCen.recipeId) : null;

              return (
                <div
                  key={d.id}
                  onClick={() => setActiveTab('menu')}
                  className="p-3 rounded-2xl border border-[#263238]/8 bg-[#FFFDF7] hover:border-[#39B54A]/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="w-20 font-bold text-xs text-[#263238]/80 group-hover:text-[#39B54A]">
                    {d.name}
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-sm">
                        {recAlm?.emoji || slotAlm?.customEmoji || '🍽️'}
                      </span>
                      <span className="truncate font-semibold text-[#263238]">
                        {recAlm?.name || slotAlm?.customName || 'Sin asignar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-1 min-w-0 text-[#263238]/70">
                      <span className="text-sm">
                        {recCen?.emoji || slotCen?.customEmoji || '🌙'}
                      </span>
                      <span className="truncate">
                        {recCen?.name || slotCen?.customName || 'Sin asignar'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-[#263238]/30 group-hover:text-[#39B54A] transition-colors ml-2">
                    →
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#263238]/6 flex items-center justify-between text-xs text-[#263238]/60">
            <span>Sábado y domingo también listos</span>
            <button
              onClick={() => setActiveTab('menu')}
              className="font-bold text-[#39B54A] hover:underline cursor-pointer"
            >
              Organizar los 7 días
            </button>
          </div>
        </section>

        {/* Columna Derecha: Tarjeta destacada de Compras & Despensa preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta destacada de Compras */}
          <section className="bg-gradient-to-br from-[#FF8A3D]/10 via-white to-[#FFD447]/15 rounded-3xl p-6 border border-[#FF8A3D]/30 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FF8A3D] text-white flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263238]">
                    Tu lista de compras
                  </h3>
                  <p className="text-xs font-semibold text-[#FF8A3D]">
                    {pendingShoppingCount > 0
                      ? `${pendingShoppingCount} productos pendientes`
                      : '¡Todo comprado!'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#263238]/80 mt-3 leading-relaxed">
              Generada automáticamente restando lo que ya tenés en la despensa de las recetas que elegiste.
            </p>

            <div className="mt-4 pt-3 border-t border-[#FF8A3D]/20 flex items-center justify-between">
              <span className="text-xs text-[#263238]/60 font-medium">
                Sin duplicar ingredientes
              </span>
              <button
                onClick={() => setActiveTab('compras')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF8A3D] hover:bg-[#e0752d] active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ver lista</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* Lo que tenés en casa (Despensa snippet) */}
          <section className="bg-white rounded-3xl p-6 border border-[#263238]/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center font-bold">
                  <Carrot className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#263238]">
                  Lo que tenés en casa
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('despensa')}
                className="text-xs font-bold text-[#39B54A] hover:underline cursor-pointer"
              >
                Ver despensa
              </button>
            </div>

            {/* Quick list of ingredients */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {pantry.slice(0, 6).map(p => (
                <div
                  key={p.id}
                  className="p-2 rounded-xl bg-[#FFFDF7] border border-[#263238]/8 flex items-center justify-between"
                >
                  <span className="font-semibold text-[#263238] truncate">{p.name}</span>
                  <span className="text-[#263238]/70 font-medium ml-1 shrink-0">
                    {p.amount} {p.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Expiration warning banner if any */}
            {expiringItems.length > 0 && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/25 flex items-center gap-2 text-xs text-[#b82f2f]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-semibold truncate">
                  {expiringItems[0].name} próximo a vencer. ¡Aprovechalo!
                </span>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Sección: Ideas para aprovechar lo que tenés */}
      {topIdea && (
        <section className="bg-gradient-to-r from-[#FFD447]/20 via-[#FFFDF7] to-[#39B54A]/10 rounded-3xl p-6 border border-[#FFD447]/60 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs border border-black/5 shrink-0">
                💡
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF8A3D]">
                  Ideas para aprovechar lo que tenés
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#263238] mt-0.5">
                  Con {topIdea.availableIngredients.slice(0, 3).join(' + ')} podés preparar{' '}
                  <span className="text-[#2b8838] underline decoration-[#39B54A]/40">
                    {topIdea.recipe.name}
                  </span>
                </h3>
                <p className="text-xs text-[#263238]/70 mt-1">
                  Tenés el {topIdea.matchPercent}% de los ingredientes listos en tu despensa. ¡Evitá desperdiciar comida!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedRecipeDetail(topIdea.recipe)}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-[#263238] bg-white border border-[#263238]/15 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                Ver receta
              </button>
              <button
                onClick={() => setIsCookWithPantryModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-[#FF8A3D] hover:bg-[#e67528] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Carrot className="w-3.5 h-3.5" />
                <span>Explorar más ideas</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
