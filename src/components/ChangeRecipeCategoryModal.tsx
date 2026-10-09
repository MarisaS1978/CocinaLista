import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STANDARD_CATEGORIES } from '../services/recipeCategories';
import { X, Tag, Check, Plus } from 'lucide-react';

export const ChangeRecipeCategoryModal: React.FC = () => {
  const {
    recipeToChangeCategory,
    setRecipeToChangeCategory,
    changeRecipeCategory,
    allRecipeCategories,
    addRecipeCategory,
  } = useApp();

  const [customCatInput, setCustomCatInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!recipeToChangeCategory) return null;

  const recipe = recipeToChangeCategory;
  const currentCategory = recipe.category || 'Clásicos';

  const handleSelect = (categoryName: string) => {
    changeRecipeCategory(recipe.id, categoryName);
    setRecipeToChangeCategory(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCatInput.trim()) return;
    const trimmed = customCatInput.trim();
    addRecipeCategory(trimmed);
    handleSelect(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#39B54A] uppercase tracking-wider">
                Asignar opción de filtrado
              </span>
              <h2 className="text-lg font-bold tracking-tight text-[#263238] mt-0.5">
                {recipe.emoji} {recipe.name}
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
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#FFFDF7] rounded-2xl border border-[#263238]/12 text-xs text-[#263238]/80 leading-relaxed">
            Elegí bajo qué opción del filtrado querés que aparezca esta receta. Por ejemplo, al asignarla a <strong>Tartas</strong>, aparecerá junto con las tartas precargadas y tus recetas agregadas.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#263238] block">
              Opciones del filtrado disponibles:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allRecipeCategories.map(cat => {
                const isSelected =
                  currentCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();

                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => handleSelect(cat.name)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#39B54A] bg-[#39B54A]/12 ring-2 ring-[#39B54A]/20 shadow-xs'
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
                            <Check className="w-3 h-3" /> Actual
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
        <div className="p-4 bg-[#FFFDF7] border-t border-[#263238]/8 flex justify-end">
          <button
            type="button"
            onClick={() => setRecipeToChangeCategory(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-[#263238]/70 hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
