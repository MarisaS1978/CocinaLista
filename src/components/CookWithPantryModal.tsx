import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, DayOfWeek, MealType } from '../types';
import { X, Carrot, CheckCircle2, AlertCircle, CalendarPlus, ChevronRight } from 'lucide-react';

export const CookWithPantryModal: React.FC = () => {
  const {
    isCookWithPantryModalOpen,
    setIsCookWithPantryModalOpen,
    pantryMatches,
    pantry,
    setSelectedRecipeDetail,
    setWeeklyMeal,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('almuerzo');
  const [addingRecipeId, setAddingRecipeId] = useState<string | null>(null);

  if (!isCookWithPantryModalOpen) return null;

  const topIngredients = pantry.slice(0, 6).map(p => `${p.name} (${p.amount} ${p.unit})`);

  const handleAddToMenu = (recipe: Recipe) => {
    setWeeklyMeal(selectedDay, selectedMealType, { recipeId: recipe.id });
    setAddingRecipeId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8A3D]/15 text-[#FF8A3D] flex items-center justify-center">
              <Carrot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Cocinar con lo que tengo
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Aprovechá al máximo los alimentos de tu despensa y evitá desperdicios.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCookWithPantryModalOpen(false)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current pantry summary pill strip */}
        <div className="px-6 py-3 bg-[#FFFDF7] border-b border-[#263238]/6">
          <p className="text-[11px] font-bold text-[#263238]/70 uppercase tracking-wider mb-1.5">
            Ingredientes disponibles en tu cocina:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#263238]/80 font-medium">
            {topIngredients.map((ing, idx) => (
              <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-[#263238]/10 text-xs">
                {ing}
              </span>
            ))}
            <span className="text-xs text-[#263238]/50">+ {Math.max(0, pantry.length - 6)} más</span>
          </div>
        </div>

        {/* Recipes match list */}
        <div className="p-6 space-y-4">
          {pantryMatches.map(({ recipe, matchPercent, availableCount, totalCount, missingIngredients }) => {
            const is100 = matchPercent >= 100;
            const isHigh = matchPercent >= 70;
            const isAdding = addingRecipeId === recipe.id;

            return (
              <div
                key={recipe.id}
                className={`p-4 rounded-2xl border transition-all ${
                  is100
                    ? 'border-[#39B54A]/40 bg-[#39B54A]/5 hover:bg-[#39B54A]/8'
                    : isHigh
                    ? 'border-[#FFD447]/50 bg-[#FFD447]/10 hover:bg-[#FFD447]/15'
                    : 'border-[#263238]/10 bg-white hover:bg-[#FFFDF7]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-1 bg-white rounded-xl shadow-xs border border-black/5 shrink-0">
                      {recipe.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#263238] leading-snug">
                          {recipe.name}
                        </h3>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            is100
                              ? 'bg-[#39B54A] text-white'
                              : isHigh
                              ? 'bg-[#FF8A3D] text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {matchPercent}% listo
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#263238]/60 mt-1">
                        <span>⏱️ {recipe.timeMin} min</span>
                        <span>·</span>
                        <span>👥 {recipe.servings} porciones</span>
                        <span>·</span>
                        <span>Dif. {recipe.difficulty}</span>
                      </div>

                      {/* Ingredients status */}
                      <div className="mt-2 text-xs">
                        {is100 ? (
                          <div className="flex items-center gap-1.5 text-[#39B54A] font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>¡Tenés todos los {totalCount} ingredientes listos para cocinar!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[#FF8A3D] font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>
                              Tenés {availableCount} de {totalCount}. Solo falta:{' '}
                              <strong className="text-[#263238] font-bold">
                                {missingIngredients.slice(0, 2).join(', ')}
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedRecipeDetail(recipe);
                        setIsCookWithPantryModalOpen(false);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-[#263238] bg-white border border-[#263238]/15 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Ver receta
                    </button>
                    <button
                      onClick={() => setAddingRecipeId(isAdding ? null : recipe.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Al menú</span>
                    </button>
                  </div>
                </div>

                {/* Day selector inline accordion */}
                {isAdding && (
                  <div className="mt-3 pt-3 border-t border-[#263238]/10 animate-in fade-in">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-[#263238]/80">Asignar a:</span>
                      <select
                        value={selectedDay}
                        onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
                        className="bg-white border border-[#263238]/20 rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sabado">Sábado</option>
                        <option value="domingo">Domingo</option>
                      </select>

                      <div className="flex rounded-lg border border-[#263238]/20 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('almuerzo')}
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            selectedMealType === 'almuerzo' ? 'bg-[#FFD447] text-[#263238]' : 'text-[#263238]/70'
                          }`}
                        >
                          Almuerzo
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('cena')}
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            selectedMealType === 'cena' ? 'bg-[#4D96FF] text-white' : 'text-[#263238]/70'
                          }`}
                        >
                          Cena
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToMenu(recipe)}
                        className="ml-auto px-3 py-1 text-xs font-bold text-white bg-[#39B54A] rounded-lg shadow-xs hover:bg-[#329e41] cursor-pointer flex items-center gap-1"
                      >
                        Confirmar
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
