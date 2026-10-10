import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Tag, Check, Plus, Sparkles, Smile } from 'lucide-react';
import { RecipeIconPicker } from './RecipeIconPicker';

export const ChangeRecipeCategoryModal: React.FC = () => {
  const {
    recipeToChangeCategory,
    setRecipeToChangeCategory,
    updateRecipe,
    allRecipeCategories,
    addRecipeCategory,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Clásicos');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🍲');
  const [customCatInput, setCustomCatInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (recipeToChangeCategory) {
      setSelectedCategory(recipeToChangeCategory.category || 'Clásicos');
      setSelectedEmoji(recipeToChangeCategory.emoji || '🍲');
      setShowCustomInput(false);
      setCustomCatInput('');
    }
  }, [recipeToChangeCategory]);

  if (!recipeToChangeCategory) return null;

  const recipe = recipeToChangeCategory;

  const handleSave = () => {
    updateRecipe(recipe.id, {
      category: selectedCategory,
      emoji: selectedEmoji,
    });
    setRecipeToChangeCategory(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCatInput.trim()) return;
    const trimmed = customCatInput.trim();
    addRecipeCategory(trimmed);
    setSelectedCategory(trimmed);
    setShowCustomInput(false);
    setCustomCatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center text-2xl shadow-xs">
              {selectedEmoji}
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#39B54A] uppercase tracking-wider">
                Cambiar ícono y categoría
              </span>
              <h2 className="text-lg font-bold tracking-tight text-[#263238] mt-0.5">
                {recipe.name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setRecipeToChangeCategory(null)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Section 1: Cambiar ícono */}
          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              1. Asignar ícono o emoji a la receta
            </label>
            <RecipeIconPicker
              value={selectedEmoji}
              onChange={setSelectedEmoji}
              recipeName={recipe.name}
              category={selectedCategory}
            />
          </div>

          {/* Section 2: Cambiar categoría de filtrado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#263238] block">
                2. Asignar opción de filtrado
              </label>
              <span className="text-[11px] font-bold text-[#1e6328] bg-[#39B54A]/15 px-2.5 py-0.5 rounded-md border border-[#39B54A]/30">
                Seleccionada: {selectedCategory}
              </span>
            </div>

            <p className="text-[11px] text-[#263238]/70">
              Elegí bajo qué opción querés que aparezca la receta al filtrar en el recetario:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {allRecipeCategories.map(cat => {
                const isSelected =
                  selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();

                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#39B54A] bg-[#39B54A]/15 ring-2 ring-[#39B54A]/25 shadow-xs font-bold'
                        : 'border-[#263238]/12 bg-white hover:border-[#39B54A]/40 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-xs border border-slate-100 shrink-0">
                      {cat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#263238]">
                          {cat.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#1e6328] bg-[#39B54A]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Elegida
                          </span>
                        )}
                        {cat.isCustom && (
                          <span className="text-[10px] font-bold text-[#735100] bg-[#FFD447]/20 px-1.5 py-0.2 rounded-md">
                            Propia
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#263238]/60 mt-0.5 line-clamp-1">
                        {cat.desc || 'Categoría de recetas'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Category Option */}
          <div className="pt-2 border-t border-[#263238]/8">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-xs font-bold text-[#4D96FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear una categoría personalizada distinta...
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-2">
                <label className="text-xs font-bold text-[#263238] block">
                  Nombre de la nueva categoría:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ej: Postres, Sopas, Minutas..."
                    value={customCatInput}
                    onChange={e => setCustomCatInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#39B54A] text-white font-bold text-xs rounded-xl hover:bg-[#329e41] cursor-pointer"
                  >
                    Asignar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-2 bg-slate-100 text-[#263238]/70 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FFFDF7] border-t border-[#263238]/8 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setRecipeToChangeCategory(null)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#263238]/70 hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
