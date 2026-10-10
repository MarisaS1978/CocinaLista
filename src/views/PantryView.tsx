import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, PantryItem } from '../types';
import {
  Carrot,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Search,
  Edit3,
  ChevronDown,
  ArrowRightLeft,
  FolderPlus,
} from 'lucide-react';

export const PantryView: React.FC = () => {
  const {
    pantry,
    updatePantryItem,
    movePantryItemCategory,
    deletePantryItem,
    clearEntirePantry,
    setIsAddPantryModalOpen,
    setIsCookWithPantryModalOpen,
    setEditingPantryItem,
    expiringItems,
    allPantryCategories,
    customPantryCategories,
    setIsCreatePantryCategoryModalOpen,
    deletePantryCategory,
    getPantryCategoryIcon,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearPantryModal, setShowClearPantryModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PantryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const categoryNames = Array.from(
    new Set([
      ...allPantryCategories.map(c => c.name),
      ...pantry.map(p => p.category),
    ])
  );

  const filteredPantry = pantry.filter(item => {
    const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Group by category
  const grouped: Record<string, PantryItem[]> = {};
  filteredPantry.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  const selectedCategoryObj = allPantryCategories.find(
    c => c.name.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#263238]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#39B54A] uppercase tracking-wider">
            Inventario doméstico
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">
            Mi despensa
          </h1>
          <p className="text-xs sm:text-sm text-[#263238]/70 mt-1">
            Lo que registres acá se descuenta automáticamente de tu lista de compras semanal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 w-full sm:w-auto">
          {pantry.length > 0 ? (
            <button
              onClick={() => setShowClearPantryModal(true)}
              title="Borrar todos los productos de la despensa"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#FF5C5C]/40 text-[#FF5C5C] hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Vaciar despensa</span>
            </button>
          ) : (
            <button
              disabled
              title="La despensa ya está vacía"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-50 border border-[#263238]/10 text-[#263238]/40 text-xs font-bold cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Vaciar despensa</span>
            </button>
          )}

          <button
            onClick={() => setIsCookWithPantryModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#FFD447]/30 border border-[#FFD447] text-[#263238] text-xs font-bold hover:bg-[#FFD447]/50 transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#FF8A3D] shrink-0" />
            <span className="truncate">¿Qué cocinar?</span>
          </button>

          <button
            onClick={() => setIsCreatePantryCategoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/20 hover:border-[#39B54A] text-[#263238] text-xs font-bold transition-all cursor-pointer hover:bg-slate-50 shadow-2xs"
            title="Crear una nueva categoría para organizar la despensa"
          >
            <FolderPlus className="w-4 h-4 text-[#39B54A] shrink-0" />
            <span className="truncate">Nueva categoría</span>
          </button>

          <button
            onClick={() => setIsAddPantryModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0 sm:hidden" />
            <span className="truncate">Agregar producto</span>
          </button>
        </div>
      </div>

      {/* Alerta de vencimiento si existen alimentos por vencer */}
      {expiringItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9c2727]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5C5C] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#9c2727]">
                ⚠️ Estos productos están próximos a vencer:
              </h4>
              <p className="text-[11px] text-[#9c2727]/90 mt-0.5">
                {expiringItems.map(i => `${i.name} (${i.expirationDate})`).join(' · ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCookWithPantryModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF5C5C] text-white text-xs font-bold hover:bg-[#e04848] transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            Ver recetas para aprovecharlos
          </button>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('Todas')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'Todas'
                  ? 'bg-[#263238] text-white'
                  : 'bg-white border border-[#263238]/10 text-[#263238]/70 hover:bg-slate-50'
              }`}
            >
              🍽️ Todas ({pantry.length})
            </button>
            {categoryNames.map(cat => {
              const count = pantry.filter(p => p.category === cat).length;
              const icon = getPantryCategoryIcon(cat);
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#263238] text-white shadow-xs'
                      : 'bg-white border border-[#263238]/10 text-[#263238]/70 hover:bg-slate-50'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#263238]/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick button to add new category directly from tab strip */}
            <button
              type="button"
              onClick={() => setIsCreatePantryCategoryModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#39B54A] bg-[#39B54A]/10 hover:bg-[#39B54A]/20 border border-[#39B54A]/25 transition-colors cursor-pointer"
              title="Crear una nueva categoría en la despensa"
            >
              <span>Nueva categoría</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#263238]/40" />
            <input
              type="text"
              placeholder="Buscar en despensa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#263238]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
            />
          </div>
        </div>

        {/* Custom Category Context Bar if viewing a custom category */}
        {selectedCategory !== 'Todas' && selectedCategoryObj?.isCustom && (
          <div className="p-3 bg-white rounded-2xl border border-[#39B54A]/30 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl p-1 bg-[#39B54A]/10 rounded-xl">
                {selectedCategoryObj.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-[#263238]">
                    Categoría personalizada: {selectedCategoryObj.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#39B54A]/15 text-[#1e6328]">
                    Creada por vos
                  </span>
                </div>
                <p className="text-[11px] text-[#263238]/70">
                  {selectedCategoryObj.desc || 'Categoría propia de tu despensa.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsAddPantryModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#39B54A] text-white text-xs font-bold hover:bg-[#329e41] shadow-xs cursor-pointer"
              >
                <span>Agregar producto acá</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryToDelete(selectedCategoryObj.name)}
                className="px-2.5 py-1.5 rounded-xl bg-red-50 text-[#FF5C5C] hover:bg-red-100 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                title="Eliminar esta categoría personalizada"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar categoría</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredPantry.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#263238]/10 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD447]/20 text-2xl flex items-center justify-center mx-auto">
            {selectedCategory !== 'Todas' ? getPantryCategoryIcon(selectedCategory) : '🥕'}
          </div>
          <h3 className="text-base font-bold text-[#263238]">
            {selectedCategory !== 'Todas'
              ? `No hay productos registrados en "${selectedCategory}"`
              : 'No hay productos que coincidan con la búsqueda'}
          </h3>
          <p className="text-xs text-[#263238]/60 max-w-md mx-auto">
            {selectedCategory !== 'Todas'
              ? `Podés agregar productos a ${selectedCategory} haciendo clic en "Agregar producto".`
              : 'Podés agregar nuevos ingredientes que tengas en tu casa con el botón superior.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddPantryModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#39B54A] text-white text-xs font-bold hover:bg-[#329e41] shadow-xs cursor-pointer"
            >
              Agregar producto a {selectedCategory !== 'Todas' ? selectedCategory : 'la despensa'}
            </button>
            {selectedCategory !== 'Todas' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('Todas')}
                className="px-4 py-2 rounded-xl bg-white border border-[#263238]/15 text-[#263238] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryNames.map(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-white rounded-3xl p-5 border border-[#263238]/10 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-[#263238]/6">
                  <span className="text-xl">{getPantryCategoryIcon(cat)}</span>
                  <h3 className="font-bold text-sm text-[#263238] uppercase tracking-wider">
                    {cat}
                  </h3>
                  <span className="text-xs text-[#263238]/50 ml-auto">
                    {items.length} {items.length === 1 ? 'producto' : 'productos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-[#263238]/8 bg-[#FFFDF7] flex flex-col justify-between gap-3 group hover:border-[#39B54A]/50 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#263238] truncate group-hover:text-[#39B54A] transition-colors">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#263238]/70 mt-0.5">
                            <span className="font-bold text-[#39B54A]">
                              Cantidad: {item.amount} {item.unit}
                            </span>
                          </div>
                          {item.expirationDate && (
                            <div className="flex items-center gap-1 text-[11px] text-[#FF8A3D] font-medium mt-1">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>Vence: {item.expirationDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Card actions: Edit and Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingPantryItem(item)}
                            title="Editar o mover de categoría"
                            className="w-7 h-7 flex items-center justify-center text-[#263238]/50 hover:text-[#39B54A] hover:bg-[#39B54A]/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(item);
                            }}
                            title="Eliminar de despensa"
                            className="w-7 h-7 flex items-center justify-center text-[#263238]/40 hover:text-[#FF5C5C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom action row: Quick category mover & quick stepper */}
                      <div className="pt-2 border-t border-[#263238]/6 flex items-center justify-between gap-2">
                        {/* Mover de categoría */}
                        <div className="relative inline-flex items-center flex-1 min-w-0">
                          <div className="absolute left-2 pointer-events-none text-xs flex items-center">
                            <ArrowRightLeft className="w-3 h-3 text-[#39B54A]" />
                          </div>
                          <select
                            value={item.category}
                            onChange={e => movePantryItemCategory(item.id, e.target.value as ProductCategory)}
                            title="Mover a otra categoría"
                            className="w-full text-[11px] font-semibold py-1 pl-6 pr-6 rounded-lg bg-white border border-[#263238]/15 hover:border-[#39B54A] text-[#263238]/85 hover:text-[#263238] transition-colors cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-[#39B54A] truncate"
                          >
                            {allPantryCategories.map(c => (
                              <option key={c.id} value={c.name}>
                                {c.icon} {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none text-[#263238]/40" />
                        </div>

                        {/* Quick stepper +/- */}
                        <div className="flex items-center gap-1 bg-white border border-[#263238]/12 rounded-lg p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.unit === 'g' || item.unit === 'ml' ? 50 : 1;
                              const next = Math.max(0.1, Math.round((item.amount - step) * 10) / 10);
                              updatePantryItem(item.id, { amount: next });
                            }}
                            title="Restar cantidad"
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#263238]/60 hover:text-[#263238] hover:bg-black/5 rounded cursor-pointer transition-colors"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-bold px-1 text-[#263238]">
                            {item.amount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.unit === 'g' || item.unit === 'ml' ? 50 : 1;
                              const next = Math.round((item.amount + step) * 10) / 10;
                              updatePantryItem(item.id, { amount: next });
                            }}
                            title="Sumar cantidad"
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#263238]/60 hover:text-[#263238] hover:bg-black/5 rounded cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to Clear Entire Pantry */}
      {showClearPantryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF5C5C] flex items-center justify-center text-xl mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#263238]">
                ¿Vaciar toda la despensa?
              </h3>
              <p className="text-xs text-[#263238]/70">
                Se eliminarán todos los productos de tu despensa ({pantry.length} {pantry.length === 1 ? 'producto' : 'productos'}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearPantryModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearEntirePantry();
                  setShowClearPantryModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Sí, vaciar despensa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Single Pantry Item */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF5C5C] flex items-center justify-center text-xl mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#263238]">
                ¿Eliminar producto?
              </h3>
              <p className="text-xs text-[#263238]/70">
                ¿Seguro que querés quitar <strong className="text-[#263238]">"{itemToDelete.name}"</strong> ({itemToDelete.amount} {itemToDelete.unit}) de tu despensa?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePantryItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Pantry Category */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF5C5C] flex items-center justify-center text-xl mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#263238]">
                ¿Eliminar categoría?
              </h3>
              <p className="text-xs text-[#263238]/70">
                ¿Eliminar la categoría <strong className="text-[#263238]">"{categoryToDelete}"</strong>? Los productos que contenga se pasarán a "Otros".
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePantryCategory(categoryToDelete);
                  setSelectedCategory('Todas');
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

