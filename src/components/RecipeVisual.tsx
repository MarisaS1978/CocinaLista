import React, { useState } from 'react';

interface RecipeVisualProps {
  name: string;
  emoji: string;
  category?: string;
  image?: string;
  size?: 'card' | 'hero' | 'thumb';
  className?: string;
  showCategoryBadge?: boolean;
}

// Category-specific pastel color palettes and ambient styling
interface ThemeStyle {
  bgGradient: string;
  circleColor: string;
  textColor: string;
  borderColor: string;
  subIcon: string;
}

const CATEGORY_THEMES: Record<string, ThemeStyle> = {
  Carnes: {
    bgGradient: 'bg-gradient-to-br from-[#FF8A3D]/18 via-[#FFF4EC] to-[#FFD447]/15',
    circleColor: 'bg-[#FF8A3D]/12',
    textColor: 'text-[#d6671e]',
    borderColor: 'border-[#FF8A3D]/25',
    subIcon: '🥩',
  },
  Pastas: {
    bgGradient: 'bg-gradient-to-br from-[#FFD447]/28 via-[#FFFDF0] to-[#FF8A3D]/12',
    circleColor: 'bg-[#FFD447]/20',
    textColor: 'text-[#c2960a]',
    borderColor: 'border-[#FFD447]/40',
    subIcon: '🍝',
  },
  Guisos: {
    bgGradient: 'bg-gradient-to-br from-[#FF5C5C]/18 via-[#FFF2EE] to-[#FF8A3D]/15',
    circleColor: 'bg-[#FF5C5C]/12',
    textColor: 'text-[#d43f3f]',
    borderColor: 'border-[#FF5C5C]/25',
    subIcon: '🥘',
  },
  Tartas: {
    bgGradient: 'bg-gradient-to-br from-[#39B54A]/16 via-[#F2FCF4] to-[#FFD447]/15',
    circleColor: 'bg-[#39B54A]/12',
    textColor: 'text-[#2b8838]',
    borderColor: 'border-[#39B54A]/25',
    subIcon: '🥧',
  },
  Ensaladas: {
    bgGradient: 'bg-gradient-to-br from-[#20C9B0]/20 via-[#F0FDFB] to-[#39B54A]/14',
    circleColor: 'bg-[#20C9B0]/14',
    textColor: 'text-[#168e7c]',
    borderColor: 'border-[#20C9B0]/25',
    subIcon: '🥗',
  },
  Pizzas: {
    bgGradient: 'bg-gradient-to-br from-[#FF8A3D]/20 via-[#FFF5ED] to-[#FF5C5C]/15',
    circleColor: 'bg-[#FF8A3D]/15',
    textColor: 'text-[#d6671e]',
    borderColor: 'border-[#FF8A3D]/30',
    subIcon: '🍕',
  },
  Clásicos: {
    bgGradient: 'bg-gradient-to-br from-[#4D96FF]/16 via-[#F2F7FF] to-[#20C9B0]/14',
    circleColor: 'bg-[#4D96FF]/12',
    textColor: 'text-[#3575d3]',
    borderColor: 'border-[#4D96FF]/25',
    subIcon: '🍽️',
  },
};

const DEFAULT_THEME: ThemeStyle = {
  bgGradient: 'bg-gradient-to-br from-[#39B54A]/14 via-[#FFFDF7] to-[#FFD447]/16',
  circleColor: 'bg-[#39B54A]/10',
  textColor: 'text-[#2b8838]',
  borderColor: 'border-[#39B54A]/20',
  subIcon: '🍲',
};

export function getCulinaryIconForRecipe(name: string, currentEmoji?: string): string {
  if (currentEmoji) return currentEmoji;
  const n = (name || '').toLowerCase();
  if (n.includes('pollo')) return '🍗';
  if (n.includes('fideo') || n.includes('pasta') || n.includes('filetto') || n.includes('tallar') || n.includes('canelon') || n.includes('raviol')) return '🍝';
  if (n.includes('guiso') || n.includes('lenteja') || n.includes('estofado') || n.includes('cazuela')) return '🥘';
  if (n.includes('tortilla') || n.includes('papa') || n.includes('pure')) return '🥔';
  if (n.includes('ensalada')) return '🥗';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('sopa') || n.includes('caldo')) return '🍲';
  if (n.includes('carne') || n.includes('milanesa') || n.includes('bife') || n.includes('asado') || n.includes('peceto') || n.includes('lomo')) return '🥩';
  if (n.includes('hamburguesa')) return '🍔';
  if (n.includes('tarta') || n.includes('empanada') || n.includes('pascualina')) return '🥧';
  if (n.includes('arroz') || n.includes('risotto') || n.includes('wok')) return '🍚';
  if (n.includes('pescado') || n.includes('atun')) return '🐟';
  if (n.includes('huevo') || n.includes('omelette') || n.includes('revuelto')) return '🍳';
  return currentEmoji || '🍲';
}

export const RecipeVisual: React.FC<RecipeVisualProps> = ({
  name,
  emoji,
  category = 'Clásicos',
  image,
  size = 'card',
  className = '',
  showCategoryBadge = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  const displayEmoji = getCulinaryIconForRecipe(name, emoji);

  // Sizes:
  // 'card': 128px height (h-32) within 100-140px range consistent across recipe catalog
  // 'hero': 200px height for modals
  // 'thumb': 44px square for weekly menu slots
  if (size === 'thumb') {
    return (
      <div
        className={`w-11 h-11 rounded-xl ${theme.bgGradient} border ${theme.borderColor} flex items-center justify-center text-xl shrink-0 shadow-xs relative overflow-hidden select-none ${className}`}
      >
        <span>{displayEmoji}</span>
      </div>
    );
  }

  const heightClass = size === 'hero' ? 'h-48 sm:h-56' : 'h-32';
  const iconBoxSize = size === 'hero' ? 'w-24 h-24 text-5xl sm:text-6xl' : 'w-18 h-18 text-4xl';

  const shouldTryImage = Boolean(image && !imageError && !image.startsWith('/src/assets/'));

  return (
    <div
      className={`relative w-full ${heightClass} ${theme.bgGradient} border-b ${theme.borderColor} overflow-hidden select-none flex items-center justify-center transition-all ${className}`}
    >
      {/* Fallback & Primary Illustration Content (Always ready underneath) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Ambient geometric soft decorative elements */}
        <div
          className={`absolute -top-6 -right-6 w-32 h-32 rounded-full ${theme.circleColor} blur-lg opacity-70`}
        />
        <div
          className={`absolute -bottom-8 -left-8 w-36 h-36 rounded-full ${theme.circleColor} blur-xl opacity-60`}
        />

        {/* Delicate background corner watermark icons */}
        <span className="absolute top-2.5 right-3 text-sm opacity-25 filter blur-[0.3px]">
          {theme.subIcon}
        </span>
        <span className="absolute bottom-2 right-6 text-xs opacity-20 filter blur-[0.3px]">
          ✨
        </span>
        <span className="absolute top-3 left-4 text-xs opacity-20 filter blur-[0.3px]">
          🌿
        </span>

        {/* Central Embossed Gastronomic Medallion */}
        <div
          className={`relative z-10 ${iconBoxSize} rounded-2xl bg-white/85 backdrop-blur-xs border border-white/95 shadow-sm shadow-black/5 flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300`}
        >
          <span className="filter drop-shadow-xs leading-none">
            {displayEmoji}
          </span>
        </div>
      </div>

      {/* Optional real image layer with graceful error transition */}
      {shouldTryImage && (
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-300"
        />
      )}

      {/* Category Pill Tag */}
      {showCategoryBadge && category && (
        <div className="absolute bottom-2.5 left-3 z-30 pointer-events-none">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-[#263238]/75 text-white backdrop-blur-sm tracking-wide shadow-xs">
            {category}
          </span>
        </div>
      )}
    </div>
  );
};
