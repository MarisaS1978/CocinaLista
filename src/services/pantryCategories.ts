export interface PantryCategoryInfo {
  id: string;
  name: string;
  icon: string;
  desc: string;
  isCustom?: boolean;
}

export const DEFAULT_PANTRY_CATEGORIES: PantryCategoryInfo[] = [
  { id: 'Verdulería', name: 'Verdulería', icon: '🥬', desc: 'Frutas, verduras y hortalizas' },
  { id: 'Carnicería', name: 'Carnicería', icon: '🥩', desc: 'Carnes, aves, pescados y embutidos' },
  { id: 'Almacén', name: 'Almacén', icon: '🥫', desc: 'Secos, latas, pastas, harinas y arroces' },
  { id: 'Lácteos', name: 'Lácteos', icon: '🥛', desc: 'Leche, quesos, manteca y yogur' },
  { id: 'Huevos', name: 'Huevos', icon: '🥚', desc: 'Huevos de campo y frescos' },
  { id: 'Congelados', name: 'Congelados', icon: '🧊', desc: 'Freezer y verduras congeladas' },
  { id: 'Otros', name: 'Otros', icon: '🧴', desc: 'Condimentos, panadería y varios' },
];

export const POPULAR_PANTRY_ICONS = [
  '🍞', '🥖', '🥐', '🧀', '🧂', '🍫', '🍬', '🥤', '🧃', '☕',
  '🍵', '🍷', '🍺', '🍯', '🌿', '🌾', '🍎', '🍇', '🥑', '🍋',
  '🌶️', '🍪', '🧼', '🧴', '🧻', '🥜', '🥫', '📦', '⭐', '🍕'
];

/**
 * Suggests an icon based on category name
 */
export function suggestIconForPantryCategory(name: string): string {
  const norm = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (norm.includes('pan') || norm.includes('factura') || norm.includes('medialuna') || norm.includes('tostad')) return '🍞';
  if (norm.includes('queso') || norm.includes('fiambr')) return '🧀';
  if (norm.includes('bebida') || norm.includes('jugo') || norm.includes('gaseosa') || norm.includes('agua')) return '🥤';
  if (norm.includes('especia') || norm.includes('condimento') || norm.includes('sal') || norm.includes('pimienta')) return '🧂';
  if (norm.includes('dulce') || norm.includes('chocolate') || norm.includes('snack') || norm.includes('golosina') || norm.includes('golos') || norm.includes('postre')) return '🍫';
  if (norm.includes('cafe') || norm.includes('te') || norm.includes('infusion') || norm.includes('mate')) return '☕';
  if (norm.includes('vino') || norm.includes('cerveza') || norm.includes('alcohol') || norm.includes('licor')) return '🍷';
  if (norm.includes('limpieza') || norm.includes('higiene') || norm.includes('jabon') || norm.includes('detergente')) return '🧼';
  if (norm.includes('dietetica') || norm.includes('cereal') || norm.includes('semilla') || norm.includes('fruto seco') || norm.includes('nuez')) return '🥜';
  if (norm.includes('fruta') || norm.includes('manzana')) return '🍎';
  if (norm.includes('hierba') || norm.includes('aromatica') || norm.includes('huerta')) return '🌿';
  if (norm.includes('salsa') || norm.includes('aderezo') || norm.includes('aceite') || norm.includes('vinagre')) return '🥫';
  if (norm.includes('mascota') || norm.includes('perro') || norm.includes('gato')) return '🐾';

  return '📦';
}

const STORAGE_KEY = 'cocina_lista_custom_pantry_categories';

export function loadSavedCustomPantryCategories(): PantryCategoryInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        id: String(item.id || item.name),
        name: String(item.name || item.id),
        icon: String(item.icon || '📦'),
        desc: String(item.desc || 'Categoría personalizada'),
        isCustom: true,
      }));
    }
  } catch (e) {
    console.error('Error loading custom pantry categories:', e);
  }
  return [];
}

export function saveCustomPantryCategories(cats: PantryCategoryInfo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Error saving custom pantry categories:', e);
  }
}
