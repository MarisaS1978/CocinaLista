export type StandardProductCategory =
  | 'Verdulería'
  | 'Carnicería'
  | 'Almacén'
  | 'Lácteos'
  | 'Huevos'
  | 'Congelados'
  | 'Otros';

export type ProductCategory = StandardProductCategory | (string & {});

export interface PantryCategoryInfo {
  id: string;
  name: string;
  icon: string;
  desc?: string;
  isCustom?: boolean;
}

export interface RecipeCategoryInfo {
  id: string;
  name: string;
  icon: string;
  desc?: string;
  isCustom?: boolean;
}

export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type MealType = 'almuerzo' | 'cena';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string; // 'kg' | 'g' | 'unidades' | 'latas' | 'paquetes' | 'litros' | 'ml'
  category: ProductCategory;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  image?: string;
  timeMin: number;
  servings: number;
  difficulty: 'Fácil' | 'Media' | 'Avanzada';
  category: 'Carnes' | 'Pastas' | 'Guisos' | 'Tartas' | 'Ensaladas' | 'Pizzas' | 'Clásicos' | string;
  diet: 'balanceado' | 'carne' | 'vegetariano';
  tags: string[];
  ingredients: Ingredient[];
  instructions: string[];
  isCustom?: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: ProductCategory;
  expirationDate?: string; // YYYY-MM-DD
}

export interface MealSlot {
  recipeId?: string;
  customName?: string;
  customEmoji?: string;
  timeMin?: number;
}

export type WeeklyMenu = Record<DayOfWeek, {
  almuerzo: MealSlot | null;
  cena: MealSlot | null;
}>;

export interface ShoppingItem {
  id: string;
  name: string;
  amountNeeded: number;
  amountInPantry: number;
  toBuyAmount: number;
  unit: string;
  category: ProductCategory;
  isBought: boolean;
  isCustom?: boolean;
  recipes: string[];
}

export type ActiveTab = 'inicio' | 'menu' | 'compras' | 'despensa' | 'recetas';

export interface SmartMenuPreferences {
  servings: number;
  includeLunch: boolean;
  includeDinner: boolean;
  budget: 'economico' | 'medio' | 'libre';
  maxTime: number; // 20, 35, 60
  diet: 'todas' | 'vegetariana' | 'liviana';
  prioritizePantry: boolean;
}
