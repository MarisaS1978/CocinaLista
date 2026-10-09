import { Recipe, PantryItem, WeeklyMenu, ShoppingItem, ProductCategory } from '../types';

export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();
  // Remove accents
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Handle aliases & common pairings
  if (normalized.includes('papa')) return 'papa';
  if (normalized.includes('cebolla')) return 'cebolla';
  if (normalized.includes('huevo')) return 'huevo';
  if (normalized.includes('tomate')) return 'tomate';
  if (normalized.includes('zanahoria')) return 'zanahoria';
  if (normalized.includes('pollo')) return 'pollo';
  if (normalized.includes('arroz')) return 'arroz';
  if (normalized.includes('fideo')) return 'fideos';
  if (normalized.includes('lenteja')) return 'lentejas';
  if (normalized.includes('muzzarella') || normalized.includes('cremoso') || normalized.includes('queso rallado') || normalized.includes('ricota')) {
    if (normalized.includes('rallado')) return 'queso rallado';
    return 'queso muzzarella / cremoso';
  }
  if (normalized.includes('leche')) return 'leche';
  if (normalized.includes('manteca')) return 'manteca';
  if (normalized.includes('aceite')) return 'aceite';
  if (normalized.includes('harina')) return 'harina';
  if (normalized.includes('carne picada') || normalized.includes('milanesa') || normalized.includes('carne')) return 'carne vacuna';
  if (normalized.includes('acelga') || normalized.includes('espinaca')) return 'acelga / espinaca';
  if (normalized.includes('pure de tomate')) return 'pure de tomate';
  if (normalized.includes('atun')) return 'atun en lata';
  if (normalized.includes('morron')) return 'morron rojo';
  if (normalized.includes('arveja')) return 'arvejas en lata';
  if (normalized.includes('calabaza') || normalized.includes('anco')) return 'calabaza';
  if (normalized.includes('pan de hamburguesa')) return 'pan de hamburguesa';
  if (normalized.includes('tapa')) return 'tapas de masa';

  // Basic singularization
  if (normalized.endsWith('es')) normalized = normalized.slice(0, -2);
  else if (normalized.endsWith('s')) normalized = normalized.slice(0, -1);

  return normalized;
}

// Convert units to a base value for accurate math
export function normalizeUnitAndAmount(amount: number, unit: string): { baseAmount: number; baseType: 'weight' | 'count' | 'volume' | 'pkg' } {
  const u = unit.toLowerCase().trim();
  if (u === 'kg') return { baseAmount: amount * 1000, baseType: 'weight' };
  if (u === 'g') return { baseAmount: amount, baseType: 'weight' };
  if (u === 'litro' || u === 'litros' || u === 'l') return { baseAmount: amount * 1000, baseType: 'volume' };
  if (u === 'ml') return { baseAmount: amount, baseType: 'volume' };
  if (u === 'unidad' || u === 'unidades' || u === 'u') return { baseAmount: amount, baseType: 'count' };
  if (u === 'lata' || u === 'latas') return { baseAmount: amount, baseType: 'count' };
  if (u === 'paquete' || u === 'paquetes') return { baseAmount: amount, baseType: 'pkg' };
  return { baseAmount: amount, baseType: 'count' };
}

// Format back to human-friendly Argentine display
export function formatFriendlyQuantity(baseAmount: number, baseType: 'weight' | 'count' | 'volume' | 'pkg', originalUnit?: string): { amount: number; unit: string } {
  if (baseType === 'weight') {
    if (baseAmount >= 1000) {
      const kg = Math.round((baseAmount / 1000) * 10) / 10;
      return { amount: kg, unit: 'kg' };
    }
    return { amount: Math.round(baseAmount), unit: 'g' };
  }
  if (baseType === 'volume') {
    if (baseAmount >= 1000) {
      const l = Math.round((baseAmount / 1000) * 10) / 10;
      return { amount: l, unit: 'litros' };
    }
    return { amount: Math.round(baseAmount), unit: 'ml' };
  }
  if (baseType === 'pkg') {
    return { amount: Math.ceil(baseAmount), unit: 'paquete(s)' };
  }
  return { amount: Math.ceil(baseAmount), unit: originalUnit || 'unidades' };
}

export function calculateShoppingList(
  menu: WeeklyMenu,
  recipes: Recipe[],
  pantry: PantryItem[],
  customShoppingItems: ShoppingItem[],
  boughtMap: Record<string, boolean>,
  dismissedMap: Record<string, boolean> = {},
  overridesMap: Record<string, Partial<ShoppingItem>> = {}
): ShoppingItem[] {
  const recipeMap = new Map<string, Recipe>();
  recipes.forEach(r => recipeMap.set(r.id, r));

  // 1. Gather all needed ingredients from the weekly menu
  interface AggregatedNeed {
    displayName: string;
    normalizedKey: string;
    totalBaseAmount: number;
    baseType: 'weight' | 'count' | 'volume' | 'pkg';
    originalUnit: string;
    category: ProductCategory;
    recipeNames: Set<string>;
  }

  const neededIngredients = new Map<string, AggregatedNeed>();

  // Iterate all slots
  Object.values(menu).forEach(day => {
    ['almuerzo', 'cena'].forEach(mealKey => {
      const slot = day[mealKey as 'almuerzo' | 'cena'];
      if (!slot) return;

      if (slot.recipeId && recipeMap.has(slot.recipeId)) {
        const recipe = recipeMap.get(slot.recipeId)!;
        recipe.ingredients.forEach(ing => {
          const key = normalizeIngredientName(ing.name);
          const { baseAmount, baseType } = normalizeUnitAndAmount(ing.amount, ing.unit);

          if (!neededIngredients.has(key)) {
            neededIngredients.set(key, {
              displayName: ing.name,
              normalizedKey: key,
              totalBaseAmount: baseAmount,
              baseType,
              originalUnit: ing.unit,
              category: ing.category,
              recipeNames: new Set([recipe.name]),
            });
          } else {
            const existing = neededIngredients.get(key)!;
            existing.totalBaseAmount += baseAmount;
            existing.recipeNames.add(recipe.name);
          }
        });
      }
    });
  });

  // 2. Aggregate pantry by normalized key
  const pantryStock = new Map<string, { baseAmount: number; baseType: string }>();
  pantry.forEach(item => {
    const key = normalizeIngredientName(item.name);
    const { baseAmount, baseType } = normalizeUnitAndAmount(item.amount, item.unit);
    const current = pantryStock.get(key);
    if (!current) {
      pantryStock.set(key, { baseAmount, baseType });
    } else {
      current.baseAmount += baseAmount;
    }
  });

  // 3. Subtract pantry from needed ingredients
  const generatedItems: ShoppingItem[] = [];

  neededIngredients.forEach((need, key) => {
    const stock = pantryStock.get(key);
    const inPantryBase = stock ? stock.baseAmount : 0;
    const remainingToBuyBase = Math.max(0, need.totalBaseAmount - inPantryBase);

    // If remaining is greater than 0, user must buy it
    if (remainingToBuyBase > 0) {
      const friendlyBuy = formatFriendlyQuantity(remainingToBuyBase, need.baseType, need.originalUnit);
      const friendlyNeeded = formatFriendlyQuantity(need.totalBaseAmount, need.baseType, need.originalUnit);
      const friendlyPantry = formatFriendlyQuantity(inPantryBase, need.baseType, need.originalUnit);

      const itemId = `shop_${key}`;
      generatedItems.push({
        id: itemId,
        name: need.displayName,
        amountNeeded: friendlyNeeded.amount,
        amountInPantry: friendlyPantry.amount,
        toBuyAmount: friendlyBuy.amount,
        unit: friendlyBuy.unit,
        category: need.category,
        isBought: !!boughtMap[itemId],
        recipes: Array.from(need.recipeNames),
      });
    }
  });

  // 4. Merge custom shopping items (filtering out dismissed items and applying user edits)
  const combined: ShoppingItem[] = generatedItems
    .filter(item => !dismissedMap[item.id])
    .map(item => {
      const override = overridesMap[item.id];
      return override ? { ...item, ...override } : item;
    });

  customShoppingItems.forEach(customItem => {
    if (!dismissedMap[customItem.id]) {
      const override = overridesMap[customItem.id];
      combined.push({
        ...customItem,
        ...(override || {}),
        isBought: boughtMap[customItem.id] ?? customItem.isBought,
      });
    }
  });

  // Stable sort: by category, then by name
  return combined.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

// Calculate how many recipes can be made with current pantry
export function getCookWithPantryMatches(recipes: Recipe[], pantry: PantryItem[]) {
  const pantryStock = new Map<string, number>();
  pantry.forEach(item => {
    const key = normalizeIngredientName(item.name);
    const { baseAmount } = normalizeUnitAndAmount(item.amount, item.unit);
    pantryStock.set(key, (pantryStock.get(key) || 0) + baseAmount);
  });

  return recipes.map(recipe => {
    let availableCount = 0;
    const missingIngredients: string[] = [];
    const availableIngredients: string[] = [];

    recipe.ingredients.forEach(ing => {
      const key = normalizeIngredientName(ing.name);
      const { baseAmount } = normalizeUnitAndAmount(ing.amount, ing.unit);
      const stock = pantryStock.get(key) || 0;

      // Generous threshold: if user has >= 50% or has the item
      if (stock > 0) {
        availableCount++;
        availableIngredients.push(ing.name);
      } else {
        missingIngredients.push(ing.name);
      }
    });

    const matchPercent = Math.round((availableCount / recipe.ingredients.length) * 100);

    return {
      recipe,
      matchPercent,
      availableCount,
      totalCount: recipe.ingredients.length,
      availableIngredients,
      missingIngredients,
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);
}
