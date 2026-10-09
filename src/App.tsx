/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/Navigation';
import { Toast } from './components/Toast';
import { SmartMenuModal } from './components/SmartMenuModal';
import { CookWithPantryModal } from './components/CookWithPantryModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AddMealModal } from './components/AddMealModal';
import { AddPantryModal } from './components/AddPantryModal';
import { EditPantryModal } from './components/EditPantryModal';
import { AddShoppingItemModal } from './components/AddShoppingItemModal';
import { EditShoppingItemModal } from './components/EditShoppingItemModal';
import { AddRecipeModal } from './components/AddRecipeModal';
import { EditRecipeModal } from './components/EditRecipeModal';
import { DeleteRecipeConfirmModal } from './components/DeleteRecipeConfirmModal';
import { ChangeRecipeCategoryModal } from './components/ChangeRecipeCategoryModal';
import { CreatePantryCategoryModal } from './components/CreatePantryCategoryModal';
import { CreateRecipeCategoryModal } from './components/CreateRecipeCategoryModal';
import { ShareMenuModal } from './components/ShareMenuModal';
import { ImportRecipeModal } from './components/ImportRecipeModal';

import { HomeView } from './views/HomeView';
import { WeeklyMenuView } from './views/WeeklyMenuView';
import { ShoppingListView } from './views/ShoppingListView';
import { PantryView } from './views/PantryView';
import { RecipesView } from './views/RecipesView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#263238]">
      {/* Toast notifications */}
      <Toast />

      {/* Top Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-12">
        {activeTab === 'inicio' && <HomeView />}
        {activeTab === 'menu' && <WeeklyMenuView />}
        {activeTab === 'compras' && <ShoppingListView />}
        {activeTab === 'despensa' && <PantryView />}
        {activeTab === 'recetas' && <RecipesView />}
      </main>

      {/* App Footer */}
      <footer className="py-8 px-4 border-t border-[#263238]/8 text-center text-xs text-[#263238]/60 mb-16 md:mb-0 bg-white/40">
        <div className="max-w-xl mx-auto space-y-1.5">
          <p className="font-bold text-[#263238]/85 text-xs sm:text-sm">
            Cocina Lista — Planificá tus comidas. Nosotros armamos tu lista.
          </p>
          <p className="text-xs font-semibold text-[#263238]/75">
            Esta app fue desarrollada bajo una idea de <span className="text-[#39B54A] font-bold">Marisa Sandroni</span>.
          </p>
          <p className="text-[11px] text-[#263238]/50">
            Hecho para cocinar rico, ahorrar tiempo y evitar el desperdicio de comida.
          </p>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNavigation />

      {/* Interactive Modals */}
      <SmartMenuModal />
      <CookWithPantryModal />
      <RecipeDetailModal />
      <AddMealModal />
      <AddPantryModal />
      <EditPantryModal />
      <AddShoppingItemModal />
      <EditShoppingItemModal />
      <AddRecipeModal />
      <EditRecipeModal />
      <DeleteRecipeConfirmModal />
      <ChangeRecipeCategoryModal />
      <CreatePantryCategoryModal />
      <CreateRecipeCategoryModal />
      <ShareMenuModal />
      <ImportRecipeModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
