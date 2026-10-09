import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';
import { X, Carrot, Trash2, ArrowRightLeft, Calendar, Plus, Minus, FolderPlus } from 'lucide-react';

export const EditPantryModal: React.FC = () => {
  const {
    editingPantryItem,
    setEditingPantryItem,
    updatePantryItem,
    deletePantryItem,
    allPantryCategories,
    setIsCreatePantryCategoryModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>(1);
  const [unit, setUnit] = useState('unidades');
  const [category, setCategory] = useState<ProductCategory>('Verdulería');
  const [expirationDate, setExpirationDate] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const commonUnits = ['unidades', 'kg', 'g', 'litros', 'ml', 'paquetes', 'latas'];

  useEffect(() => {
    if (editingPantryItem) {
      setName(editingPantryItem.name);
      setAmount(editingPantryItem.amount);
      setUnit(editingPantryItem.unit);
      setCategory(editingPantryItem.category);
      setExpirationDate(editingPantryItem.expirationDate || '');
    }
  }, [editingPantryItem]);

  if (!editingPantryItem) return null;

  const handleStepAmount = (delta: number) => {
    const cur = Number(amount) || 0;
    const step = unit === 'g' || unit === 'ml' ? 50 : 1;
    const next = Math.max(0.1, Math.round((cur + delta * step) * 10) / 10);
    setAmount(next);
  };

  const handleAddDaysToExpiry = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setExpirationDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updatePantryItem(editingPantryItem.id, {
      name: name.trim(),
      amount: Number(amount) || 1,
      unit,
      category,
      expirationDate: expirationDate || undefined,
    });

    setEditingPantryItem(null);
  };

  const isCategoryChanged = editingPantryItem.category !== category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center text-xl">
              <Carrot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Editar producto de despensa
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Modificá cantidades, fecha o movelo a otra categoría.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingPantryItem(null)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
            />
          </div>

          {/* Cantidad y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Cantidad disponible
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStepAmount(-1)}
                  className="w-9 h-9 rounded-xl border border-[#263238]/20 bg-[#FFFDF7] hover:bg-slate-100 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  <Minus className="w-4 h-4 text-[#263238]/70" />
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 text-center px-2 py-2 text-xs font-bold bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStepAmount(1)}
                  className="w-9 h-9 rounded-xl border border-[#263238]/20 bg-[#FFFDF7] hover:bg-slate-100 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#263238]/70" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Unidad de medida
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              >
                {commonUnits.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Categoría (Mover elemento) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/12">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#263238] flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#39B54A]" />
                <span>Categoría en la despensa (Mover elemento)</span>
              </label>
              {isCategoryChanged && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFD447] text-[#263238]">
                  Se moverá a: {category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#263238]/60">
              Hacé clic en cualquier categoría para reubicar este alimento de inmediato:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {allPantryCategories.map(c => {
                const isSelected = category === c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#39B54A] bg-[#39B54A]/12 shadow-xs scale-[1.02]'
                        : 'border-[#263238]/12 bg-white hover:border-[#39B54A]/40 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{c.icon}</span>
                    <div className="min-w-0">
                      <span className={`block text-xs font-bold truncate ${isSelected ? 'text-[#1e6328]' : 'text-[#263238]'}`}>
                        {c.name}
                      </span>
                      <span className="block text-[10px] text-[#263238]/50 truncate">
                        {c.desc}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Quick card to add a new category */}
              <button
                type="button"
                onClick={() => setIsCreatePantryCategoryModalOpen(true)}
                className="p-2.5 rounded-xl border border-dashed border-[#39B54A]/40 bg-[#39B54A]/5 hover:bg-[#39B54A]/10 text-left flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#39B54A] truncate">
                    Nueva categoría
                  </span>
                  <span className="block text-[10px] text-[#263238]/50 truncate">
                    Crear categoría propia
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#263238] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF8A3D]" />
                <span>Fecha de vencimiento (opcional)</span>
              </label>
              {expirationDate && (
                <button
                  type="button"
                  onClick={() => setExpirationDate('')}
                  className="text-[10px] text-[#FF5C5C] hover:underline cursor-pointer"
                >
                  Quitar vencimiento
                </button>
              )}
            </div>
            <input
              type="date"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
            />
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-semibold text-[#263238]/60">Atajos rápidos:</span>
              <button
                type="button"
                onClick={() => handleAddDaysToExpiry(3)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#263238]/15 hover:border-[#39B54A] rounded-lg cursor-pointer"
              >
                +3 días
              </button>
              <button
                type="button"
                onClick={() => handleAddDaysToExpiry(7)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#263238]/15 hover:border-[#39B54A] rounded-lg cursor-pointer"
              >
                +7 días
              </button>
              <button
                type="button"
                onClick={() => handleAddDaysToExpiry(15)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#263238]/15 hover:border-[#39B54A] rounded-lg cursor-pointer"
              >
                +15 días
              </button>
              <button
                type="button"
                onClick={() => handleAddDaysToExpiry(30)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#263238]/15 hover:border-[#39B54A] rounded-lg cursor-pointer"
              >
                +1 mes
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-[#263238]/8 flex items-center justify-between gap-2">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#FF5C5C] font-semibold">¿Seguro que querés eliminar?</span>
                <button
                  type="button"
                  onClick={() => {
                    deletePantryItem(editingPantryItem.id);
                    setEditingPantryItem(null);
                  }}
                  className="px-3 py-1.5 bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Sí, eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1.5 text-xs text-[#263238]/60 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="px-3 py-2 text-xs font-semibold text-[#FF5C5C] hover:bg-red-50 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setEditingPantryItem(null)}
                className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Guardar cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
