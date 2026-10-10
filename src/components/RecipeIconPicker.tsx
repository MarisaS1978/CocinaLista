import React, { useState } from 'react';
import { Sparkles, Check, ChevronDown, ChevronUp, Smile } from 'lucide-react';
import { detectCategoryFromName } from '../services/recipeCategories';

export interface RecipeIconCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const CULINARY_EMOJI_GROUPS: RecipeIconCategory[] = [
  {
    id: 'populares',
    name: 'Populares',
    icon: '⭐',
    emojis: ['🥧', '🍗', '🍝', '🥘', '🥗', '🍕', '🍲', '🥩', '🥟', '🍔', '🥔', '🍳', '🥪', '🍚', '🍜', '🍰', '🍪', '🥑'],
  },
  {
    id: 'tartas',
    name: 'Tartas & Panes',
    icon: '🥧',
    emojis: ['🥧', '🥟', '🥐', '🥪', '🍞', '🥯', '🥖', '🥨', '🫓', '🧇', '🥞'],
  },
  {
    id: 'carnes',
    name: 'Carnes & Pollo',
    icon: '🥩',
    emojis: ['🍗', '🥩', '🍖', '🥓', '🍔', '🌭', '🍢'],
  },
  {
    id: 'pastas',
    name: 'Pastas & Pizzas',
    icon: '🍝',
    emojis: ['🍝', '🍕', '🧀', '🌮', '🌯', '🥙', '🫔'],
  },
  {
    id: 'guisos',
    name: 'Guisos & Ollas',
    icon: '🥘',
    emojis: ['🍲', '🥘', '🥣', '🍛', '🍜', '🍚', '🍳', '🥫'],
  },
  {
    id: 'ensaladas',
    name: 'Verduras & Frescos',
    icon: '🥗',
    emojis: ['🥗', '🥔', '🍅', '🥑', '🥕', '🌽', '🥦', '🥒', '🧄', '🧅', '🍄', '🥬', '🫑', '🍆'],
  },
  {
    id: 'pescados',
    name: 'Pescados & Mariscos',
    icon: '🐟',
    emojis: ['🐟', '🐠', '🦐', '🦑', '🦀', '🍣', '🍱'],
  },
  {
    id: 'dulces',
    name: 'Postres & Dulces',
    icon: '🍰',
    emojis: ['🍰', '🎂', '🧁', '🍮', '🍩', '🍪', '🍨', '🍫', '🍯', '🍬'],
  },
  {
    id: 'frutas',
    name: 'Frutas & Bebidas',
    icon: '🍎',
    emojis: ['🍎', '🍓', '🍋', '🍌', '🍊', '🍇', '🍉', '🍍', '☕', '🧃', '🧉', '🍷', '🍹', '🍺'],
  },
];

export function suggestEmojiFromRecipeName(name: string): string {
  const n = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (!n) return '🍲';

  const detected = detectCategoryFromName(name);
  if (detected?.emoji) return detected.emoji;

  if (n.includes('tarta') || n.includes('pascualina') || n.includes('quiche')) return '🥧';
  if (n.includes('empanada')) return '🥟';
  if (n.includes('pollo') || n.includes('suprema') || n.includes('alita')) return '🍗';
  if (n.includes('milanesa') || n.includes('carne') || n.includes('bife') || n.includes('asado') || n.includes('lomo') || n.includes('peceto') || n.includes('matambre')) return '🥩';
  if (n.includes('fideo') || n.includes('pasta') || n.includes('tallarin') || n.includes('noqui') || n.includes('raviol') || n.includes('canelon') || n.includes('spaghetti')) return '🍝';
  if (n.includes('pizza') || n.includes('fugazz') || n.includes('calzone')) return '🍕';
  if (n.includes('guiso') || n.includes('lenteja') || n.includes('estofado') || n.includes('cazuela') || n.includes('carbonada')) return '🥘';
  if (n.includes('sopa') || n.includes('caldo') || n.includes('crema')) return '🥣';
  if (n.includes('tortilla') || n.includes('papa') || n.includes('pure')) return '🥔';
  if (n.includes('ensalada') || n.includes('caesar') || n.includes('rucula')) return '🥗';
  if (n.includes('pescado') || n.includes('atun') || n.includes('merluza') || n.includes('salmon')) return '🐟';
  if (n.includes('marisco') || n.includes('langostino') || n.includes('camaron')) return '🦐';
  if (n.includes('huevo') || n.includes('omelette') || n.includes('revuelto')) return '🍳';
  if (n.includes('sandwich') || n.includes('sanguch') || n.includes('tostado')) return '🥪';
  if (n.includes('hamburguesa') || n.includes('burger')) return '🍔';
  if (n.includes('taco') || n.includes('fajita') || n.includes('burrito')) return '🌮';
  if (n.includes('arroz') || n.includes('risotto') || n.includes('paella')) return '🍚';
  if (n.includes('pan ') || n.includes('casero') || n.includes('focaccia')) return '🍞';
  if (n.includes('torta') || n.includes('pastel') || n.includes('chocotorta')) return '🎂';
  if (n.includes('flan') || n.includes('postre') || n.includes('budin')) return '🍮';
  if (n.includes('helado')) return '🍨';
  if (n.includes('gallet') || n.includes('cookie') || n.includes('alfajor')) return '🍪';
  if (n.includes('mate') || n.includes('infusion')) return '🧉';
  if (n.includes('cafe')) return '☕';

  return '🍲';
}

interface RecipeIconPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  recipeName?: string;
  category?: string;
  onManualSelect?: () => void;
}

export const RecipeIconPicker: React.FC<RecipeIconPickerProps> = ({
  value,
  onChange,
  recipeName = '',
  category = 'Tartas',
  onManualSelect,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('populares');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [customInput, setCustomInput] = useState<string>('');

  const currentGroup = CULINARY_EMOJI_GROUPS.find(g => g.id === selectedGroup) || CULINARY_EMOJI_GROUPS[0];

  const handlePickEmoji = (ico: string) => {
    onChange(ico);
    if (onManualSelect) onManualSelect();
  };

  const handleSuggest = () => {
    if (!recipeName.trim()) return;
    const suggested = suggestEmojiFromRecipeName(recipeName);
    onChange(suggested);
    if (onManualSelect) onManualSelect();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onChange(customInput.trim());
      setCustomInput('');
      if (onManualSelect) onManualSelect();
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#263238]/15 space-y-3">
      {/* Header with active icon badge & auto-suggest */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#263238]/8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            title="Tocá para ver más íconos"
            className="w-13 h-13 rounded-2xl bg-white border border-[#263238]/15 shadow-xs flex items-center justify-center text-3xl shrink-0 ring-2 ring-[#39B54A]/30 hover:scale-105 transition-all cursor-pointer relative group"
          >
            <span>{value || '🍲'}</span>
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-[#39B54A] text-white rounded-md text-[9px] font-bold shadow-xs">
              ✏️
            </span>
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-[#263238]">
                Ícono asignado a la receta
              </label>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-[#39B54A]/15 text-[#1e6328]">
                Activo
              </span>
            </div>
            <p className="text-[11px] text-[#263238]/65 mt-0.5">
              Tocá cualquier ícono para asignarlo a esta receta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {recipeName.trim() && (
            <button
              type="button"
              onClick={handleSuggest}
              title="Elegir ícono automáticamente según el título de la receta"
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FFD447] text-[#263238] text-xs font-bold hover:bg-[#FFD447]/20 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>Auto-sugerir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-xs text-[#263238]/60 hover:text-[#263238] rounded-lg hover:bg-black/5 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{isExpanded ? 'Menos íconos' : 'Catálogo completo'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tira rápida de íconos gastronómicos más populares - Siempre visible */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#263238]/60 uppercase tracking-wider block">
          Asignación rápida de ícono:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['🥧', '🍗', '🍝', '🥘', '🥗', '🍕', '🍲', '🥩', '🥟', '🍔', '🌮', '🍳', '🥪', '🍚', '🍜', '🥑', '🥞', '🍣', '🍰', '🍪', '🍫', '🍎'].map(ico => {
            const isSelected = value === ico;
            return (
              <button
                key={ico}
                type="button"
                onClick={() => handlePickEmoji(ico)}
                title={`Asignar ícono ${ico}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#39B54A]/25 ring-2 ring-[#39B54A] scale-110 shadow-xs font-bold'
                    : 'bg-white border border-[#263238]/12 hover:scale-110 hover:bg-slate-50'
                }`}
              >
                {ico}
              </button>
            );
          })}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CULINARY_EMOJI_GROUPS.map(grp => {
              const isActive = selectedGroup === grp.id;
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => setSelectedGroup(grp.id)}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#263238] text-white shadow-2xs'
                      : 'bg-white border border-[#263238]/10 text-[#263238]/70 hover:bg-slate-50'
                  }`}
                >
                  <span>{grp.icon}</span>
                  <span className="text-[11px]">{grp.name}</span>
                </button>
              );
            })}
          </div>

          {/* Grid of Culinary Emojis */}
          <div className="p-2.5 bg-white rounded-2xl border border-[#263238]/10 shadow-inner">
            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-1.5">
              {currentGroup.emojis.map(ico => {
                const isSelected = value === ico;
                return (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => handlePickEmoji(ico)}
                    title={`Asignar ícono ${ico}`}
                    className={`h-9 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#39B54A]/20 ring-2 ring-[#39B54A] scale-105 shadow-xs font-bold'
                        : 'hover:bg-slate-100 hover:scale-110'
                    }`}
                  >
                    <span>{ico}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#39B54A] text-white rounded-full flex items-center justify-center text-[8px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Emoji Input & Tip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-[11px] text-[#263238]/60 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-[#39B54A]" />
              ¿Querés otro emoji? Escribilo o pegalo acá:
            </span>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                maxLength={4}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Ej: 🥗"
                className="w-16 px-2 py-1 text-center text-sm bg-white border border-[#263238]/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                disabled={!customInput.trim()}
                className="px-2.5 py-1 rounded-lg bg-[#263238] text-white font-bold text-xs hover:bg-[#37474F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
