import React from 'react';
import { useApp } from '../context/AppContext';
import { DayOfWeek, MealType } from '../types';
import {
  Sparkles,
  Plus,
  Clock,
  Trash2,
  RefreshCw,
  ShoppingCart,
  Eye,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { RecipeVisual } from '../components/RecipeVisual';

export const WeeklyMenuView: React.FC = () => {
  const {
    weeklyMenu,
    recipes,
    setWeeklyMeal,
    setAddMealTarget,
    setIsSmartMenuModalOpen,
    setSelectedRecipeDetail,
    setActiveTab,
    pendingShoppingCount,
    setIsShareMenuModalOpen,
    sharedMenuIncoming,
    applySharedMenu,
    dismissSharedMenu,
  } = useApp();

  const recipeMap = new Map(recipes.map(r => [r.id, r]));

  const days: { id: DayOfWeek; name: string; tag: string }[] = [
    { id: 'lunes', name: 'Lunes', tag: 'Inicio de semana' },
    { id: 'martes', name: 'Martes', tag: 'Día 2' },
    { id: 'miercoles', name: 'Miércoles', tag: 'Mitad de semana' },
    { id: 'jueves', name: 'Jueves', tag: 'Día 4' },
    { id: 'viernes', name: 'Viernes', tag: 'Fin de semana cerca' },
    { id: 'sabado', name: 'Sábado', tag: 'Fin de semana' },
    { id: 'domingo', name: 'Domingo', tag: 'Descanso & familia' },
  ];

  const renderMealSlot = (dayId: DayOfWeek, mealType: MealType) => {
    const slot = weeklyMenu[dayId]?.[mealType];
    const isLunch = mealType === 'almuerzo';
    const slotTitle = isLunch ? 'Almuerzo' : 'Cena';
    const slotIcon = isLunch ? '🍽️' : '🌙';

    if (!slot) {
      return (
        <div className="p-3 rounded-2xl border-2 border-dashed border-[#263238]/15 bg-[#FFFDF7]/60 hover:bg-[#FFFDF7] hover:border-[#39B54A]/40 transition-all flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#263238]/60">
            <span>{slotIcon}</span>
            <span>{slotTitle}: Sin planificar</span>
          </div>
          <button
            onClick={() => setAddMealTarget({ day: dayId, mealType })}
            className="px-2.5 py-1 text-xs font-bold text-[#39B54A] hover:bg-[#39B54A]/10 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </div>
      );
    }

    const recipe = slot.recipeId ? recipeMap.get(slot.recipeId) : null;
    const name = recipe ? recipe.name : slot.customName || 'Comida personalizada';
    const emoji = recipe ? recipe.emoji : slot.customEmoji || '🍽️';
    const time = recipe ? recipe.timeMin : slot.timeMin || 30;

    return (
      <div className="p-3.5 rounded-2xl border border-[#263238]/10 bg-white hover:border-[#39B54A]/50 shadow-xs transition-all flex flex-col justify-between gap-3 group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <RecipeVisual
              name={name}
              emoji={emoji}
              category={recipe?.category || 'Clásicos'}
              size="thumb"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#263238]/60 block">
                {slotIcon} {slotTitle}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[#263238] leading-tight truncate mt-0.5">
                {name}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-[#263238]/60 mt-1">
                <Clock className="w-3 h-3 text-[#FF8A3D]" />
                <span>{time} min</span>
                {recipe && (
                  <>
                    <span>·</span>
                    <span>{recipe.difficulty}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            {recipe && (
              <button
                onClick={() => setSelectedRecipeDetail(recipe)}
                title="Ver detalles de la receta"
                className="p-1.5 rounded-lg text-[#263238]/60 hover:text-[#263238] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setAddMealTarget({ day: dayId, mealType })}
              title="Cambiar comida"
              className="p-1.5 rounded-lg text-[#263238]/60 hover:text-[#39B54A] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeeklyMeal(dayId, mealType, null)}
              title="Quitar comida"
              className="p-1.5 rounded-lg text-[#263238]/40 hover:text-[#FF5C5C] hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recipe && (
          <div className="pt-2 border-t border-[#263238]/6 flex items-center justify-between text-[11px] text-[#263238]/60">
            <span>{recipe.ingredients.length} ingredientes calculados</span>
            <span className="text-[#39B54A] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              En tu lista
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Alerta de menú compartido recibido por enlace */}
      {sharedMenuIncoming && (
        <div className="p-4 rounded-3xl bg-[#4D96FF]/10 border-2 border-[#4D96FF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1e40af] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#4D96FF] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1e3a8a]">
                ¡Has abierto un menú semanal compartido!
              </h4>
              <p className="text-xs text-[#1e40af]/80 mt-0.5">
                Podés aplicarlo a tu planificación semanal o mantener tu menú actual.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={dismissSharedMenu}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#4D96FF]/30 text-[#1e40af] font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={applySharedMenu}
              className="px-4 py-2 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              Aplicar menú recibido
            </button>
          </div>
        </div>
      )}

      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#263238]/10 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#39B54A] uppercase tracking-wider">
            Planificación semanal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">
            Mi menú de comidas
          </h1>
          <p className="text-xs sm:text-sm text-[#263238]/70 mt-1">
            Cada plato que programes calcula automáticamente los ingredientes necesarios para tu compra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsShareMenuModalOpen(true)}
            title="Compartir menú semanal mediante enlace"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#4D96FF]/40 text-[#2563EB] text-xs font-bold hover:bg-[#4D96FF]/10 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#4D96FF]" />
            <span>Compartir</span>
          </button>

          <button
            onClick={() => setActiveTab('compras')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#FF8A3D] text-[#FF8A3D] text-xs font-bold hover:bg-[#FF8A3D]/10 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Lista ({pendingShoppingCount})</span>
          </button>

          <button
            onClick={() => setIsSmartMenuModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD447]" />
            <span>Generar menú</span>
          </button>
        </div>
      </div>

      {/* Connection pipeline banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#39B54A]/10 via-[#20C9B0]/10 to-[#FFD447]/10 border border-[#39B54A]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#263238]">
        <div className="flex items-center gap-2 font-bold text-xs">
          <span>📅 Tu menú</span>
          <span>→</span>
          <span>🥕 Resta tu despensa</span>
          <span>→</span>
          <span>🛒 Lista de compras lista</span>
        </div>
        <span className="text-[11px] text-[#263238]/70 font-medium">
          Los ingredientes repetidos se suman y se descuenta lo que ya tenés en casa.
        </span>
      </div>

      {/* Grid de 7 días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {days.map(d => (
          <div
            key={d.id}
            className="bg-white rounded-3xl p-4 border border-[#263238]/10 shadow-xs flex flex-col justify-between gap-3"
          >
            {/* Header del día */}
            <div className="flex items-center justify-between pb-2 border-b border-[#263238]/8">
              <div>
                <h3 className="font-bold text-base text-[#263238]">
                  {d.name}
                </h3>
                <span className="text-[11px] text-[#263238]/50">
                  {d.tag}
                </span>
              </div>
              <button
                onClick={() => setAddMealTarget({ day: d.id, mealType: 'almuerzo' })}
                title={`Agregar comida al ${d.name}`}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#39B54A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Slots: Almuerzo y Cena */}
            <div className="space-y-2.5">
              {renderMealSlot(d.id, 'almuerzo')}
              {renderMealSlot(d.id, 'cena')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
