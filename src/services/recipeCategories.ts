import { RecipeCategoryInfo } from '../types';

export interface CategoryConfig {
  name: string;
  icon: string;
  desc: string;
  defaultEmoji: string;
}

export const STANDARD_CATEGORIES: CategoryConfig[] = [
  { name: 'Tartas', icon: '🥧', desc: 'Tartas, empanadas y pascualinas', defaultEmoji: '🥧' },
  { name: 'Carnes', icon: '🥩', desc: 'Pollo, carnes y milanesas', defaultEmoji: '🍗' },
  { name: 'Pastas', icon: '🍝', desc: 'Fideos, ñoquis y pastas', defaultEmoji: '🍝' },
  { name: 'Guisos', icon: '🥘', desc: 'Guisos, estofados y lentejas', defaultEmoji: '🥘' },
  { name: 'Ensaladas', icon: '🥗', desc: 'Ensaladas frescas', defaultEmoji: '🥗' },
  { name: 'Pizzas', icon: '🍕', desc: 'Pizzas y masas al horno', defaultEmoji: '🍕' },
  { name: 'Clásicos', icon: '🍽️', desc: 'Tortillas y platos tradicionales', defaultEmoji: '🥔' },
];

export const STANDARD_CATEGORY_NAMES = STANDARD_CATEGORIES.map(c => c.name);

export const STANDARD_RECIPE_CATEGORIES: RecipeCategoryInfo[] = STANDARD_CATEGORIES.map(c => ({
  id: `cat_${c.name.toLowerCase()}`,
  name: c.name,
  icon: c.icon,
  desc: c.desc,
  isCustom: false,
}));

export const POPULAR_RECIPE_ICONS = [
  '🍰', '🥪', '🍣', '🥣', '🌮', '🌯', '🍪', '☕', '🥞', '🍔',
  '🥟', '🍜', '🍱', '🍤', '🥯', '🧁', '🧇', '🍷', '🍢', '🫔',
  '🍨', '🥑', '🍲', '🥖', '🍟', '🧀', '🍄', '🥘', '🥙', '🍳',
];

export function suggestIconForRecipeCategory(name: string): string {
  const norm = normalizeCategory(name);
  if (!norm) return '🍽️';

  if (norm.includes('postre') || norm.includes('dulce') || norm.includes('torta') || norm.includes('pastel')) return '🍰';
  if (norm.includes('sandwich') || norm.includes('sanguch') || norm.includes('tostad')) return '🥪';
  if (norm.includes('sopa') || norm.includes('caldo') || norm.includes('crema')) return '🥣';
  if (norm.includes('desayun') || norm.includes('meriend') || norm.includes('pancake') || norm.includes('panquequ')) return '🥞';
  if (norm.includes('taco') || norm.includes('burrito') || norm.includes('fajita') || norm.includes('mexic')) return '🌮';
  if (norm.includes('sushi') || norm.includes('pescad') || norm.includes('marisc')) return '🍣';
  if (norm.includes('hamburgues') || norm.includes('burger')) return '🍔';
  if (norm.includes('gallet') || norm.includes('cookie') || norm.includes('biscot')) return '🍪';
  if (norm.includes('bebida') || norm.includes('trago') || norm.includes('cocktail') || norm.includes('jugo')) return '🍹';
  if (norm.includes('cafe') || norm.includes('infusion') || norm.includes('te')) return '☕';
  if (norm.includes('panaderia') || norm.includes('pan ') || norm.endsWith('pan') || norm.includes('factura')) return '🥖';
  if (norm.includes('minuta') || norm.includes('rapido') || norm.includes('snack')) return '🍟';
  if (norm.includes('arroz') || norm.includes('risotto') || norm.includes('paella')) return '🍚';
  if (norm.includes('helado') || norm.includes('mousse')) return '🍨';
  if (norm.includes('vegano') || norm.includes('veggie') || norm.includes('vegetal')) return '🥑';
  if (norm.includes('parrilla') || norm.includes('asado') || norm.includes('bbq')) return '🥩';

  return '🍽️';
}

export function normalizeCategory(text: string = ''): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks whether a recipe category matches a filter category.
 * Accurately handles plural vs singular (e.g., "tarta" vs "tartas"),
 * synonyms (e.g., "empanadas" matching "Tartas"), and accent variations.
 */
export function matchRecipeCategory(recipeCategory: string = '', filterCategory: string = ''): boolean {
  const r = normalizeCategory(recipeCategory);
  const f = normalizeCategory(filterCategory);

  if (!r || !f) return false;
  if (r === f) return true;

  // Direct singular / plural comparison
  if (r + 's' === f || f + 's' === r) return true;
  if (r + 'es' === f || f + 'es' === r) return true;

  // Specific gastronomic synonym checks for Tartas
  if (f === 'tartas' || f === 'tarta') {
    if (r.includes('tarta') || r.includes('empanada') || r.includes('pascualina') || r.includes('quiche')) {
      return true;
    }
  }

  // Specific gastronomic synonym checks for Pastas
  if (f === 'pastas' || f === 'pasta') {
    if (r.includes('pasta') || r.includes('fideo') || r.includes('tallarin') || r.includes('noqui') || r.includes('raviol') || r.includes('canelon')) {
      return true;
    }
  }

  // Specific gastronomic synonym checks for Pizzas
  if (f === 'pizzas' || f === 'pizza') {
    if (r.includes('pizza') || r.includes('calzone') || r.includes('fugazza')) {
      return true;
    }
  }

  // Specific gastronomic synonym checks for Guisos
  if (f === 'guisos' || f === 'guiso') {
    if (r.includes('guiso') || r.includes('estofado') || r.includes('cazuela') || r.includes('lenteja')) {
      return true;
    }
  }

  // Specific gastronomic synonym checks for Carnes
  if (f === 'carnes' || f === 'carne') {
    if (r.includes('carne') || r.includes('pollo') || r.includes('milanesa') || r.includes('bife') || r.includes('asado') || r.includes('cerdo')) {
      return true;
    }
  }

  return false;
}

/**
 * Auto-detects category and culinary emoji from a recipe title.
 */
export function detectCategoryFromName(name: string): { category: string; emoji: string } | null {
  const lower = normalizeCategory(name);
  if (!lower) return null;

  if (
    lower.includes('tarta') ||
    lower.includes('empanada') ||
    lower.includes('pascualina') ||
    lower.includes('quiche')
  ) {
    return { category: 'Tartas', emoji: '🥧' };
  }

  if (
    lower.includes('pasta') ||
    lower.includes('fideo') ||
    lower.includes('tallarin') ||
    lower.includes('ñoqui') ||
    lower.includes('noqui') ||
    lower.includes('raviol') ||
    lower.includes('canelon') ||
    lower.includes('spaghetti')
  ) {
    return { category: 'Pastas', emoji: '🍝' };
  }

  if (
    lower.includes('pizza') ||
    lower.includes('calzone') ||
    lower.includes('fugazz')
  ) {
    return { category: 'Pizzas', emoji: '🍕' };
  }

  if (
    lower.includes('guiso') ||
    lower.includes('lenteja') ||
    lower.includes('estofado') ||
    lower.includes('cazuela') ||
    lower.includes('carbonada')
  ) {
    return { category: 'Guisos', emoji: '🥘' };
  }

  if (
    lower.includes('ensalada') ||
    lower.includes('caesar')
  ) {
    return { category: 'Ensaladas', emoji: '🥗' };
  }

  if (
    lower.includes('pollo') ||
    lower.includes('carne') ||
    lower.includes('milanesa') ||
    lower.includes('bife') ||
    lower.includes('asado') ||
    lower.includes('cerdo') ||
    lower.includes('peceto') ||
    lower.includes('lomo')
  ) {
    return { category: 'Carnes', emoji: lower.includes('pollo') ? '🍗' : '🥩' };
  }

  if (
    lower.includes('tortilla') ||
    lower.includes('revuelto') ||
    lower.includes('gramajo') ||
    lower.includes('pastel de papa')
  ) {
    return { category: 'Clásicos', emoji: '🥔' };
  }

  return null;
}

export function getCategoryIcon(cat: string, customCategories?: RecipeCategoryInfo[]): string {
  const norm = normalizeCategory(cat);
  if (!norm) return '🍽️';

  if (customCategories) {
    const customFound = customCategories.find(c => normalizeCategory(c.name) === norm);
    if (customFound?.icon) return customFound.icon;
  }

  const found = STANDARD_CATEGORIES.find(c => normalizeCategory(c.name) === norm);
  if (found) return found.icon;
  if (norm.includes('tarta')) return '🥧';
  if (norm.includes('carne') || norm.includes('pollo')) return '🥩';
  if (norm.includes('pasta') || norm.includes('fideo')) return '🍝';
  if (norm.includes('guiso')) return '🥘';
  if (norm.includes('ensalada')) return '🥗';
  if (norm.includes('pizza')) return '🍕';

  return suggestIconForRecipeCategory(cat);
}
