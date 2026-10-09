import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, ShoppingItem } from '../types';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  ArrowDownToLine,
  RotateCcw,
  Sparkles,
  Info,
  Edit3,
  FolderPlus,
} from 'lucide-react';

export const ShoppingListView: React.FC = () => {
  const {
    shoppingList,
    toggleShoppingItemBought,
    clearBoughtItems,
    clearEntireShoppingList,
    restoreShoppingListFromMenu,
    hasDismissedShoppingItems,
    removeCustomShoppingItem,
    removeShoppingItem,
    setIsAddShoppingModalOpen,
    pendingShoppingCount,
    boughtShoppingCount,
    showToast,
    allPantryCategories,
    setIsCreatePantryCategoryModalOpen,
    deletePantryCategory,
    getPantryCategoryIcon,
    setEditingShoppingItem,
    updateShoppingItem,
    moveShoppingItemCategory,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Todas');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const totalCount = shoppingList.length;
  const progressPercent = totalCount > 0 ? Math.round((boughtShoppingCount / totalCount) * 100) : 0;

  // Dynamic categories combined from all available categories and any in current list
  const categories: string[] = Array.from(
    new Set([
      ...allPantryCategories.map(c => c.name),
      ...shoppingList.map(s => s.category),
    ])
  );

  // Partition into pending and bought
  const pendingItems = shoppingList.filter(item => !item.isBought);
  const boughtItems = shoppingList.filter(item => item.isBought);

  // Filtered by selected category tab
  const filterFn = (item: ShoppingItem) =>
    activeCategoryFilter === 'Todas' || item.category === activeCategoryFilter;

  const filteredPending = pendingItems.filter(filterFn);
  const filteredBought = boughtItems.filter(filterFn);

  // Group pending by category
  const groupedPending: Record<string, ShoppingItem[]> = {};
  filteredPending.forEach(item => {
    if (!groupedPending[item.category]) {
      groupedPending[item.category] = [];
    }
    groupedPending[item.category].push(item);
  });

  const handleCopyList = () => {
    if (shoppingList.length === 0) return;

    let text = `🛒 *Mi Lista de Compras - Cocina Lista*\n`;
    text += `Pendientes: ${pendingShoppingCount} productos\n\n`;

    categories.forEach(cat => {
      const itemsInCat = pendingItems.filter(i => i.category === cat);
      if (itemsInCat.length > 0) {
        text += `${getPantryCategoryIcon(cat)} *${cat.toUpperCase()}*\n`;
        itemsInCat.forEach(i => {
          text += `☐ ${i.name} — ${i.toBuyAmount} ${i.unit}\n`;
        });
        text += `\n`;
      }
    });

    if (boughtItems.length > 0) {
      text += `✓ *COMPRADOS (${boughtItems.length}):*\n`;
      boughtItems.forEach(i => {
        text += `☑ ${i.name} — ${i.toBuyAmount} ${i.unit}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    showToast('📋 Lista copiada al portapapeles para WhatsApp', 'success');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#263238]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF8A3D] uppercase tracking-wider">
            Lista inteligente
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">
            Lista de compras
          </h1>
          <p className="text-xs sm:text-sm text-[#263238]/70 mt-1">
            Calculada a partir de tu menú semanal y descontando lo que ya tenés en la despensa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {shoppingList.length > 0 ? (
            <button
              onClick={() => setShowClearAllModal(true)}
              title="Vaciar completamente la lista de compras"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#FF5C5C]/40 text-[#FF5C5C] hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar lista</span>
            </button>
          ) : (
            <button
              disabled
              title="La lista de compras ya está vacía"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-[#263238]/10 text-[#263238]/40 text-xs font-bold cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar lista</span>
            </button>
          )}

          <button
            onClick={() => setIsCreatePantryCategoryModalOpen(true)}
            title="Crear una nueva categoría para organizar la lista"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/20 hover:border-[#39B54A] text-[#263238] text-xs font-bold transition-all cursor-pointer hover:bg-slate-50 shadow-2xs"
          >
            <FolderPlus className="w-4 h-4 text-[#39B54A]" />
            <span>Nueva categoría</span>
          </button>

          <button
            onClick={handleCopyList}
            title="Copiar lista de compras para WhatsApp o notas"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/15 text-[#263238] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Copy className="w-4 h-4 text-[#4D96FF]" />
            <span>Copiar lista</span>
          </button>

          <button
            onClick={() => setIsAddShoppingModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Agregar producto</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-5 rounded-3xl border border-[#263238]/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#263238]">
              {boughtShoppingCount} de {totalCount} productos comprados
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#39B54A]/10 text-[#2b8838]">
              {progressPercent}%
            </span>
          </div>

          {boughtItems.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowClearConfirm(!showClearConfirm)}
                className="text-xs font-bold text-[#FF5C5C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar comprados ({boughtItems.length})</span>
              </button>

              {/* Action Popover */}
              {showClearConfirm && (
                <div className="absolute right-0 top-7 z-20 w-64 p-3 rounded-2xl bg-white shadow-xl border border-[#263238]/15 space-y-2 animate-in fade-in">
                  <p className="text-[11px] font-bold text-[#263238]">
                    ¿Qué querés hacer con los productos marcados?
                  </p>
                  <button
                    onClick={() => {
                      clearBoughtItems(true);
                      setShowClearConfirm(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl bg-[#39B54A]/10 hover:bg-[#39B54A]/20 text-xs font-bold text-[#2b8838] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Pasar a Mi Despensa</span>
                  </button>
                  <button
                    onClick={() => {
                      clearBoughtItems(false);
                      setShowClearConfirm(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#263238]/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF5C5C]" />
                    <span>Solo eliminar de la lista</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#39B54A] to-[#20C9B0] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveCategoryFilter('Todas')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeCategoryFilter === 'Todas'
              ? 'bg-[#263238] text-white'
              : 'bg-white border border-[#263238]/10 text-[#263238]/70 hover:bg-slate-50'
          }`}
        >
          Todas ({totalCount})
        </button>
        {categories.map(cat => {
          const count = shoppingList.filter(i => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-[#263238] text-white'
                  : 'bg-white border border-[#263238]/10 text-[#263238]/70 hover:bg-slate-50'
              }`}
            >
              <span>{getPantryCategoryIcon(cat)}</span>
              <span>{cat}</span>
              <span className="text-[11px] opacity-70">({count})</span>
            </button>
          );
        })}

        {/* Quick button to add new category directly from tab strip */}
        <button
          type="button"
          onClick={() => setIsCreatePantryCategoryModalOpen(true)}
          className="px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#39B54A] bg-[#39B54A]/10 hover:bg-[#39B54A]/20 border border-[#39B54A]/25 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          title="Crear una nueva categoría para la lista"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>+ Categoría</span>
        </button>
      </div>

      {/* Active Category Banner */}
      {activeCategoryFilter !== 'Todas' && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-2xl border border-[#263238]/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{getPantryCategoryIcon(activeCategoryFilter)}</span>
            <span className="font-bold text-[#263238]">{activeCategoryFilter}</span>
            <span className="text-[#263238]/50">
              ({shoppingList.filter(i => i.category === activeCategoryFilter).length} productos)
            </span>
            {allPantryCategories.find(c => c.name === activeCategoryFilter)?.isCustom && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#39B54A]/15 text-[#1e6328]">
                Personalizada
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {allPantryCategories.find(c => c.name === activeCategoryFilter)?.isCustom && (
              <button
                type="button"
                onClick={() => setCategoryToDelete(activeCategoryFilter)}
                className="text-[11px] font-bold text-[#FF5C5C] hover:bg-red-50 border border-[#FF5C5C]/30 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              >
                Eliminar categoría
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('Todas')}
              className="text-[#263238]/60 hover:text-[#263238] text-[11px] font-semibold hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {shoppingList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#263238]/10 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#39B54A]/10 text-[#39B54A] flex items-center justify-center text-3xl mx-auto">
            🛒
          </div>
          <h3 className="text-lg font-bold text-[#263238]">
            Tu lista de compras está vacía
          </h3>
          <p className="text-xs text-[#263238]/70 max-w-sm mx-auto">
            Agregá comidas en la pestaña <strong>Mi Menú</strong> o agregá productos de forma manual con el botón superior.
          </p>
          {hasDismissedShoppingItems && (
            <div className="pt-2">
              <button
                type="button"
                onClick={restoreShoppingListFromMenu}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#263238] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#39B54A]" />
                <span>Recalcular lista desde mi menú semanal</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* PENDING ITEMS GROUPED BY CATEGORY */}
          {categories.map(cat => {
            const items = groupedPending[cat];
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

                <div className="divide-y divide-[#263238]/6">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 group transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleShoppingItemBought(item.id)}
                          className="w-6 h-6 rounded-lg border-2 border-[#263238]/30 hover:border-[#39B54A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <span className="sr-only">Marcar comprado</span>
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#263238]">
                              {item.name}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FFFDF7] border border-[#263238]/15 text-[#263238]">
                              {item.toBuyAmount} {item.unit}
                            </span>
                          </div>

                          {/* Source breakdown and pantry deduction */}
                          <div className="flex items-center gap-1.5 text-[11px] text-[#263238]/60 mt-0.5 truncate">
                            {item.amountInPantry > 0 && (
                              <span className="text-[#39B54A] font-semibold">
                                (Tenés {item.amountInPantry} en despensa) ·
                              </span>
                            )}
                            <span className="truncate">
                              {item.recipes.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Stepper, Category switcher, Edit & Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pl-9 sm:pl-0">
                        {/* Quick Stepper +/- */}
                        <div className="flex items-center bg-[#FFFDF7] border border-[#263238]/12 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.unit === 'g' || item.unit === 'ml' ? 50 : 1;
                              const next = Math.max(0.1, Math.round((item.toBuyAmount - step) * 10) / 10);
                              updateShoppingItem(item.id, { toBuyAmount: next, amountNeeded: next });
                            }}
                            title="Restar cantidad a comprar"
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#263238]/60 hover:text-[#263238] hover:bg-black/5 rounded cursor-pointer transition-colors"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold px-1.5 text-[#263238] min-w-[20px] text-center">
                            {item.toBuyAmount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.unit === 'g' || item.unit === 'ml' ? 50 : 1;
                              const next = Math.round((item.toBuyAmount + step) * 10) / 10;
                              updateShoppingItem(item.id, { toBuyAmount: next, amountNeeded: next });
                            }}
                            title="Sumar cantidad a comprar"
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#263238]/60 hover:text-[#263238] hover:bg-black/5 rounded cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Edit modal trigger */}
                        <button
                          type="button"
                          onClick={() => setEditingShoppingItem(item)}
                          title="Editar producto (nombre, cantidad, categoría)"
                          className="p-1.5 text-[#263238]/50 hover:text-[#39B54A] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete item */}
                        <button
                          type="button"
                          onClick={() => removeShoppingItem(item.id)}
                          title="Eliminar producto de la lista"
                          className="p-1.5 text-[#263238]/40 hover:text-[#FF5C5C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* SECTION: ✓ COMPRADOS */}
          {filteredBought.length > 0 && (
            <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-[#39B54A]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#263238]">
                    ✓ Comprados ({filteredBought.length})
                  </h3>
                </div>
                <span className="text-xs text-[#263238]/50">
                  Tocá para desmarcar
                </span>
              </div>

              <div className="divide-y divide-slate-200/80">
                {filteredBought.map(item => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-slate-500"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleShoppingItemBought(item.id)}
                        className="w-6 h-6 rounded-lg bg-[#39B54A] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <span className="line-through font-medium text-sm text-slate-500">
                          {item.name} — {item.toBuyAmount} {item.unit}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingShoppingItem(item)}
                        title="Editar producto"
                        className="p-1 text-slate-400 hover:text-[#39B54A] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleShoppingItemBought(item.id)}
                        className="text-xs text-[#39B54A] hover:underline cursor-pointer"
                      >
                        Desmarcar
                      </button>
                      <button
                        onClick={() => removeShoppingItem(item.id)}
                        title="Eliminar de la lista"
                        className="p-1 text-slate-400 hover:text-[#FF5C5C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal to Delete Custom Category */}
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
                ¿Eliminar la categoría <strong className="text-[#263238]">"{categoryToDelete}"</strong>? Los productos pasarán a "Otros".
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePantryCategory(categoryToDelete);
                  setActiveCategoryFilter('Todas');
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear Entire Shopping List */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF5C5C] flex items-center justify-center text-xl mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#263238]">
                ¿Limpiar completamente la lista?
              </h3>
              <p className="text-xs text-[#263238]/70">
                Se vaciarán todos los productos pendientes y comprados de la lista de compras.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearEntireShoppingList();
                  setShowClearAllModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sí, vaciar lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
