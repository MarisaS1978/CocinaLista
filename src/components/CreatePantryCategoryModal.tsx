import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  POPULAR_PANTRY_ICONS,
  suggestIconForPantryCategory,
} from '../services/pantryCategories';
import { X, FolderPlus, Sparkles, Check } from 'lucide-react';

export const CreatePantryCategoryModal: React.FC = () => {
  const {
    isCreatePantryCategoryModalOpen,
    setIsCreatePantryCategoryModalOpen,
    addPantryCategory,
  } = useApp();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📦');
  const [hasManuallyChosenIcon, setHasManuallyChosenIcon] = useState(false);
  const [description, setDescription] = useState('');

  if (!isCreatePantryCategoryModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!hasManuallyChosenIcon) {
      const suggested = suggestIconForPantryCategory(val);
      setSelectedIcon(suggested);
    }
  };

  const handleSelectIcon = (icon: string) => {
    setSelectedIcon(icon);
    setHasManuallyChosenIcon(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const ok = addPantryCategory(name.trim(), selectedIcon, description.trim());
    if (ok) {
      setName('');
      setSelectedIcon('📦');
      setHasManuallyChosenIcon(false);
      setDescription('');
      setIsCreatePantryCategoryModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#263238]/10 text-[#263238] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Nueva categoría
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Organizá tu despensa y lista de compras con tus propias categorías.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatePantryCategoryModalOpen(false)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              Nombre de la categoría
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Bebidas, Panadería, Especias, Snacks..."
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#263238]">
                Icono o emoji representativo
              </label>
              {!hasManuallyChosenIcon && name.trim() && (
                <span className="text-[10px] font-bold text-[#1e6328] bg-[#39B54A]/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-sugerido
                </span>
              )}
            </div>

            {/* Popular icons grid */}
            <div className="p-3 bg-[#FFFDF7] border border-[#263238]/12 rounded-2xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#263238]/15 shadow-xs flex items-center justify-center text-2xl shrink-0">
                  {selectedIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-[#263238]/70 block">
                    Icono seleccionado
                  </span>
                  <input
                    type="text"
                    maxLength={3}
                    value={selectedIcon}
                    onChange={e => {
                      if (e.target.value) {
                        setSelectedIcon(e.target.value);
                        setHasManuallyChosenIcon(true);
                      }
                    }}
                    placeholder="Escribí un emoji..."
                    className="mt-1 px-2.5 py-1 text-xs bg-white border border-[#263238]/15 rounded-lg w-full max-w-[140px] focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#263238]/8">
                <span className="text-[10px] font-bold text-[#263238]/60 uppercase tracking-wider block mb-1.5">
                  Elegí rápido:
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                  {POPULAR_PANTRY_ICONS.map(ico => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => handleSelectIcon(ico)}
                      className={`h-8 rounded-lg flex items-center justify-center text-base transition-transform hover:scale-115 cursor-pointer ${
                        selectedIcon === ico
                          ? 'bg-[#39B54A]/20 ring-2 ring-[#39B54A]'
                          : 'hover:bg-black/5'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              Descripción o notas (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Jugos, gaseosas, agua mineral..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
            />
          </div>

          {/* Vista previa */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#263238]/70">
              Vista previa en filtros:
            </span>
            <div className="px-3 py-1 rounded-xl bg-white border border-[#263238]/15 text-[#263238] font-bold text-xs flex items-center gap-1.5 shadow-2xs">
              <span>{selectedIcon}</span>
              <span>{name.trim() || 'Nueva categoría'}</span>
              <span className="text-[10px] bg-slate-100 text-[#263238]/60 px-1.5 py-0.2 rounded-md">
                0
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatePantryCategoryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar categoría</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
