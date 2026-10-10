import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DayOfWeek, MealType } from '../types';
import {
  X,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  ShoppingCart,
  ChevronDown,
  Edit3,
  MoreVertical,
  Trash2,
  Tag,
} from 'lucide-react';
import { normalizeIngredientName } from '../services/shoppingCalculator';
import { RecipeVisual } from './RecipeVisual';
import { getCategoryIcon } from '../services/recipeCategories';

export const RecipeDetailModal: React.FC = () => {
  const {
    selectedRecipeDetail,
    setSelectedRecipeDetail,
    pantry,
    setWeeklyMeal,
    addCustomShoppingItem,
    addRecipeIngredientsToShopping,
    setEditingRecipe,
    setDeletingRecipe,
    setRecipeToChangeCategory,
    showToast,
  } = useApp();

  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('almuerzo');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!selectedRecipeDetail) return null;

  const recipe = selectedRecipeDetail;

  // Check which ingredients exist in pantry
  const pantryKeySet = new Set(pantry.map(p => normalizeIngredientName(p.name)));

  const handleAddToMenu = () => {
    setWeeklyMeal(selectedDay, selectedMealType, { recipeId: recipe.id });
    setShowDaySelector(false);
    setSelectedRecipeDetail(null);
  };

  const handleAddAllToShopping = () => {
    const missing = recipe.ingredients.filter(
      ing => !pantryKeySet.has(normalizeIngredientName(ing.name))
    );

    if (missing.length > 0) {
      addRecipeIngredientsToShopping(
        recipe.name,
        missing.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        }))
      );
    } else {
      showToast('¡Ya tenés todos los ingredientes en tu despensa!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Hero visual banner with pastel illustration */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <RecipeVisual
            name={recipe.name}
            emoji={recipe.emoji}
            category={recipe.category}
            size="hero"
            showCategoryBadge={false}
          />

          {/* Top action controls: Editar, ⋮ Más, and Close */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const rec = recipe;
                setSelectedRecipeDetail(null);
                setEditingRecipe(rec);
              }}
              className="px-3 py-1.5 rounded-full bg-white/95 text-[#263238] hover:bg-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#263238]/10 hover:border-[#39B54A]"
              title="Editar receta"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#39B54A]" />
              <span>Editar</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-8 h-8 rounded-full bg-white/95 text-[#263238] hover:bg-white backdrop-blur-md flex items-center justify-center shadow-sm transition-all cursor-pointer border border-[#263238]/10"
                title="Más opciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-xl border border-[#263238]/10 py-1.5 w-48 text-xs animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        const rec = recipe;
                        setSelectedRecipeDetail(null);
                        setRecipeToChangeCategory(rec);
                      }}
                      className="w-full px-3.5 py-2 text-left font-semibold text-[#263238] hover:bg-slate-50 hover:text-[#4D96FF] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#4D96FF]" />
                      <span>Cambiar ícono y categoría</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        const rec = recipe;
                        setSelectedRecipeDetail(null);
                        setDeletingRecipe(rec);
                      }}
                      className="w-full px-3.5 py-2 text-left font-semibold text-[#FF5C5C] hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#FF5C5C]" />
                      <span>Eliminar receta</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setSelectedRecipeDetail(null)}
              className="w-8 h-8 rounded-full bg-[#263238]/70 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#263238]/90 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title bar with soft gradient */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-8 pb-4 px-5 text-white z-20 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  const rec = recipe;
                  setSelectedRecipeDetail(null);
                  setRecipeToChangeCategory(rec);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FFD447] bg-black/40 hover:bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20 transition-all cursor-pointer"
                title="Tocar para cambiar la opción de filtrado"
              >
                <span>{getCategoryIcon(recipe.category)}</span>
                <span>{recipe.category}</span>
                <Tag className="w-2.5 h-2.5 ml-0.5 opacity-80" />
              </button>
              <span className="text-[11px] font-semibold text-white/80">· {recipe.diet}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mt-1">
              {recipe.emoji} {recipe.name}
            </h2>
          </div>
        </div>

        {/* Quick info bar */}
        <div className="px-6 py-3.5 bg-[#FFFDF7] border-b border-[#263238]/8 flex items-center justify-between text-xs font-semibold text-[#263238]/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#FF8A3D]" />
            <span>{recipe.timeMin} minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#4D96FF]" />
            <span>{recipe.servings} porciones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Dificultad: {recipe.difficulty}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Ingredients section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#263238]">
                Ingredientes necesarios
              </h3>
              <span className="text-xs text-[#263238]/50">
                {recipe.ingredients.length} items
              </span>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing, i) => {
                const inPantry = pantryKeySet.has(normalizeIngredientName(ing.name));
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#263238]/8 bg-[#FFFDF7] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#263238]">{ing.name}</span>
                      <span className="text-[#263238]/60">
                        — {ing.amount} {ing.unit}
                      </span>
                    </div>

                    <div>
                      {inPantry ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#39B54A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          En despensa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF8A3D]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Falta comprar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#263238] mb-3">
              Preparación paso a paso
            </h3>
            <ol className="space-y-2.5">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-[#263238]/90">
                  <span className="w-5 h-5 rounded-full bg-[#39B54A]/20 text-[#2b8838] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Assign day accordion if opened */}
          {showDaySelector && (
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#39B54A]/40 space-y-3 animate-in fade-in">
              <p className="text-xs font-bold text-[#263238]">
                Seleccioná qué día y momento querés cocinarla:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
                  className="bg-white border border-[#263238]/20 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>

                <div className="flex rounded-xl border border-[#263238]/20 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMealType('almuerzo')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                      selectedMealType === 'almuerzo' ? 'bg-[#FFD447] text-[#263238]' : 'text-[#263238]/60'
                    }`}
                  >
                    Almuerzo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMealType('cena')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                      selectedMealType === 'cena' ? 'bg-[#4D96FF] text-white' : 'text-[#263238]/60'
                    }`}
                  >
                    Cena
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToMenu}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs transition-colors"
              >
                Confirmar y agregar al menú
              </button>
            </div>
          )}

          {/* Bottom actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleAddAllToShopping}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-[#FF8A3D] text-[#FF8A3D] hover:bg-[#FF8A3D]/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar a compras</span>
            </button>

            <button
              onClick={() => setShowDaySelector(!showDaySelector)}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Agregar al menú</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
