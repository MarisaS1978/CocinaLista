import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';
import { X, ShoppingCart, FolderPlus } from 'lucide-react';

export const AddShoppingItemModal: React.FC = () => {
  const {
    isAddShoppingModalOpen,
    setIsAddShoppingModalOpen,
    addCustomShoppingItem,
    allPantryCategories,
    setIsCreatePantryCategoryModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>(1);
  const [unit, setUnit] = useState('unidades');
  const [category, setCategory] = useState<ProductCategory>('Almacén');

  if (!isAddShoppingModalOpen) return null;

  const commonUnits = ['unidades', 'kg', 'g', 'litros', 'ml', 'paquetes', 'latas'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomShoppingItem(name.trim(), Number(amount) || 1, unit, category);
    setIsAddShoppingModalOpen(false);
    setName('');
    setAmount(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Agregar producto a compras
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Sumá un producto extra a tu lista semanal.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddShoppingModalOpen(false)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              Producto
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Servilletas, Yerba mate, Café, Detergente..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Unidad
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              >
                {commonUnits.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none cursor-pointer"
            >
              {allPantryCategories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name} {c.isCustom ? ' (Personalizada)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddShoppingModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs"
            >
              Agregar a la lista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
