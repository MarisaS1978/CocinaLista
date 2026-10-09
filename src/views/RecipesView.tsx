import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import {
  Clock,
  Users,
  Search,
  Plus,
  CalendarPlus,
  ShoppingCart,
  Sparkles,
  MoreVertical,
  Edit3,
  Trash2,
  Tag,
  FileUp,
  FolderPlus,
} from 'lucide-react';
import { normalizeIngredientName } from '../services/shoppingCalculator';
import { getRecipeImageUrl } from '../services/imageService';
import { RecipeVisual } from '../components/RecipeVisual';
import {
  STANDARD_CATEGORIES,
  matchRecipeCategory,
  getCategoryIcon,
} from '../services/recipeCategories';

export const RecipesView: React.FC = () => {
  const {
    recipes,
    pantry,
    setSelectedRecipeDetail,
    pantryMatches,
    addCustomShoppingItem,
    addRecipeIngredientsToShopping,
    setIsAddRecipeModalOpen,
    setIsImportRecipeModalOpen,
    setEditingRecipe,
    setDeletingRecipe,
    setRecipeToChangeCategory,
    openAddRecipeWithCategory,
    customRecipeCategories,
    allRecipeCategories,
    setIsCreateRecipeCategoryModalOpen,
    deleteRecipeCategory,
    getRecipeCategoryIcon,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [filterOnlyReady, setFilterOnlyReady] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [recipeCategoryToDelete, setRecipeCategoryToDelete] = useState<string | null>(null);

  const normalizeText = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const isUserRecipe = (r: Recipe) =>
    Boolean(
      r.isCustom ||
      r.id.startsWith('rec_custom_') ||
      r.tags?.some(t => normalizeText(t).includes('mis receta'))
    );

  const isMisRecetasCategory = (c: string) => c === 'Mis recetas' || c === '⭐ Mis recetas';

  const customRecipesCount = recipes.filter(isUserRecipe).length;

  const standardCategories = ['Tartas', 'Carnes', 'Pastas', 'Guisos', 'Ensaladas', 'Pizzas', 'Clásicos'];
  const customCatNames = customRecipeCategories.map(c => c.name);
  const otherCategories = Array.from(
    new Set(
      recipes
        .map(r => r.category)
        .filter(
          c =>
            c &&
            !standardCategories.some(sc => matchRecipeCategory(c, sc)) &&
            !customCatNames.some(cc => cc.toLowerCase().trim() === c.toLowerCase().trim())
        )
    )
  );

  const categories = [
    'Todas',
    ...(customRecipesCount > 0 ? ['Mis recetas'] : []),
    ...standardCategories,
    ...customCatNames,
    ...otherCategories,
  ];

  const pantryKeySet = new Set(pantry.map(p => normalizeIngredientName(p.name)));
  const cleanSearch = normalizeText(searchTerm);

  const filteredRecipes = recipes.filter(r => {
    // 1. Category match
    let matchesCat = false;
    if (selectedCategory === 'Todas') {
      matchesCat = true;
    } else if (isMisRecetasCategory(selectedCategory)) {
      matchesCat = isUserRecipe(r);
    } else {
      matchesCat = matchRecipeCategory(r.category, selectedCategory);
      // Smart fallback: if this is a user recipe and category wasn't set or left default,
      // also check if the recipe name or tags mention this category (e.g. "Tarta de choclo" matching "Tartas")
      if (!matchesCat && isUserRecipe(r)) {
        const normName = normalizeText(r.name);
        const normFilter = normalizeText(selectedCategory);
        const singularFilter = normFilter.endsWith('s') ? normFilter.slice(0, -1) : normFilter;
        if (normName.includes(singularFilter) || normName.includes(normFilter)) {
          matchesCat = true;
        }
      }
    }

    if (!matchesCat) return false;

    // 2. Comprehensive normalized search
    if (cleanSearch) {
      const normName = normalizeText(r.name);
      const normCat = normalizeText(r.category);
      const normDiet = normalizeText(r.diet || '');
      const normTags = (r.tags || []).map(normalizeText).join(' ');
      const normIngs = r.ingredients.map(i => normalizeText(i.name)).join(' ');

      const searchHit =
        normName.includes(cleanSearch) ||
        normCat.includes(cleanSearch) ||
        normDiet.includes(cleanSearch) ||
        normTags.includes(cleanSearch) ||
        normIngs.includes(cleanSearch) ||
        (cleanSearch.includes('nueva') ||
         cleanSearch.includes('mia') ||
         cleanSearch.includes('creada') ||
         cleanSearch.includes('agregada')
          ? isUserRecipe(r)
          : false);

      if (!searchHit) return false;
    }

    // 3. Pantry readiness filter
    if (filterOnlyReady) {
      const match = pantryMatches.find(m => m.recipe.id === r.id);
      const percent = match?.matchPercent || 0;
      // Allow lower threshold or custom recipe visibility
      return percent >= 50;
    }

    return true;
  });

  const handleQuickAddToShopping = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    const missing = recipe.ingredients.filter(
      ing => !pantryKeySet.has(normalizeIngredientName(ing.name))
    );
    if (missing.length > 0) {
      addRecipeIngredientsToShopping(
        recipe.name,
        missing.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        }))
      );
    } else {
      showToast(`¡Ya tenés todos los ingredientes de "${recipe.name}" en tu despensa!`, 'info');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#263238]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#4D96FF] uppercase tracking-wider">
            Biblioteca de cocina
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">
            Recetas caseras
          </h1>
          <p className="text-xs sm:text-sm text-[#263238]/70 mt-1">
            Platos cotidianos con ingredientes reales para planificar tu semana.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filter for pantry readiness */}
          <button
            onClick={() => setFilterOnlyReady(!filterOnlyReady)}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterOnlyReady
                ? 'bg-[#39B54A] text-white border-[#39B54A] shadow-xs'
                : 'bg-[#FFFDF7] text-[#263238] border-[#263238]/15 hover:border-[#39B54A]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FFD447]" />
            <span>Solo con despensa</span>
          </button>

          {/* Import recipe button */}
          <button
            onClick={() => setIsImportRecipeModalOpen(true)}
            title="Importar receta desde PDF o enlace web"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#4D96FF]/40 text-[#2563EB] hover:bg-[#4D96FF]/10 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <FileUp className="w-4 h-4 text-[#4D96FF]" />
            <span>Importar</span>
          </button>

          {/* New category button */}
          <button
            onClick={() => setIsCreateRecipeCategoryModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/20 hover:border-[#39B54A] text-[#263238] text-xs font-bold transition-all cursor-pointer hover:bg-slate-50 shadow-2xs"
            title="Crear una nueva categoría para organizar recetas"
          >
            <FolderPlus className="w-4 h-4 text-[#39B54A]" />
            <span>Nueva categoría</span>
          </button>

          {/* New recipe button */}
          <button
            onClick={() => setIsAddRecipeModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Nueva receta</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            {categories.map(cat => {
              let count = 0;
              if (cat === 'Todas') {
                count = recipes.length;
              } else if (isMisRecetasCategory(cat)) {
                count = customRecipesCount;
              } else {
                count = recipes.filter(r => {
                  if (matchRecipeCategory(r.category, cat)) return true;
                  if (isUserRecipe(r)) {
                    const normName = normalizeText(r.name);
                    const normCat = normalizeText(cat);
                    const singularCat = normCat.endsWith('s') ? normCat.slice(0, -1) : normCat;
                    return normName.includes(singularCat) || normName.includes(normCat);
                  }
                  return false;
                }).length;
              }

              const isSelected = isMisRecetasCategory(selectedCategory)
                ? isMisRecetasCategory(cat)
                : selectedCategory === cat;
              const catIcon =
                cat === 'Todas' ? '🍽️' : isMisRecetasCategory(cat) ? '⭐' : getRecipeCategoryIcon(cat);
              const labelText = cat.replace(/[⭐★]/g, '').trim();

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#263238] text-white shadow-xs'
                      : 'bg-white border border-[#263238]/10 text-[#263238]/70 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{catIcon}</span>
                  <span>{labelText}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-[#263238]/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick button to add new category directly from tab strip */}
            <button
              type="button"
              onClick={() => setIsCreateRecipeCategoryModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#39B54A] bg-[#39B54A]/10 hover:bg-[#39B54A]/20 border border-[#39B54A]/25 transition-colors cursor-pointer"
              title="Crear una nueva categoría de recetas"
            >
              <span>Nueva categoría</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#263238]/40" />
            <input
              type="text"
              placeholder="Buscar por receta, ingrediente o etiqueta..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-[#263238]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#263238]/40 hover:text-[#263238] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Helper Banner if filterOnlyReady is on */}
        {filterOnlyReady && (
          <div className="p-2.5 rounded-xl bg-[#39B54A]/10 border border-[#39B54A]/30 flex items-center justify-between text-xs text-[#1e6328]">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD447]" />
              Filtrando recetas con ingredientes disponibles en tu despensa.
            </span>
            <button
              type="button"
              onClick={() => setFilterOnlyReady(false)}
              className="font-bold underline text-xs cursor-pointer hover:text-[#263238]"
            >
              Desactivar filtro
            </button>
          </div>
        )}

        {/* Category Context Banner */}
        {selectedCategory !== 'Todas' && !isMisRecetasCategory(selectedCategory) && (() => {
          const customCat = customRecipeCategories.find(
            c => c.name.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
          );

          return (
            <div className="p-3 bg-white rounded-2xl border border-[#263238]/10 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-1.5 bg-[#FFFDF7] rounded-xl border border-[#263238]/10 shadow-xs">
                  {getRecipeCategoryIcon(selectedCategory)}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xs sm:text-sm font-bold text-[#263238]">
                      Filtro: {selectedCategory}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#39B54A]/15 text-[#1e6328]">
                      {filteredRecipes.length} receta{filteredRecipes.length !== 1 ? 's' : ''}
                    </span>
                    {customCat && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD447]/25 text-[#735100]">
                        Categoría propia
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#263238]/70 mt-0.5">
                    {customCat?.desc
                      ? customCat.desc
                      : `Mostrando recetas bajo la opción ${selectedCategory}.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => openAddRecipeWithCategory(selectedCategory)}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title={`Agregar nueva receta que aparezca bajo ${selectedCategory}`}
                >
                  <span>Sumar receta acá</span>
                </button>

                {customCat && (
                  <button
                    type="button"
                    onClick={() => setRecipeCategoryToDelete(customCat.name)}
                    className="px-2.5 py-1.5 rounded-xl bg-red-50 text-[#FF5C5C] hover:bg-red-100 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                    title="Eliminar esta categoría de recetas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar categoría</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Recipes Grid or Empty State */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#263238]/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD447]/20 text-3xl flex items-center justify-center mx-auto">
            🍲
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#263238]">
              No se encontraron recetas con los filtros actuales
            </h3>
            <p className="text-xs text-[#263238]/60 mt-1">
              {cleanSearch && `Búsqueda: "${searchTerm}" · `}
              {selectedCategory !== 'Todas' && `Categoría: "${selectedCategory}" · `}
              {filterOnlyReady && 'Solo con despensa: Activado'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todas');
                setFilterOnlyReady(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#39B54A] text-white text-xs font-bold hover:bg-[#329e41] shadow-xs cursor-pointer transition-colors"
            >
              Mostrar todas las recetas
            </button>
            {customRecipesCount > 0 && !isMisRecetasCategory(selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Mis recetas');
                  setFilterOnlyReady(false);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#4D96FF] text-[#2563EB] text-xs font-bold hover:bg-[#4D96FF]/10 cursor-pointer transition-colors"
              >
                Ver mis recetas agregadas ({customRecipesCount})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRecipes.map(recipe => {
            const match = pantryMatches.find(m => m.recipe.id === recipe.id);
            const matchPercent = match?.matchPercent || 0;
            const isCustom = isUserRecipe(recipe);

          return (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipeDetail(recipe)}
              className="bg-white rounded-3xl border border-[#263238]/10 overflow-hidden shadow-xs hover:border-[#39B54A]/60 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              {/* Visual header with pastel illustration */}
              <div className="relative">
                <RecipeVisual
                  name={recipe.name}
                  emoji={recipe.emoji}
                  category={recipe.category}
                  size="card"
                  showCategoryBadge={true}
                />

                {/* Match indicator */}
                {matchPercent >= 70 && (
                  <div className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#2b8838] shadow-xs border border-black/5">
                    {matchPercent}% en despensa
                  </div>
                )}

                {/* Card Actions Menu ⋮ */}
                <div className="absolute top-2.5 right-2.5 z-30">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === recipe.id ? null : recipe.id);
                    }}
                    title="Opciones de receta"
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#263238] shadow-xs flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-[#263238]/10 hover:border-[#39B54A]"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {openMenuId === recipe.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-8 z-50 bg-white rounded-2xl shadow-xl border border-[#263238]/10 py-1.5 w-48 text-xs animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setEditingRecipe(recipe);
                          }}
                          className="w-full px-3.5 py-2 text-left font-semibold text-[#263238] hover:bg-[#FFFDF7] hover:text-[#39B54A] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#39B54A]" />
                          <span>Editar receta</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setRecipeToChangeCategory(recipe);
                          }}
                          className="w-full px-3.5 py-2 text-left font-semibold text-[#263238] hover:bg-[#FFFDF7] hover:text-[#4D96FF] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Tag className="w-3.5 h-3.5 text-[#4D96FF]" />
                          <span>Asignar categoría ({recipe.category || 'Tartas'})</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setDeletingRecipe(recipe);
                          }}
                          className="w-full px-3.5 py-2 text-left font-semibold text-[#FF5C5C] hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#FF5C5C]" />
                          <span>Eliminar receta</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#263238] group-hover:text-[#39B54A] transition-colors leading-snug">
                    {recipe.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecipeToChangeCategory(recipe);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFFDF7] hover:bg-[#39B54A]/10 text-[#263238]/80 hover:text-[#1e6328] border border-[#263238]/15 hover:border-[#39B54A]/40 transition-colors cursor-pointer"
                      title="Tocar para cambiar la opción de filtrado de esta receta"
                    >
                      <span>{getCategoryIcon(recipe.category)}</span>
                      <span>{recipe.category}</span>
                    </button>

                    {isCustom && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4D96FF]/15 text-[#2563EB] border border-[#4D96FF]/30">
                        Creada por vos
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#263238]/60 mt-1.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#FF8A3D]" />
                      {recipe.timeMin} min
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#4D96FF]" />
                      {recipe.servings} porc.
                    </span>
                    <span>·</span>
                    <span className="font-medium text-[#263238]/70">Dificultad: {recipe.difficulty}</span>
                  </div>

                  {/* Main ingredients summary */}
                  <p className="text-xs text-[#263238]/70 mt-2.5 line-clamp-2 leading-relaxed">
                    <strong className="text-[#263238] font-semibold">Ingredientes: </strong>
                    {recipe.ingredients.map(i => i.name).slice(0, 4).join(', ')}
                    {recipe.ingredients.length > 4 ? '...' : ''}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="pt-3 mt-3 border-t border-[#263238]/6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={e => handleQuickAddToShopping(e, recipe)}
                    title="Agregar ingredientes faltantes a compras"
                    className="flex-1 py-1.5 px-2 rounded-xl border border-[#FF8A3D]/40 text-[#FF8A3D] hover:bg-[#FF8A3D]/10 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>A compras</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRecipeDetail(recipe)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Al menú</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* Confirmation Modal to Delete Custom Recipe Category */}
    {recipeCategoryToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#263238]/10 text-[#263238]">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF5C5C] flex items-center justify-center text-xl mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-[#263238]">
              ¿Eliminar categoría de recetas?
            </h3>
            <p className="text-xs text-[#263238]/70">
              ¿Eliminar la categoría <strong className="text-[#263238]">"{recipeCategoryToDelete}"</strong>? Las recetas asociadas pasarán a la opción "Clásicos".
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRecipeCategoryToDelete(null)}
              className="px-4 py-2.5 rounded-xl border border-[#263238]/15 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                deleteRecipeCategory(recipeCategoryToDelete);
                setSelectedCategory('Todas');
                setRecipeCategoryToDelete(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-[#e04848] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
