import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import { X, Search, Sparkles, Plus, Clock, Users } from 'lucide-react';
import { matchRecipeCategory, getCategoryIcon } from '../services/recipeCategories';

export const AddMealModal: React.FC = () => {
  const {
    addMealTarget,
    setAddMealTarget,
    recipes,
    setWeeklyMeal,
    pantryMatches,
    setIsAddRecipeModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'recetas' | 'personalizado'>('recetas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Custom meal state
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍽️');
  const [customTime, setCustomTime] = useState(30);

  if (!addMealTarget) return null;

  const dayLabels: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  const mealLabels: Record<string, string> = {
    almuerzo: '🍽️ Almuerzo',
    cena: '🌙 Cena',
  };

  const normalizeText = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const isUserRecipe = (r: Recipe) =>
    Boolean(
      r.isCustom ||
      r.id.startsWith('rec_custom_') ||
      r.tags?.some(t => normalizeText(t).includes('mis receta'))
    );

  const isMisRecetasCategory = (c: string) => c === 'Mis recetas' || c === '⭐ Mis recetas';

  const customRecipesCount = recipes.filter(isUserRecipe).length;

  const standardCategories = ['Tartas', 'Carnes', 'Pastas', 'Guisos', 'Ensaladas', 'Pizzas', 'Clásicos'];
  const otherCategories = Array.from(
    new Set(
      recipes
        .map(r => r.category)
        .filter(c => c && !standardCategories.some(sc => matchRecipeCategory(c, sc)))
    )
  );

  const categories = [
    'Todas',
    ...(customRecipesCount > 0 ? ['Mis recetas'] : []),
    ...standardCategories,
    ...otherCategories,
  ];

  const cleanSearch = normalizeText(searchTerm);

  const filteredRecipes = recipes.filter(r => {
    // 1. Category match
    let matchesCat = false;
    if (selectedCategory === 'Todas') {
      matchesCat = true;
    } else if (isMisRecetasCategory(selectedCategory)) {
      matchesCat = isUserRecipe(r);
    } else {
      matchesCat = matchRecipeCategory(r.category, selectedCategory);
      if (!matchesCat && isUserRecipe(r)) {
        const normName = normalizeText(r.name);
        const normFilter = normalizeText(selectedCategory);
        const singularFilter = normFilter.endsWith('s') ? normFilter.slice(0, -1) : normFilter;
        if (normName.includes(singularFilter) || normName.includes(normFilter)) {
          matchesCat = true;
        }
      }
    }

    if (!matchesCat) return false;

    // 2. Comprehensive normalized search
    if (cleanSearch) {
      const normName = normalizeText(r.name);
      const normCat = normalizeText(r.category);
      const normDiet = normalizeText(r.diet || '');
      const normTags = (r.tags || []).map(normalizeText).join(' ');
      const normIngs = r.ingredients.map(i => normalizeText(i.name)).join(' ');

      const searchHit =
        normName.includes(cleanSearch) ||
        normCat.includes(cleanSearch) ||
        normDiet.includes(cleanSearch) ||
        normTags.includes(cleanSearch) ||
        normIngs.includes(cleanSearch) ||
        (cleanSearch.includes('nueva') ||
         cleanSearch.includes('mia') ||
         cleanSearch.includes('creada') ||
         cleanSearch.includes('agregada')
          ? isUserRecipe(r)
          : false);

      if (!searchHit) return false;
    }

    return true;
  });

  const handleSelectRecipe = (recipe: Recipe) => {
    setWeeklyMeal(addMealTarget.day, addMealTarget.mealType, { recipeId: recipe.id });
    setAddMealTarget(null);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setWeeklyMeal(addMealTarget.day, addMealTarget.mealType, {
      customName: customName.trim(),
      customEmoji,
      timeMin: Number(customTime) || 30,
    });
    setAddMealTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#39B54A] uppercase tracking-wider">
              <span>{dayLabels[addMealTarget.day]}</span>
              <span>·</span>
              <span>{mealLabels[addMealTarget.mealType]}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#263238] mt-0.5">
              Elegir comida para el menú
            </h2>
          </div>
          <button
            onClick={() => setAddMealTarget(null)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 pb-2 border-b border-[#263238]/6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('recetas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'recetas'
                  ? 'bg-[#39B54A] text-white shadow-xs'
                  : 'bg-slate-100 text-[#263238]/70 hover:text-[#263238]'
              }`}
            >
              Recetas disponibles ({recipes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('personalizado')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'personalizado'
                  ? 'bg-[#39B54A] text-white shadow-xs'
                  : 'bg-slate-100 text-[#263238]/70 hover:text-[#263238]'
              }`}
            >
              + Comida rápida
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setAddMealTarget(null);
              setIsAddRecipeModalOpen(true);
            }}
            className="text-xs font-bold text-[#4D96FF] hover:underline cursor-pointer"
          >
            <span>Crear nueva receta</span>
          </button>
        </div>

        {activeTab === 'recetas' ? (
          <div className="p-6 space-y-4">
            {/* Search and filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#263238]/40" />
                <input
                  type="text"
                  placeholder="Buscar receta (ej: pollo, fideos, lentejas)..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map(cat => {
                  let count = 0;
                  if (cat === 'Todas') {
                    count = recipes.length;
                  } else if (isMisRecetasCategory(cat)) {
                    count = customRecipesCount;
                  } else {
                    count = recipes.filter(r => {
                      if (matchRecipeCategory(r.category, cat)) return true;
                      if (isUserRecipe(r)) {
                        const normName = normalizeText(r.name);
                        const normCat = normalizeText(cat);
                        const singularCat = normCat.endsWith('s') ? normCat.slice(0, -1) : normCat;
                        return normName.includes(singularCat) || normName.includes(normCat);
                      }
                      return false;
                    }).length;
                  }

                  const isSelected = isMisRecetasCategory(selectedCategory)
                    ? isMisRecetasCategory(cat)
                    : selectedCategory === cat;
                  const catIcon =
                    cat === 'Todas' ? '🍽️' : isMisRecetasCategory(cat) ? '⭐' : getCategoryIcon(cat);
                  const labelText = cat.replace(/^⭐\s*/, '');

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#263238] text-white shadow-xs'
                          : 'bg-slate-100 text-[#263238]/70 hover:bg-slate-200'
                      }`}
                    >
                      <span>{catIcon}</span>
                      <span>{labelText}</span>
                      <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-[#263238]/60'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipe selection grid or empty state */}
            {filteredRecipes.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-[#263238]/20 bg-[#FFFDF7] space-y-3">
                <span className="text-3xl block">🍲</span>
                <p className="text-xs font-bold text-[#263238]">
                  No se encontraron recetas con los filtros actuales
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('Todas');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#39B54A] text-white text-xs font-bold hover:bg-[#329e41] cursor-pointer"
                  >
                    Ver todas las recetas
                  </button>
                  {customRecipesCount > 0 && !isMisRecetasCategory(selectedCategory) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('Mis recetas');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#4D96FF] text-[#2563EB] text-xs font-bold hover:bg-[#4D96FF]/10 cursor-pointer"
                    >
                      Ver mis recetas ({customRecipesCount})
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredRecipes.map(recipe => {
                  const match = pantryMatches.find(m => m.recipe.id === recipe.id);
                  const matchPercent = match?.matchPercent || 0;
                  const isCustom = isUserRecipe(recipe);

                  return (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left p-3 rounded-2xl border border-[#263238]/10 hover:border-[#39B54A] hover:bg-[#39B54A]/5 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-[#FFFDF7] rounded-xl border border-black/5 group-hover:scale-105 transition-transform">
                          {recipe.emoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#263238] group-hover:text-[#39B54A] transition-colors">
                              {recipe.name}
                            </h4>
                            {isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#4D96FF]/15 text-[#2563EB] border border-[#4D96FF]/30">
                                Tuya
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#263238]/60 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#FF8A3D]" />
                              {recipe.timeMin}m
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#4D96FF]" />
                              {recipe.servings} porc.
                            </span>
                            <span>·</span>
                            <span>{recipe.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {matchPercent >= 70 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#39B54A]/15 text-[#2b8838]">
                            {matchPercent}% en despensa
                          </span>
                        )}
                        <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-[#39B54A] group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateCustom} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Nombre de la comida
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Empanadas compradas, Vianda de trabajo, Sopa..."
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#263238] block mb-1.5">
                  Ícono / Emoji
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['🍽️', '🥗', '🍲', '🍕', '🥪', '🥟', '🥩', '🍚', '🍜'].map(em => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setCustomEmoji(em)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border cursor-pointer ${
                        customEmoji === em
                          ? 'border-[#39B54A] bg-[#39B54A]/20 scale-110'
                          : 'border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#263238] block mb-1.5">
                  Tiempo aprox. (minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={customTime}
                  onChange={e => setCustomTime(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddMealTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs"
              >
                Agregar al menú
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
