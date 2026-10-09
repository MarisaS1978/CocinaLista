import React from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export const DeleteRecipeConfirmModal: React.FC = () => {
  const { deletingRecipe, setDeletingRecipe, deleteRecipe, getRecipeMenuUsage } = useApp();

  if (!deletingRecipe) return null;

  const usageDays = getRecipeMenuUsage(deletingRecipe.id);
  const isUsedInMenu = usageDays.length > 0;

  const handleConfirm = () => {
    deleteRecipe(deletingRecipe.id);
    setDeletingRecipe(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#263238]/10 text-[#263238] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C5C]/15 text-[#FF5C5C] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                ¿Eliminar esta receta?
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDeletingRecipe(null)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#263238]/80 leading-relaxed">
            <strong className="text-[#263238] font-bold">
              “{deletingRecipe.name}”
            </strong>{' '}
            se eliminará de tu biblioteca de recetas.
          </p>

          {/* Warning if included in weekly menu */}
          {isUsedInMenu && (
            <div className="p-4 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-xs text-[#b82f2f] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-[#FF5C5C]" />
                <span>Esta receta está incluida en tu menú semanal:</span>
              </div>
              <p className="text-[11px] font-semibold text-[#801e1e]">
                {usageDays.join(' · ')}
              </p>
              <p className="text-[11px] text-[#9c2727] leading-relaxed">
                Si la eliminás, también se quitará automáticamente del menú de esos días y se actualizará tu lista de compras.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setDeletingRecipe(null)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-[#FF5C5C] hover:bg-[#e04545] active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {isUsedInMenu ? 'Eliminar receta y quitar del menú' : 'Eliminar receta'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
