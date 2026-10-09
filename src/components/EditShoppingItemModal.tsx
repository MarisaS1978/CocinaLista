import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';
import { X, ShoppingCart, Trash2, Plus, Minus, FolderPlus, Sparkles } from 'lucide-react';

export const EditShoppingItemModal: React.FC = () => {
  const {
    editingShoppingItem,
    setEditingShoppingItem,
    updateShoppingItem,
    removeShoppingItem,
    allPantryCategories,
    setIsCreatePantryCategoryModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>(1);
  const [unit, setUnit] = useState('unidades');
  const [category, setCategory] = useState<ProductCategory>('Almacén');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const commonUnits = ['unidades', 'kg', 'g', 'litros', 'ml', 'paquetes', 'latas'];

  useEffect(() => {
    if (editingShoppingItem) {
      setName(editingShoppingItem.name);
      setAmount(editingShoppingItem.toBuyAmount);
      setUnit(editingShoppingItem.unit);
      setCategory(editingShoppingItem.category);
    }
  }, [editingShoppingItem]);

  if (!editingShoppingItem) return null;

  const handleStepAmount = (delta: number) => {
    const cur = Number(amount) || 0;
    const step = unit === 'g' || unit === 'ml' ? 50 : 1;
    const next = Math.max(0.1, Math.round((cur + delta * step) * 10) / 10);
    setAmount(next);
  };

  const handleQuickAddAmount = (addVal: number) => {
    const cur = Number(amount) || 0;
    const next = Math.round((cur + addVal) * 10) / 10;
    setAmount(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedAmount = Math.max(0.1, Number(amount) || 1);

    updateShoppingItem(editingShoppingItem.id, {
      name: name.trim(),
      toBuyAmount: parsedAmount,
      amountNeeded: parsedAmount,
      unit,
      category,
    });

    setEditingShoppingItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8A3D]/15 text-[#FF8A3D] flex items-center justify-center text-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Editar producto de compras
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Modificá la cantidad a comprar, nombre o su categoría.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingShoppingItem(null)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              Nombre del producto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Tomates perita, Leche entera, Pan..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
            />
          </div>

          {/* Cantidad y Unidad */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#263238] block">
              Cantidad a comprar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Stepper Input */}
              <div className="flex items-center bg-[#FFFDF7] border border-[#263238]/20 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleStepAmount(-1)}
                  className="w-9 h-9 rounded-lg bg-white border border-[#263238]/10 text-[#263238] hover:bg-black/5 flex items-center justify-center font-bold text-sm cursor-pointer shadow-2xs transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full text-center font-bold text-sm bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStepAmount(1)}
                  className="w-9 h-9 rounded-lg bg-white border border-[#263238]/10 text-[#263238] hover:bg-black/5 flex items-center justify-center font-bold text-sm cursor-pointer shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Unidad */}
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none cursor-pointer"
              >
                {commonUnits.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick increment chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#263238]/50 font-semibold mr-1">
                Sumar rápido:
              </span>
              {[1, 2, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#39B54A]/15 text-[#263238] hover:text-[#1e6328] text-[11px] font-bold border border-[#263238]/10 transition-colors cursor-pointer"
                >
                  +{val} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#263238]">
                Categoría
              </label>
              <button
                type="button"
                onClick={() => setIsCreatePantryCategoryModalOpen(true)}
                className="text-[11px] font-bold text-[#39B54A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Nueva categoría</span>
              </button>
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ProductCategory)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none cursor-pointer"
            >
              {allPantryCategories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name} {c.isCustom ? ' (Personalizada)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Contexto del producto (recetas o despensa) */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10 space-y-1.5 text-xs text-[#263238]/75">
            <div className="flex items-center gap-1.5 font-bold text-[#263238]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>Información del producto:</span>
            </div>
            <p className="text-[11px]">
              <strong>Origen:</strong> {editingShoppingItem.recipes?.join(', ') || 'Agregado manual'}
            </p>
            {editingShoppingItem.amountInPantry > 0 && (
              <p className="text-[11px] text-[#39B54A]">
                Tenés {editingShoppingItem.amountInPantry} en tu despensa actualmente.
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-[#263238]/10 flex items-center justify-between gap-3">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#FF5C5C] font-semibold">¿Seguro que querés quitarlo?</span>
                <button
                  type="button"
                  onClick={() => {
                    removeShoppingItem(editingShoppingItem.id);
                    setEditingShoppingItem(null);
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
                className="px-3.5 py-2 rounded-xl text-[#FF5C5C] hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#FF5C5C]/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar producto</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setEditingShoppingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
