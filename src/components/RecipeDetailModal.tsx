import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DayOfWeek, MealType, Ingredient } from '../types';
import {
  X,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  ShoppingCart,
  ChevronDown,
  Edit3,
  MoreVertical,
  Trash2,
  Tag,
  Sun,
  Carrot,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { normalizeIngredientName } from '../services/shoppingCalculator';
import { RecipeVisual } from './RecipeVisual';
import { getCategoryIcon } from '../services/recipeCategories';

export const RecipeDetailModal: React.FC = () => {
  const {
    selectedRecipeDetail,
    setSelectedRecipeDetail,
    pantry,
    addPantryItem,
    getPantryCategoryIcon,
    setWeeklyMeal,
    addCustomShoppingItem,
    addRecipeIngredientsToShopping,
    setEditingRecipe,
    setDeletingRecipe,
    setRecipeToChangeCategory,
    showToast,
  } = useApp();

  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('almuerzo');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Pantalla activa (Screen Wake Lock API)
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Modales de confirmación para agregar a la despensa
  const [ingredientToAddToPantry, setIngredientToAddToPantry] = useState<Ingredient | null>(null);
  const [showAddAllMissingToPantryModal, setShowAddAllMissingToPantryModal] = useState(false);

  // Request Wake Lock
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = sentinel;
        setIsWakeLockActive(true);
        sentinel.addEventListener('release', () => {
          setIsWakeLockActive(false);
          wakeLockRef.current = null;
        });
        showToast('☀️ Pantalla activa: tu dispositivo no se bloqueará mientras cocinás', 'success');
      } catch (err) {
        console.warn('Wake Lock request error:', err);
        setIsWakeLockActive(true);
        showToast('☀️ Modo pantalla activa encendido', 'info');
      }
    } else {
      setIsWakeLockActive(true);
      showToast('☀️ Modo cocina activado (tu navegador no admite bloqueo directo de pantalla)', 'info');
    }
  };

  // Release Wake Lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
      wakeLockRef.current = null;
    }
    setIsWakeLockActive(false);
    showToast('📱 Pantalla activa desactivada', 'info');
  };

  const toggleWakeLock = () => {
    if (isWakeLockActive) {
      releaseWakeLock();
    } else {
      requestWakeLock();
    }
  };

  // Limpieza al desmontar o cerrar el modal
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Re-adquirir Wake Lock si el usuario cambia de pestaña y regresa
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isWakeLockActive && !wakeLockRef.current) {
        if ('wakeLock' in navigator) {
          try {
            const sentinel = await (navigator as any).wakeLock.request('screen');
            wakeLockRef.current = sentinel;
            sentinel.addEventListener('release', () => {
              setIsWakeLockActive(false);
              wakeLockRef.current = null;
            });
          } catch (err) {
            console.warn('Error al readquirir Wake Lock:', err);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWakeLockActive]);

  if (!selectedRecipeDetail) return null;

  const recipe = selectedRecipeDetail;

  // Check which ingredients exist in pantry
  const pantryKeySet = new Set(pantry.map(p => normalizeIngredientName(p.name)));
  const missingIngredients = recipe.ingredients.filter(
    ing => !pantryKeySet.has(normalizeIngredientName(ing.name))
  );

  const handleAddToMenu = () => {
    setWeeklyMeal(selectedDay, selectedMealType, { recipeId: recipe.id });
    setShowDaySelector(false);
    setSelectedRecipeDetail(null);
  };

  const handleAddAllToShopping = () => {
    if (missingIngredients.length > 0) {
      addRecipeIngredientsToShopping(
        recipe.name,
        missingIngredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        }))
      );
    } else {
      showToast('¡Ya tenés todos los ingredientes en tu despensa!', 'info');
    }
  };

  // Confirmar y agregar un ingrediente individual a despensa
  const handleConfirmSingleToPantry = () => {
    if (!ingredientToAddToPantry) return;

    addPantryItem({
      name: ingredientToAddToPantry.name,
      amount: ingredientToAddToPantry.amount,
      unit: ingredientToAddToPantry.unit,
      category: ingredientToAddToPantry.category,
    });

    setIngredientToAddToPantry(null);
    showToast(`🥕 "${ingredientToAddToPantry.name}" agregado a tu despensa`, 'success');
  };

  // Confirmar y agregar todos los ingredientes faltantes a despensa
  const handleConfirmAllMissingToPantry = () => {
    missingIngredients.forEach(ing => {
      addPantryItem({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.category,
      });
    });

    setShowAddAllMissingToPantryModal(false);
    showToast(`🥕 ${missingIngredients.length} ingredientes agregados a tu despensa`, 'success');
  };

  const handleClose = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    setIsWakeLockActive(false);
    setSelectedRecipeDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Hero visual banner with pastel illustration */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <RecipeVisual
            name={recipe.name}
            emoji={recipe.emoji}
            category={recipe.category}
            size="hero"
            showCategoryBadge={false}
          />

          {/* Top action controls: Pantalla activa, Editar, ⋮ Más, and Close */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleWakeLock}
              title={isWakeLockActive ? 'Desactivar pantalla activa' : 'Activar pantalla activa para que no se bloquee el dispositivo al cocinar'}
              className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border ${
                isWakeLockActive
                  ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300 shadow-md'
                  : 'bg-white/95 text-[#263238] hover:bg-white border-[#263238]/10 hover:border-amber-400'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${isWakeLockActive ? 'text-amber-950 fill-amber-950' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">{isWakeLockActive ? 'Pantalla activa ON' : 'Pantalla activa'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const rec = recipe;
                handleClose();
                setEditingRecipe(rec);
              }}
              className="px-3 py-1.5 rounded-full bg-white/95 text-[#263238] hover:bg-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#263238]/10 hover:border-[#39B54A]"
              title="Editar receta"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#39B54A]" />
              <span>Editar</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-8 h-8 rounded-full bg-white/95 text-[#263238] hover:bg-white backdrop-blur-md flex items-center justify-center shadow-sm transition-all cursor-pointer border border-[#263238]/10"
                title="Más opciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-xl border border-[#263238]/10 py-1.5 w-52 text-xs animate-in fade-in zoom-in-95">
                    {missingIngredients.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowAddAllMissingToPantryModal(true);
                        }}
                        className="w-full px-3.5 py-2 text-left font-semibold text-[#263238] hover:bg-emerald-50 hover:text-[#2b8838] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Carrot className="w-3.5 h-3.5 text-[#39B54A]" />
                        <span>Sumar faltantes a despensa</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        const rec = recipe;
                        handleClose();
                        setRecipeToChangeCategory(rec);
                      }}
                      className="w-full px-3.5 py-2 text-left font-semibold text-[#263238] hover:bg-slate-50 hover:text-[#4D96FF] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#4D96FF]" />
                      <span>Cambiar ícono y categoría</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        const rec = recipe;
                        handleClose();
                        setDeletingRecipe(rec);
                      }}
                      className="w-full px-3.5 py-2 text-left font-semibold text-[#FF5C5C] hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#FF5C5C]" />
                      <span>Eliminar receta</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#263238]/70 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#263238]/90 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title bar with soft gradient */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-8 pb-4 px-5 text-white z-20 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  const rec = recipe;
                  setSelectedRecipeDetail(null);
                  setRecipeToChangeCategory(rec);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FFD447] bg-black/40 hover:bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20 transition-all cursor-pointer"
                title="Tocar para cambiar la opción de filtrado"
              >
                <span>{getCategoryIcon(recipe.category)}</span>
                <span>{recipe.category}</span>
                <Tag className="w-2.5 h-2.5 ml-0.5 opacity-80" />
              </button>
              <span className="text-[11px] font-semibold text-white/80">· {recipe.diet}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mt-1">
              {recipe.emoji} {recipe.name}
            </h2>
          </div>
        </div>

        {/* Quick info bar */}
        <div className="px-6 py-3.5 bg-[#FFFDF7] border-b border-[#263238]/8 flex items-center justify-between text-xs font-semibold text-[#263238]/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#FF8A3D]" />
            <span>{recipe.timeMin} minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#4D96FF]" />
            <span>{recipe.servings} porciones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Dificultad: {recipe.difficulty}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Ingredients section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#263238]">
                  Ingredientes necesarios
                </h3>
                <span className="text-xs text-[#263238]/50">
                  ({recipe.ingredients.length} items)
                </span>
              </div>

              {missingIngredients.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddAllMissingToPantryModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#39B54A]/10 hover:bg-[#39B54A]/20 text-[#2b8838] border border-[#39B54A]/30 text-xs font-bold transition-colors cursor-pointer"
                  title="Sumar todos los ingredientes faltantes a mi despensa con confirmación"
                >
                  <Carrot className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>Sumar faltantes a despensa ({missingIngredients.length})</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing, i) => {
                const inPantry = pantryKeySet.has(normalizeIngredientName(ing.name));
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#263238]/8 bg-[#FFFDF7] text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-bold text-[#263238] truncate">{ing.name}</span>
                      <span className="text-[#263238]/60 shrink-0">
                        — {ing.amount} {ing.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {inPantry ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#39B54A] bg-[#39B54A]/10 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>En despensa</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF8A3D]">
                            <AlertCircle className="w-3 h-3" />
                            Falta comprar
                          </span>
                          <button
                            type="button"
                            onClick={() => setIngredientToAddToPantry(ing)}
                            title={`Tengo ${ing.name} en casa: confirmar y agregar a mi despensa`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#39B54A]/10 hover:bg-[#39B54A]/20 text-[#2b8838] border border-[#39B54A]/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Carrot className="w-3.5 h-3.5 text-[#FF8A3D]" />
                            <span>+ A despensa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modo Cocina: Pantalla Activa Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isWakeLockActive
                ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-300'
                : 'bg-[#FFFDF7] border-[#263238]/12 text-[#263238]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  isWakeLockActive
                    ? 'bg-amber-400 text-white shadow-xs animate-pulse'
                    : 'bg-white border border-[#263238]/15 text-[#263238]/70 shadow-2xs'
                }`}
              >
                {isWakeLockActive ? '☀️' : '📱'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight">
                    Modo cocina: Pantalla activa
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isWakeLockActive
                        ? 'bg-amber-200 text-amber-900 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isWakeLockActive ? 'ACTIVADA' : 'DESACTIVADA'}
                  </span>
                </div>
                <p className="text-xs text-[#263238]/70 mt-0.5 leading-snug">
                  {isWakeLockActive
                    ? 'Tu dispositivo permanecerá encendido para que cocines sin tener que tocar la pantalla con las manos sucias.'
                    : 'Evitá que el teléfono o tablet se apague o bloquee mientras estás preparando esta receta.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleWakeLock}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-auto ${
                isWakeLockActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-[#263238] hover:bg-[#37474F] text-white shadow-xs'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${isWakeLockActive ? 'text-white' : 'text-[#FFD447]'}`} />
              <span>{isWakeLockActive ? 'Desactivar pantalla' : 'Mantener activa'}</span>
            </button>
          </div>

          {/* Instructions section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#263238] mb-3">
              Preparación paso a paso
            </h3>
            <ol className="space-y-2.5">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-[#263238]/90">
                  <span className="w-5 h-5 rounded-full bg-[#39B54A]/20 text-[#2b8838] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Assign day accordion if opened */}
          {showDaySelector && (
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#39B54A]/40 space-y-3 animate-in fade-in">
              <p className="text-xs font-bold text-[#263238]">
                Seleccioná qué día y momento querés cocinarla:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
                  className="bg-white border border-[#263238]/20 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>

                <div className="flex rounded-xl border border-[#263238]/20 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMealType('almuerzo')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                      selectedMealType === 'almuerzo' ? 'bg-[#FFD447] text-[#263238]' : 'text-[#263238]/60'
                    }`}
                  >
                    Almuerzo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMealType('cena')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                      selectedMealType === 'cena' ? 'bg-[#4D96FF] text-white' : 'text-[#263238]/60'
                    }`}
                  >
                    Cena
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToMenu}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs transition-colors"
              >
                Confirmar y agregar al menú
              </button>
            </div>
          )}

          {/* Bottom actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleAddAllToShopping}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-[#FF8A3D] text-[#FF8A3D] hover:bg-[#FF8A3D]/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar a compras</span>
            </button>

            <button
              onClick={() => setShowDaySelector(!showDaySelector)}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Agregar al menú</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación: Agregar UN ingrediente a la despensa */}
      {ingredientToAddToPantry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
            <div className="w-12 h-12 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center text-xl mx-auto shadow-xs">
              <Carrot className="w-6 h-6 text-[#39B54A]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#263238]">
                ¿Confirmar ingreso a tu despensa?
              </h3>
              <p className="text-xs text-[#263238]/70">
                ¿Confirmás registrar este ingrediente de la receta en tu despensa?
              </p>
            </div>

            <div className="p-3.5 bg-[#FFFDF7] rounded-2xl border border-[#263238]/10 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#263238]/6">
                <span className="text-[#263238]/60 font-semibold">Alimento:</span>
                <span className="text-[#263238] font-bold text-sm truncate max-w-[180px]">
                  {ingredientToAddToPantry.name}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#263238]/6">
                <span className="text-[#263238]/60 font-semibold">Cantidad a ingresar:</span>
                <span className="text-[#39B54A] font-extrabold text-sm">
                  +{ingredientToAddToPantry.amount} {ingredientToAddToPantry.unit}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#263238]/6">
                <span className="text-[#263238]/60 font-semibold">Categoría:</span>
                <span className="text-[#263238] font-bold flex items-center gap-1">
                  <span>{getPantryCategoryIcon(ingredientToAddToPantry.category)}</span>
                  <span>{ingredientToAddToPantry.category}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#263238]/60 font-semibold">Receta:</span>
                <span className="text-[#263238]/80 font-medium truncate max-w-[170px]">
                  {recipe.name}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 leading-snug flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>
                Se registrará en <strong>Mi despensa</strong> y se descontará automáticamente de tu lista de compras.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIngredientToAddToPantry(null)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer text-[#263238]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleToPantry}
                className="px-4 py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y agregar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación: Agregar TODOS los ingredientes faltantes a la despensa */}
      {showAddAllMissingToPantryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
            <div className="w-12 h-12 rounded-2xl bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center text-xl mx-auto shadow-xs">
              <Carrot className="w-6 h-6 text-[#39B54A]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#263238]">
                ¿Confirmar ingreso a tu despensa?
              </h3>
              <p className="text-xs text-[#263238]/70">
                Se registrarán los <strong>{missingIngredients.length}</strong> ingredientes de <em>{recipe.name}</em> que no tenías en tu despensa:
              </p>
            </div>

            <div className="max-h-52 overflow-y-auto p-3 bg-[#FFFDF7] rounded-2xl border border-[#263238]/10 divide-y divide-[#263238]/8 space-y-1.5">
              {missingIngredients.map((ing, idx) => (
                <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0 flex items-center gap-1.5 truncate">
                    <span className="text-base">{getPantryCategoryIcon(ing.category)}</span>
                    <span className="font-semibold text-[#263238] truncate">{ing.name}</span>
                  </div>
                  <span className="text-[#39B54A] font-extrabold shrink-0 bg-[#39B54A]/10 px-2 py-0.5 rounded-md">
                    +{ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 leading-snug flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>
                Estos ingredientes ya no figurarán como faltantes y no se pedirán en tu lista de compras.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddAllMissingToPantryModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer text-[#263238]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAllMissingToPantry}
                className="px-4 py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y sumar todos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
