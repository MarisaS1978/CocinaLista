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
import { SecurityComplianceModal } from './components/SecurityComplianceModal';
import { SecurityLockScreen } from './components/SecurityLockScreen';
import { loadSecuritySettings, recordAuditLog } from './services/securityService';

import { HomeView } from './views/HomeView';
import { WeeklyMenuView } from './views/WeeklyMenuView';
import { ShoppingListView } from './views/ShoppingListView';
import { PantryView } from './views/PantryView';
import { RecipesView } from './views/RecipesView';

const MainContent: React.FC = () => {
  const { activeTab, isSecurityModalOpen, setIsSecurityModalOpen } = useApp();
  const [isLocked, setIsLocked] = React.useState<boolean>(() => {
    const s = loadSecuritySettings();
    return Boolean(s.biometricOrPinLockEnabled && s.pinHash);
  });

  // ISO 27001 A.5.15 Inactivity Auto-Lock
  React.useEffect(() => {
    const s = loadSecuritySettings();
    if (!s.biometricOrPinLockEnabled || !s.pinHash || !s.autoLockMinutes || s.autoLockMinutes <= 0) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLocked(true);
        recordAuditLog('BLOQUEO_INACTIVIDAD', 'CONTROL_ACCESO', `Sesión bloqueada automáticamente tras ${s.autoLockMinutes} minutos de inactividad`);
      }, s.autoLockMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [isLocked]);

  if (isLocked) {
    return <SecurityLockScreen onUnlock={() => setIsLocked(false)} />;
  }

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
        <div className="max-w-xl mx-auto space-y-2">
          <p className="font-bold text-[#263238]/85 text-xs sm:text-sm">
            Cocina Lista — Planificá tus comidas. Nosotros armamos tu lista.
          </p>
          <p className="text-xs font-semibold text-[#263238]/75">
            Esta app fue desarrollada bajo una idea de <span className="text-[#39B54A] font-bold">Marisa Sandroni</span>.
          </p>

          {/* Security & Compliance Badges in Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-[#1e6328] font-bold border border-emerald-500/25 transition-colors cursor-pointer shadow-2xs"
            >
              <span>🛡️ SOC 2 Type II Compliant</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-[#1e40af] font-bold border border-blue-500/25 transition-colors cursor-pointer shadow-2xs"
            >
              <span>🔒 ISO/IEC 27001:2022 ISMS</span>
            </button>
            <span className="text-[#263238]/50">
              Cifrado en tránsito y reposo local
            </span>
          </div>

          <p className="text-[11px] text-[#263238]/50 pt-1">
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
      <SecurityComplianceModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
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
