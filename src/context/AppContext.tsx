import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ActiveTab,
  WeeklyMenu,
  Recipe,
  PantryItem,
  ShoppingItem,
  DayOfWeek,
  MealType,
  MealSlot,
  ProductCategory,
  SmartMenuPreferences,
  RecipeCategoryInfo,
} from '../types';
import {
  INITIAL_RECIPES,
  INITIAL_PANTRY,
  INITIAL_WEEKLY_MENU,
} from '../data/initialData';
import {
  calculateShoppingList,
  getCookWithPantryMatches,
  normalizeIngredientName,
} from '../services/shoppingCalculator';
import { getRecipeImageUrl } from '../services/imageService';
import {
  STANDARD_RECIPE_CATEGORIES,
  suggestIconForRecipeCategory,
} from '../services/recipeCategories';
import {
  PantryCategoryInfo,
  DEFAULT_PANTRY_CATEGORIES,
  loadSavedCustomPantryCategories,
  saveCustomPantryCategories,
  suggestIconForPantryCategory,
} from '../services/pantryCategories';
import { decodeWeeklyMenuFromUrl } from '../services/shareMenuService';

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  weeklyMenu: WeeklyMenu;
  setWeeklyMeal: (day: DayOfWeek, mealType: MealType, slot: MealSlot | null) => void;
  clearWeeklyMenu: () => void;
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  pantry: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  updatePantryItem: (id: string, item: Partial<PantryItem>) => void;
  movePantryItemCategory: (id: string, newCategory: ProductCategory) => void;
  deletePantryItem: (id: string) => void;
  clearEntirePantry: () => void;
  customPantryCategories: PantryCategoryInfo[];
  allPantryCategories: PantryCategoryInfo[];
  isCreatePantryCategoryModalOpen: boolean;
  setIsCreatePantryCategoryModalOpen: (open: boolean) => void;
  addPantryCategory: (name: string, icon?: string, desc?: string) => boolean;
  deletePantryCategory: (name: string) => boolean;
  getPantryCategoryIcon: (name: string) => string;
  shoppingList: ShoppingItem[];
  toggleShoppingItemBought: (id: string) => void;
  addCustomShoppingItem: (name: string, amount: number, unit: string, category: PantryItem['category'], recipeOrigin?: string) => void;
  addRecipeIngredientsToShopping: (recipeName: string, ingredients: { name: string; amount: number; unit: string; category: PantryItem['category'] }[]) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  moveShoppingItemCategory: (id: string, newCategory: ProductCategory) => void;
  removeCustomShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearBoughtItems: (moveToPantry: boolean) => void;
  moveSingleShoppingItemToPantry: (id: string) => void;
  clearEntireShoppingList: () => void;
  restoreShoppingListFromMenu: () => void;
  hasDismissedShoppingItems: boolean;
  generateSmartMenu: (prefs: SmartMenuPreferences) => void;
  resetToDemoData: () => void;
  // Modals & UI triggers
  isSmartMenuModalOpen: boolean;
  setIsSmartMenuModalOpen: (open: boolean) => void;
  isCookWithPantryModalOpen: boolean;
  setIsCookWithPantryModalOpen: (open: boolean) => void;
  selectedRecipeDetail: Recipe | null;
  setSelectedRecipeDetail: (recipe: Recipe | null) => void;
  addMealTarget: { day: DayOfWeek; mealType: MealType } | null;
  setAddMealTarget: (target: { day: DayOfWeek; mealType: MealType } | null) => void;
  isAddPantryModalOpen: boolean;
  setIsAddPantryModalOpen: (open: boolean) => void;
  editingPantryItem: PantryItem | null;
  setEditingPantryItem: (item: PantryItem | null) => void;
  editingShoppingItem: ShoppingItem | null;
  setEditingShoppingItem: (item: ShoppingItem | null) => void;
  isAddShoppingModalOpen: boolean;
  setIsAddShoppingModalOpen: (open: boolean) => void;
  isAddRecipeModalOpen: boolean;
  setIsAddRecipeModalOpen: (open: boolean) => void;
  isImportRecipeModalOpen: boolean;
  setIsImportRecipeModalOpen: (open: boolean) => void;
  editingRecipe: Recipe | null;
  setEditingRecipe: (recipe: Recipe | null) => void;
  deletingRecipe: Recipe | null;
  setDeletingRecipe: (recipe: Recipe | null) => void;
  recipeToChangeCategory: Recipe | null;
  setRecipeToChangeCategory: (recipe: Recipe | null) => void;
  changeRecipeCategory: (id: string, newCategory: string) => void;
  newRecipeInitialCategory: string;
  setNewRecipeInitialCategory: (category: string) => void;
  openAddRecipeWithCategory: (category?: string) => void;
  customRecipeCategories: RecipeCategoryInfo[];
  allRecipeCategories: RecipeCategoryInfo[];
  isCreateRecipeCategoryModalOpen: boolean;
  setIsCreateRecipeCategoryModalOpen: (open: boolean) => void;
  addRecipeCategory: (name: string, icon?: string, desc?: string) => boolean;
  deleteRecipeCategory: (name: string) => boolean;
  getRecipeCategoryIcon: (name: string) => string;
  getRecipeMenuUsage: (recipeId: string) => string[];
  // Share weekly menu
  isShareMenuModalOpen: boolean;
  setIsShareMenuModalOpen: (open: boolean) => void;
  sharedMenuIncoming: WeeklyMenu | null;
  applySharedMenu: () => void;
  dismissSharedMenu: () => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  // Computed helpers
  pantryMatches: ReturnType<typeof getCookWithPantryMatches>;
  pendingShoppingCount: number;
  boughtShoppingCount: number;
  expiringItems: PantryItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MENU: 'menufacil_weekly_menu_v1',
  RECIPES: 'menufacil_recipes_v1',
  PANTRY: 'menufacil_pantry_v1',
  CUSTOM_SHOP: 'menufacil_custom_shop_v1',
  BOUGHT_MAP: 'menufacil_bought_map_v1',
  DISMISSED_SHOP: 'menufacil_dismissed_shop_v1',
  SHOP_OVERRIDES: 'menufacil_shop_overrides_v1',
  RECIPE_CATEGORIES: 'cocinafacil_recipe_categories_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');

  // Initialize state with localStorage fallbacks
  const [weeklyMenu, setWeeklyMenuState] = useState<WeeklyMenu>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_MENU;
    } catch {
      return INITIAL_WEEKLY_MENU;
    }
  });

  const [recipes, setRecipesState] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (saved) {
        const parsed: Recipe[] = JSON.parse(saved);
        return parsed.map(r => ({
          ...r,
          image: getRecipeImageUrl(r) || r.image,
        }));
      }
      return INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  });

  const [pantry, setPantryState] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PANTRY);
      return saved ? JSON.parse(saved) : INITIAL_PANTRY;
    } catch {
      return INITIAL_PANTRY;
    }
  });

  const [customShoppingItems, setCustomShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_SHOP);
      if (!saved) return [];
      const parsed: ShoppingItem[] = JSON.parse(saved);
      const seenIds = new Set<string>();
      return parsed.map((item, idx) => {
        if (!item.id || seenIds.has(item.id)) {
          const uniqueId = `custom_shop_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
          seenIds.add(uniqueId);
          return { ...item, id: uniqueId };
        }
        seenIds.add(item.id);
        return item;
      });
    } catch {
      return [];
    }
  });

  const [boughtMap, setBoughtMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOUGHT_MAP);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [dismissedShoppingIds, setDismissedShoppingIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISMISSED_SHOP);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [shoppingItemOverrides, setShoppingItemOverrides] = useState<Record<string, Partial<ShoppingItem>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOP_OVERRIDES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingShoppingItem, setEditingShoppingItem] = useState<ShoppingItem | null>(null);

  // UI state
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isSmartMenuModalOpen, setIsSmartMenuModalOpen] = useState(false);
  const [isCookWithPantryModalOpen, setIsCookWithPantryModalOpen] = useState(false);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [addMealTarget, setAddMealTarget] = useState<{ day: DayOfWeek; mealType: MealType } | null>(null);
  const [isAddPantryModalOpen, setIsAddPantryModalOpen] = useState(false);
  const [editingPantryItem, setEditingPantryItem] = useState<PantryItem | null>(null);
  const [isAddShoppingModalOpen, setIsAddShoppingModalOpen] = useState(false);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isImportRecipeModalOpen, setIsImportRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [recipeToChangeCategory, setRecipeToChangeCategory] = useState<Recipe | null>(null);
  const [newRecipeInitialCategory, setNewRecipeInitialCategory] = useState<string>('Tartas');
  const [customPantryCategories, setCustomPantryCategories] = useState<PantryCategoryInfo[]>(() =>
    loadSavedCustomPantryCategories()
  );
  const [isCreatePantryCategoryModalOpen, setIsCreatePantryCategoryModalOpen] = useState(false);

  const [customRecipeCategories, setCustomRecipeCategories] = useState<RecipeCategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPE_CATEGORIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreateRecipeCategoryModalOpen, setIsCreateRecipeCategoryModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPE_CATEGORIES, JSON.stringify(customRecipeCategories));
    } catch (e) {
      console.error('Error saving custom recipe categories:', e);
    }
  }, [customRecipeCategories]);
  const [isShareMenuModalOpen, setIsShareMenuModalOpen] = useState(false);
  const [sharedMenuIncoming, setSharedMenuIncoming] = useState<WeeklyMenu | null>(null);

  // Check URL query on initial load for incoming shared weekly menu
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const menuParam = params.get('menu');
      if (menuParam) {
        const decoded = decodeWeeklyMenuFromUrl(menuParam, recipes);
        if (decoded) {
          setSharedMenuIncoming(decoded);
        }
      }
    } catch (e) {
      console.error('Error checking incoming shared menu:', e);
    }
  }, [recipes]);

  const applySharedMenu = () => {
    if (!sharedMenuIncoming) return;
    setWeeklyMenuState(sharedMenuIncoming);
    setSharedMenuIncoming(null);
    try {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('menu');
      window.history.replaceState({}, '', cleanUrl.toString());
    } catch {}
    setActiveTab('menu');
    showToast('✨ Menú compartido aplicado a tu semana', 'success');
  };

  const dismissSharedMenu = () => {
    setSharedMenuIncoming(null);
    try {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('menu');
      window.history.replaceState({}, '', cleanUrl.toString());
    } catch {}
  };

  const allPantryCategories = useMemo(
    () => [...DEFAULT_PANTRY_CATEGORIES, ...customPantryCategories],
    [customPantryCategories]
  );

  useEffect(() => {
    saveCustomPantryCategories(customPantryCategories);
  }, [customPantryCategories]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(weeklyMenu));
  }, [weeklyMenu]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SHOP, JSON.stringify(customShoppingItems));
  }, [customShoppingItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOUGHT_MAP, JSON.stringify(boughtMap));
  }, [boughtMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_SHOP, JSON.stringify(dismissedShoppingIds));
  }, [dismissedShoppingIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOP_OVERRIDES, JSON.stringify(shoppingItemOverrides));
  }, [shoppingItemOverrides]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Derived shopping list using recalculation engine
  const shoppingList = useMemo(() => {
    return calculateShoppingList(
      weeklyMenu,
      recipes,
      pantry,
      customShoppingItems,
      boughtMap,
      dismissedShoppingIds,
      shoppingItemOverrides
    );
  }, [weeklyMenu, recipes, pantry, customShoppingItems, boughtMap, dismissedShoppingIds, shoppingItemOverrides]);

  const pendingShoppingCount = useMemo(() => {
    return shoppingList.filter(item => !item.isBought).length;
  }, [shoppingList]);

  const boughtShoppingCount = useMemo(() => {
    return shoppingList.filter(item => item.isBought).length;
  }, [shoppingList]);

  // Pantry matching recipes
  const pantryMatches = useMemo(() => {
    return getCookWithPantryMatches(recipes, pantry);
  }, [recipes, pantry]);

  // Expiring pantry items (next 3 days from current date)
  const expiringItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return pantry.filter(item => {
      if (!item.expirationDate) return false;
      const exp = new Date(item.expirationDate);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 4;
    });
  }, [pantry]);

  // Actions
  const setWeeklyMeal = (day: DayOfWeek, mealType: MealType, slot: MealSlot | null) => {
    setWeeklyMenuState(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: slot,
      },
    }));
    showToast(slot ? '✅ Menú actualizado' : 'Comida quitada del menú', 'success');
  };

  const clearWeeklyMenu = () => {
    const emptyMenu: WeeklyMenu = {
      lunes: { almuerzo: null, cena: null },
      martes: { almuerzo: null, cena: null },
      miercoles: { almuerzo: null, cena: null },
      jueves: { almuerzo: null, cena: null },
      viernes: { almuerzo: null, cena: null },
      sabado: { almuerzo: null, cena: null },
      domingo: { almuerzo: null, cena: null },
    };
    setWeeklyMenuState(emptyMenu);
    showToast('🧹 Menú semanal limpiado por completo', 'info');
  };

  const addRecipe = (newRecipeData: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...newRecipeData,
      id: `rec_custom_${Date.now()}`,
      isCustom: true,
      tags: Array.from(new Set([...(newRecipeData.tags || []), 'Mis recetas', 'Casero'])),
    };
    setRecipesState(prev => [newRecipe, ...prev]);
    showToast(`🍲 Nueva receta "${newRecipe.name}" guardada con éxito`, 'success');
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipesState(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
    setSelectedRecipeDetail(prev => (prev?.id === id ? { ...prev, ...updates } : prev));
    showToast('✅ Receta actualizada correctamente.', 'success');
  };

  const changeRecipeCategory = (id: string, newCategory: string) => {
    setRecipesState(prev =>
      prev.map(r => (r.id === id ? { ...r, category: newCategory } : r))
    );
    setSelectedRecipeDetail(prev => (prev?.id === id ? { ...prev, category: newCategory } : prev));
    showToast(`🏷️ Receta asignada al filtro "${newCategory}"`, 'success');
  };

  const openAddRecipeWithCategory = (category?: string) => {
    if (category && category !== 'Todas' && category !== 'Mis recetas' && category !== '⭐ Mis recetas') {
      setNewRecipeInitialCategory(category);
    }
    setIsAddRecipeModalOpen(true);
  };

  const deleteRecipe = (id: string) => {
    setRecipesState(prev => prev.filter(r => r.id !== id));

    // Remove from weekly menu if used
    setWeeklyMenuState(prev => {
      const nextMenu = { ...prev };
      let changed = false;
      (Object.keys(nextMenu) as DayOfWeek[]).forEach(day => {
        const slots = { ...nextMenu[day] };
        if (slots.almuerzo?.recipeId === id) {
          slots.almuerzo = null;
          changed = true;
        }
        if (slots.cena?.recipeId === id) {
          slots.cena = null;
          changed = true;
        }
        nextMenu[day] = slots;
      });
      return changed ? nextMenu : prev;
    });

    setSelectedRecipeDetail(prev => (prev?.id === id ? null : prev));
    showToast('🗑️ Receta eliminada.', 'info');
  };

  const getRecipeMenuUsage = (recipeId: string): string[] => {
    const days: string[] = [];
    const dayNames: Record<DayOfWeek, string> = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };
    (Object.keys(weeklyMenu) as DayOfWeek[]).forEach(day => {
      const d = weeklyMenu[day];
      if (d.almuerzo?.recipeId === recipeId) {
        days.push(`${dayNames[day]} (Almuerzo)`);
      }
      if (d.cena?.recipeId === recipeId) {
        days.push(`${dayNames[day]} (Cena)`);
      }
    });
    return days;
  };

  const addPantryItem = (itemData: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...itemData,
      id: `pantry_${Date.now()}`,
    };
    setPantryState(prev => [newItem, ...prev]);
    showToast(`🥕 ${newItem.name} agregado a la despensa`, 'success');
  };

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    setPantryState(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    setEditingPantryItem(prev => (prev?.id === id ? { ...prev, ...updates } : prev));
    showToast('✅ Despensa actualizada', 'success');
  };

  const movePantryItemCategory = (id: string, newCategory: ProductCategory) => {
    const item = pantry.find(p => p.id === id);
    if (!item) return;
    if (item.category === newCategory) return;
    setPantryState(prev =>
      prev.map(p => (p.id === id ? { ...p, category: newCategory } : p))
    );
    setEditingPantryItem(prev => (prev?.id === id ? { ...prev, category: newCategory } : prev));
    showToast(`📦 "${item.name}" movido a ${newCategory}`, 'success');
  };

  const deletePantryItem = (id: string) => {
    const item = pantry.find(p => p.id === id);
    setPantryState(prev => prev.filter(p => p.id !== id));
    showToast(item ? `🗑️ "${item.name}" eliminado de la despensa` : 'Producto eliminado de la despensa', 'info');
  };

  const clearEntirePantry = () => {
    setPantryState([]);
    showToast('🗑️ Se vació la despensa por completo', 'info');
  };

  const getPantryCategoryIcon = (categoryName: string): string => {
    const found = allPantryCategories.find(
      c => c.name.toLowerCase().trim() === (categoryName || '').toLowerCase().trim()
    );
    if (found) return found.icon;
    return suggestIconForPantryCategory(categoryName);
  };

  const addPantryCategory = (name: string, icon?: string, desc?: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('⚠️ Ingresá un nombre para la categoría', 'warning');
      return false;
    }

    const alreadyExists = allPantryCategories.some(
      c => c.name.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      showToast(`⚠️ La categoría "${trimmed}" ya existe`, 'warning');
      return false;
    }

    const chosenIcon = icon?.trim() || suggestIconForPantryCategory(trimmed);
    const newCat: PantryCategoryInfo = {
      id: trimmed,
      name: trimmed,
      icon: chosenIcon,
      desc: desc?.trim() || 'Categoría personalizada',
      isCustom: true,
    };

    setCustomPantryCategories(prev => [...prev, newCat]);
    showToast(`✨ Categoría "${trimmed}" creada con éxito`, 'success');
    return true;
  };

  const deletePantryCategory = (name: string): boolean => {
    const trimmed = name.trim();
    // Cannot delete standard categories
    const isStandard = DEFAULT_PANTRY_CATEGORIES.some(
      c => c.name.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (isStandard) {
      showToast('⚠️ Las categorías principales no se pueden eliminar', 'warning');
      return false;
    }

    // Reassign items with this category to 'Otros'
    setPantryState(prev =>
      prev.map(item =>
        item.category.toLowerCase().trim() === trimmed.toLowerCase()
          ? { ...item, category: 'Otros' }
          : item
      )
    );

    setCustomPantryCategories(prev =>
      prev.filter(c => c.name.toLowerCase().trim() !== trimmed.toLowerCase())
    );

    showToast(`🗑️ Categoría "${trimmed}" eliminada (sus productos pasaron a "Otros")`, 'info');
    return true;
  };

  const allRecipeCategories: RecipeCategoryInfo[] = useMemo(() => {
    const customNames = new Set(customRecipeCategories.map(c => c.name.toLowerCase().trim()));
    const filteredStandard = STANDARD_RECIPE_CATEGORIES.filter(
      sc => !customNames.has(sc.name.toLowerCase().trim())
    );
    return [...filteredStandard, ...customRecipeCategories];
  }, [customRecipeCategories]);

  const getRecipeCategoryIcon = (categoryName: string): string => {
    const found = allRecipeCategories.find(
      c => c.name.toLowerCase().trim() === (categoryName || '').toLowerCase().trim()
    );
    if (found?.icon) return found.icon;
    return suggestIconForRecipeCategory(categoryName);
  };

  const addRecipeCategory = (name: string, icon?: string, desc?: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('⚠️ Ingresá un nombre para la categoría', 'warning');
      return false;
    }

    const alreadyExists = allRecipeCategories.some(
      c => c.name.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      showToast(`⚠️ La categoría de recetas "${trimmed}" ya existe`, 'warning');
      return false;
    }

    const chosenIcon = icon?.trim() || suggestIconForRecipeCategory(trimmed);
    const newCat: RecipeCategoryInfo = {
      id: `rcat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      icon: chosenIcon,
      desc: desc?.trim() || 'Categoría de recetas personalizada',
      isCustom: true,
    };

    setCustomRecipeCategories(prev => [...prev, newCat]);
    showToast(`✨ Categoría de recetas "${trimmed}" creada con éxito`, 'success');
    return true;
  };

  const deleteRecipeCategory = (name: string): boolean => {
    const trimmed = name.trim();
    const isStandard = STANDARD_RECIPE_CATEGORIES.some(
      c => c.name.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (isStandard) {
      showToast('⚠️ Las categorías principales no se pueden eliminar', 'warning');
      return false;
    }

    setRecipesState(prev =>
      prev.map(r =>
        r.category.toLowerCase().trim() === trimmed.toLowerCase()
          ? { ...r, category: 'Clásicos' }
          : r
      )
    );

    setCustomRecipeCategories(prev =>
      prev.filter(c => c.name.toLowerCase().trim() !== trimmed.toLowerCase())
    );

    showToast(`🗑️ Categoría "${trimmed}" eliminada (sus recetas pasaron a "Clásicos")`, 'info');
    return true;
  };

  const toggleShoppingItemBought = (id: string) => {
    setBoughtMap(prev => {
      const nextVal = !prev[id];
      return { ...prev, [id]: nextVal };
    });
  };

  const addCustomShoppingItem = (
    name: string,
    amount: number,
    unit: string,
    category: PantryItem['category'],
    recipeOrigin?: string
  ) => {
    const uniqueId = `custom_shop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newItem: ShoppingItem = {
      id: uniqueId,
      name,
      amountNeeded: amount,
      amountInPantry: 0,
      toBuyAmount: amount,
      unit,
      category,
      isBought: false,
      isCustom: true,
      recipes: [recipeOrigin || 'Agregado manual'],
    };
    setCustomShoppingItems(prev => [newItem, ...prev]);
    showToast(`🛒 Se agregó "${name}" a tu lista`, 'success');
  };

  const addRecipeIngredientsToShopping = (
    recipeName: string,
    ingredients: { name: string; amount: number; unit: string; category: PantryItem['category'] }[]
  ) => {
    if (!ingredients.length) return;
    const now = Date.now();
    const newItems: ShoppingItem[] = ingredients.map((ing, idx) => ({
      id: `custom_shop_${now}_${idx}_${Math.random().toString(36).slice(2, 8)}`,
      name: ing.name,
      amountNeeded: ing.amount,
      amountInPantry: 0,
      toBuyAmount: ing.amount,
      unit: ing.unit,
      category: ing.category,
      isBought: false,
      isCustom: true,
      recipes: [recipeName],
    }));

    setCustomShoppingItems(prev => [...newItems, ...prev]);
    showToast(`🛒 Se agregaron ${newItems.length} ingredientes de "${recipeName}" a la lista`, 'success');
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    // 1. If it exists in customShoppingItems, update directly
    setCustomShoppingItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    // 2. Also record in shoppingItemOverrides for persistent updates across all items
    setShoppingItemOverrides(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates },
    }));
    showToast('✏️ Producto de compra actualizado', 'success');
  };

  const moveShoppingItemCategory = (id: string, newCategory: ProductCategory) => {
    updateShoppingItem(id, { category: newCategory });
    showToast(`📁 Movido a ${newCategory}`, 'info');
  };

  const removeShoppingItem = (id: string) => {
    // 1. Remove from custom shopping items if it was added manually or via recipe
    setCustomShoppingItems(prev => prev.filter(item => item.id !== id));
    // 2. Mark as dismissed in case it was generated from the weekly menu
    setDismissedShoppingIds(prev => ({ ...prev, [id]: true }));
    // 3. Clean from overrides
    setShoppingItemOverrides(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // 4. Clean from bought map
    setBoughtMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const removeCustomShoppingItem = (id: string) => {
    removeShoppingItem(id);
  };

  const clearBoughtItems = (moveToPantry: boolean) => {
    const boughtItems = shoppingList.filter(item => item.isBought);
    if (boughtItems.length === 0) return;

    if (moveToPantry) {
      // Transfer to pantry
      const newPantryItems = [...pantry];
      boughtItems.forEach(b => {
        const normKey = normalizeIngredientName(b.name);
        const existingIdx = newPantryItems.findIndex(
          p => normalizeIngredientName(p.name) === normKey
        );
        if (existingIdx >= 0) {
          // Increase amount
          newPantryItems[existingIdx] = {
            ...newPantryItems[existingIdx],
            amount: newPantryItems[existingIdx].amount + b.toBuyAmount,
          };
        } else {
          // Add new item
          newPantryItems.push({
            id: `pantry_from_shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: b.name,
            amount: b.toBuyAmount,
            unit: b.unit,
            category: b.category,
          });
        }
      });
      setPantryState(newPantryItems);
      showToast(`🥕 Se pasaron ${boughtItems.length} productos a tu despensa`, 'success');
    } else {
      showToast(`Se limpiaron ${boughtItems.length} productos comprados`, 'info');
    }

    // Reset bought state
    setBoughtMap(prev => {
      const next = { ...prev };
      boughtItems.forEach(b => {
        delete next[b.id];
      });
      return next;
    });

    // Remove bought custom items
    setCustomShoppingItems(prev => prev.filter(item => !boughtMap[item.id]));
  };

  const moveSingleShoppingItemToPantry = (id: string) => {
    const item = shoppingList.find(i => i.id === id);
    if (!item) return;

    const newPantryItems = [...pantry];
    const normKey = normalizeIngredientName(item.name);
    const existingIdx = newPantryItems.findIndex(
      p => normalizeIngredientName(p.name) === normKey
    );
    if (existingIdx >= 0) {
      newPantryItems[existingIdx] = {
        ...newPantryItems[existingIdx],
        amount: Math.round((newPantryItems[existingIdx].amount + item.toBuyAmount) * 10) / 10,
      };
    } else {
      newPantryItems.push({
        id: `pantry_from_shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        amount: item.toBuyAmount,
        unit: item.unit,
        category: item.category,
      });
    }
    setPantryState(newPantryItems);

    // Clean bought map
    setBoughtMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // If custom, remove it
    setCustomShoppingItems(prev => prev.filter(c => c.id !== id));

    showToast(`🥕 "${item.name}" agregado a tu despensa`, 'success');
  };

  const clearEntireShoppingList = () => {
    // Collect all current shopping list item IDs and mark them dismissed
    const allIds: Record<string, boolean> = { ...dismissedShoppingIds };
    shoppingList.forEach(item => {
      allIds[item.id] = true;
    });
    setDismissedShoppingIds(allIds);
    setCustomShoppingItems([]);
    setShoppingItemOverrides({});
    setBoughtMap({});
    showToast('🗑️ Se vació la lista de compras completamente', 'info');
  };

  const restoreShoppingListFromMenu = () => {
    setDismissedShoppingIds({});
    showToast('🔄 Lista de compras recalculada a partir del menú semanal', 'success');
  };

  const hasDismissedShoppingItems = Object.keys(dismissedShoppingIds).length > 0;

  // Smart weekly menu planner generator
  const generateSmartMenu = (prefs: SmartMenuPreferences) => {
    let pool = [...recipes];

    // Filter by diet
    if (prefs.diet === 'vegetariana') {
      pool = pool.filter(r => r.diet === 'vegetariano');
    } else if (prefs.diet === 'liviana') {
      pool = pool.filter(r => r.tags.includes('Liviano') || r.tags.includes('Fresco') || r.category === 'Ensaladas');
    }

    // Filter by time if constrained
    if (prefs.maxTime && prefs.maxTime <= 30) {
      pool = pool.filter(r => r.timeMin <= 35);
    }

    if (pool.length === 0) {
      pool = [...recipes];
    }

    // Score recipes: prioritize pantry availability if toggled
    const scored = pool.map(recipe => {
      const match = pantryMatches.find(m => m.recipe.id === recipe.id);
      const pantryScore = prefs.prioritizePantry ? (match?.matchPercent || 0) : 0;
      return {
        recipe,
        score: pantryScore + Math.random() * 20, // add subtle variety
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const days: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const newMenu: WeeklyMenu = {
      lunes: { almuerzo: null, cena: null },
      martes: { almuerzo: null, cena: null },
      miercoles: { almuerzo: null, cena: null },
      jueves: { almuerzo: null, cena: null },
      viernes: { almuerzo: null, cena: null },
      sabado: { almuerzo: null, cena: null },
      domingo: { almuerzo: null, cena: null },
    };

    let idx = 0;
    days.forEach(day => {
      if (prefs.includeLunch) {
        const r = scored[idx % scored.length].recipe;
        newMenu[day].almuerzo = { recipeId: r.id };
        idx++;
      }
      if (prefs.includeDinner) {
        const r = scored[idx % scored.length].recipe;
        newMenu[day].cena = { recipeId: r.id };
        idx++;
      }
    });

    setWeeklyMenuState(newMenu);
    setIsSmartMenuModalOpen(false);
    showToast('✨ ¡Menú semanal equilibrado generado con éxito!', 'success');
  };

  const resetToDemoData = () => {
    setWeeklyMenuState(INITIAL_WEEKLY_MENU);
    setRecipesState(INITIAL_RECIPES);
    setPantryState(INITIAL_PANTRY);
    setCustomShoppingItems([]);
    setShoppingItemOverrides({});
    setBoughtMap({});
    showToast('Datos de demostración restablecidos', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        weeklyMenu,
        setWeeklyMeal,
        clearWeeklyMenu,
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        pantry,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        clearEntirePantry,
        customPantryCategories,
        allPantryCategories,
        isCreatePantryCategoryModalOpen,
        setIsCreatePantryCategoryModalOpen,
        addPantryCategory,
        deletePantryCategory,
        getPantryCategoryIcon,
        shoppingList,
        toggleShoppingItemBought,
        addCustomShoppingItem,
        addRecipeIngredientsToShopping,
        updateShoppingItem,
        moveShoppingItemCategory,
        removeCustomShoppingItem,
        removeShoppingItem,
        clearBoughtItems,
        moveSingleShoppingItemToPantry,
        clearEntireShoppingList,
        restoreShoppingListFromMenu,
        hasDismissedShoppingItems,
        generateSmartMenu,
        resetToDemoData,
        isSmartMenuModalOpen,
        setIsSmartMenuModalOpen,
        isCookWithPantryModalOpen,
        setIsCookWithPantryModalOpen,
        selectedRecipeDetail,
        setSelectedRecipeDetail,
        addMealTarget,
        setAddMealTarget,
        isAddPantryModalOpen,
        setIsAddPantryModalOpen,
        editingPantryItem,
        setEditingPantryItem,
        editingShoppingItem,
        setEditingShoppingItem,
        movePantryItemCategory,
        isAddShoppingModalOpen,
        setIsAddShoppingModalOpen,
        isAddRecipeModalOpen,
        setIsAddRecipeModalOpen,
        isImportRecipeModalOpen,
        setIsImportRecipeModalOpen,
        editingRecipe,
        setEditingRecipe,
        deletingRecipe,
        setDeletingRecipe,
        recipeToChangeCategory,
        setRecipeToChangeCategory,
        changeRecipeCategory,
        newRecipeInitialCategory,
        setNewRecipeInitialCategory,
        openAddRecipeWithCategory,
        customRecipeCategories,
        allRecipeCategories,
        isCreateRecipeCategoryModalOpen,
        setIsCreateRecipeCategoryModalOpen,
        addRecipeCategory,
        deleteRecipeCategory,
        getRecipeCategoryIcon,
        getRecipeMenuUsage,
        isShareMenuModalOpen,
        setIsShareMenuModalOpen,
        sharedMenuIncoming,
        applySharedMenu,
        dismissSharedMenu,
        toast,
        showToast,
        pantryMatches,
        pendingShoppingCount,
        boughtShoppingCount,
        expiringItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
