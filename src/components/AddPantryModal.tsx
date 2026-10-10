import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';
import { X, Carrot, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

export const AddPantryModal: React.FC = () => {
  const {
    isAddPantryModalOpen,
    setIsAddPantryModalOpen,
    addPantryItem,
    allPantryCategories,
    setIsCreatePantryCategoryModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>(1);
  const [unit, setUnit] = useState('unidades');
  const [category, setCategory] = useState<ProductCategory>('Verdulería');
  const [expirationDate, setExpirationDate] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isAddPantryModalOpen) return null;

  const commonUnits = ['unidades', 'kg', 'g', 'litros', 'ml', 'paquetes', 'latas'];

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setShowConfirm(true);
  };

  const handleConfirmAdd = () => {
    if (!name.trim()) return;

    addPantryItem({
      name: name.trim(),
      amount: Number(amount) || 1,
      unit,
      category,
      expirationDate: expirationDate || undefined,
    });

    setIsAddPantryModalOpen(false);
    setName('');
    setAmount(1);
    setExpirationDate('');
    setShowConfirm(false);
  };

  const handleClose = () => {
    setIsAddPantryModalOpen(false);
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8A3D]/15 text-[#FF8A3D] flex items-center justify-center">
              <Carrot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Agregar a mi despensa
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Registrá alimentos que ya tenés en tu cocina.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showConfirm ? (
          /* Confirmation Screen */
          <div className="p-6 space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-[#39B54A]/10 border border-[#39B54A]/25 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#39B54A] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  🥕
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263238]">
                    ¿Confirmar alimento para la despensa?
                  </h3>
                  <p className="text-xs text-[#263238]/70">
                    Revisá los datos antes de guardarlo en tu despensa.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#263238]/10 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#263238]/6">
                  <span className="text-[#263238]/60 font-semibold">Alimento:</span>
                  <span className="text-[#263238] font-bold text-sm">{name.trim()}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#263238]/6">
                  <span className="text-[#263238]/60 font-semibold">Cantidad a ingresar:</span>
                  <span className="text-[#39B54A] font-extrabold text-sm">{amount} {unit}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#263238]/6">
                  <span className="text-[#263238]/60 font-semibold">Categoría:</span>
                  <span className="text-[#263238] font-bold">{category}</span>
                </div>
                {expirationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#263238]/60 font-semibold">Vencimiento:</span>
                    <span className="text-[#FF8A3D] font-bold">{expirationDate}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[#263238]/75 bg-white/60 p-2.5 rounded-xl border border-[#39B54A]/20">
                <span className="text-base leading-none">💡</span>
                <span>
                  Al confirmar, este alimento se sumará a tu inventario y <strong>se descontará automáticamente</strong> de las recetas de tu menú semanal en la lista de compras.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/20 bg-white text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-[#263238]"
              >
                Volver a editar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-4 py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y agregar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleInitialSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Alimento o producto
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej: Papa, Huevos, Arroz, Fideos..."
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
                  <Plus className="w-3 h-3" />
                  <span>Nueva categoría</span>
                </button>
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              >
                {allPantryCategories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name} {c.isCustom ? ' (Personalizada)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
