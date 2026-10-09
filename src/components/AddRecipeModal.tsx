import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, Ingredient } from '../types';
import {
  STANDARD_CATEGORIES,
  detectCategoryFromName,
  suggestIconForRecipeCategory,
  POPULAR_RECIPE_ICONS,
} from '../services/recipeCategories';
import { X, Plus, Trash2, Clock, Users, ChefHat, Sparkles, FileUp, FolderPlus } from 'lucide-react';

export const AddRecipeModal: React.FC = () => {
  const {
    isAddRecipeModalOpen,
    setIsAddRecipeModalOpen,
    setIsImportRecipeModalOpen,
    addRecipe,
    newRecipeInitialCategory,
    allRecipeCategories,
    addRecipeCategory,
    showToast,
  } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍲');
  const [category, setCategory] = useState<string>('Tartas');
  const [diet, setDiet] = useState<'balanceado' | 'carne' | 'vegetariano'>('balanceado');
  const [timeMin, setTimeMin] = useState<number>(35);
  const [servings, setServings] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Media' | 'Avanzada'>('Fácil');
  const [tagsInput, setTagsInput] = useState('Casero, Familiar');
  const [autoDetected, setAutoDetected] = useState(false);
  const [showInlineNewCat, setShowInlineNewCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatIcon, setInlineCatIcon] = useState('🍽️');

  useEffect(() => {
    if (isAddRecipeModalOpen) {
      if (
        newRecipeInitialCategory &&
        newRecipeInitialCategory !== 'Todas' &&
        newRecipeInitialCategory !== 'Mis recetas' &&
        newRecipeInitialCategory !== '⭐ Mis recetas'
      ) {
        setCategory(newRecipeInitialCategory);
      } else {
        setCategory('Tartas');
      }
      setName('');
      setEmoji('🍲');
      setAutoDetected(false);
    }
  }, [isAddRecipeModalOpen, newRecipeInitialCategory]);

  // Ingredients list
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: 500, unit: 'g', category: 'Carnicería' },
    { name: '', amount: 1, unit: 'unidades', category: 'Verdulería' },
  ]);

  // Instructions steps
  const [instructions, setInstructions] = useState<string[]>([
    '',
    '',
  ]);

  if (!isAddRecipeModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const detected = detectCategoryFromName(val);
    if (detected) {
      setCategory(detected.category);
      if (!emoji || emoji === '🍲') {
        setEmoji(detected.emoji);
      }
      setAutoDetected(true);
    }
  };

  const commonUnits = ['g', 'kg', 'unidades', 'paquetes', 'latas', 'litros', 'ml'];
  const productCategories: ProductCategory[] = [
    'Verdulería',
    'Carnicería',
    'Almacén',
    'Lácteos',
    'Huevos',
    'Congelados',
    'Otros',
  ];
  const quickEmojis = ['🍗', '🍝', '🥘', '🥔', '🥗', '🍕', '🍲', '🥩', '🥧', '🥟', '🍔', '🌮', '🍳', '🥪', '🍚', '🍜', '🥑', '🍅'];

  const handleAddIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { name: '', amount: 1, unit: 'unidades', category: 'Verdulería' },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setIngredients(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    setInstructions(prev => [...prev, '']);
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    setInstructions(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter valid ingredients
    const validIngredients = ingredients.filter(i => i.name.trim().length > 0).map(i => ({
      ...i,
      name: i.name.trim(),
      amount: Number(i.amount) || 1,
    }));

    if (validIngredients.length === 0) {
      showToast('⚠️ Por favor agregá al menos 1 ingrediente con nombre.', 'warning');
      return;
    }

    const validInstructions = instructions
      .map(ins => ins.trim())
      .filter(ins => ins.length > 0);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addRecipe({
      name: name.trim(),
      emoji,
      timeMin: Number(timeMin) || 30,
      servings: Number(servings) || 4,
      difficulty,
      category,
      diet,
      tags: tags.length > 0 ? tags : ['Casero'],
      ingredients: validIngredients,
      instructions: validInstructions.length > 0 ? validInstructions : ['Preparar y cocinar todos los ingredientes.'],
    });

    setIsAddRecipeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4D96FF]/15 text-[#4D96FF] flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Sumar nueva receta
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Cargá tus platos caseros. Sus ingredientes se sumarán a la lista de compras automáticamente.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddRecipeModalOpen(false)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner para importar automáticamente desde PDF o Enlace */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#4D96FF]/10 border border-[#4D96FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-[#1e40af]">
            <FileUp className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="font-semibold">¿Tenés la receta en un archivo PDF o en un link de internet?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAddRecipeModalOpen(false);
              setIsImportRecipeModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Importar automáticamente
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre y Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Nombre de la receta *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej: Tarta de jamón y queso, Ñoquis de papa..."
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Ícono de la receta
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={4}
                  value={emoji}
                  onChange={e => setEmoji(e.target.value || '🍲')}
                  className="w-10 h-9 text-center text-xl rounded-xl border border-[#263238]/20 bg-[#FFFDF7] focus:ring-2 focus:ring-[#39B54A] focus:outline-none shrink-0"
                  title="Escribí o pegá cualquier emoji"
                />
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {quickEmojis.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border shrink-0 cursor-pointer transition-transform ${
                        emoji === em
                          ? 'border-[#39B54A] bg-[#39B54A]/20 scale-105 font-bold'
                          : 'border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Asignar Categoría de filtrado (Prominente y con iconos) */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/15 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold text-[#263238] block">
                Asignar opción de filtrado *
              </label>
              <div className="flex items-center gap-1.5">
                {autoDetected && (
                  <span className="text-[10px] font-bold text-[#FF8A3D] bg-[#FF8A3D]/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Detectada automáticamente
                  </span>
                )}
                <span className="text-[11px] font-bold text-[#1e6328] bg-[#39B54A]/15 px-2.5 py-0.5 rounded-md border border-[#39B54A]/30">
                  Aparecerá bajo: {category}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#263238]/70">
              Elegí bajo qué opción querés que aparezca tu receta. Al elegir por ejemplo <strong>Tartas</strong>, se mostrará tanto en el filtro <em>Tartas</em> (junto a las precargadas) como en <em>⭐ Mis recetas</em>:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {allRecipeCategories.map(c => {
                const isSelected = category.toLowerCase().trim() === c.name.toLowerCase().trim();
                return (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => {
                      setCategory(c.name);
                      setAutoDetected(false);
                      if (!emoji || emoji === '🍲') {
                        setEmoji(c.icon || '🍲');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#39B54A] bg-[#39B54A]/15 font-bold shadow-xs scale-[1.02]'
                        : 'border-[#263238]/12 bg-white hover:border-[#39B54A]/40 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <div className="min-w-0">
                      <span className={`text-xs block truncate ${isSelected ? 'text-[#1e6328] font-bold' : 'text-[#263238]'}`}>
                        {c.name}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Quick button to create a new category */}
              <button
                type="button"
                onClick={() => {
                  setShowInlineNewCat(true);
                  if (!inlineCatName) {
                    setInlineCatIcon('🍽️');
                  }
                }}
                className="p-2.5 rounded-xl border border-dashed border-[#39B54A]/50 bg-[#39B54A]/5 hover:bg-[#39B54A]/12 text-left flex items-center gap-2 transition-all cursor-pointer"
                title="Crear una nueva categoría de recetas"
              >
                <div className="w-6 h-6 rounded-lg bg-[#39B54A]/15 text-[#39B54A] flex items-center justify-center shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#39B54A] block truncate">
                    + Nueva categoría
                  </span>
                </div>
              </button>
            </div>

            {/* Inline create category form if toggled */}
            {showInlineNewCat && (
              <div className="p-3 bg-white rounded-2xl border border-[#39B54A]/40 shadow-xs space-y-2 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#263238] flex items-center gap-1.5">
                    <FolderPlus className="w-3.5 h-3.5 text-[#39B54A]" />
                    <span>Crear nueva categoría para esta receta:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInlineNewCat(false)}
                    className="text-xs text-[#263238]/50 hover:text-[#263238] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <input
                      type="text"
                      maxLength={3}
                      value={inlineCatIcon}
                      onChange={e => setInlineCatIcon(e.target.value || '🍽️')}
                      className="w-10 h-8 text-center text-lg rounded-xl border border-[#263238]/20 bg-[#FFFDF7] shrink-0"
                      title="Emoji de la categoría"
                    />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nombre de categoría (ej: Postres, Sopas...)"
                      value={inlineCatName}
                      onChange={e => {
                        setInlineCatName(e.target.value);
                        setInlineCatIcon(suggestIconForRecipeCategory(e.target.value));
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-1 focus:ring-[#39B54A] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      disabled={!inlineCatName.trim()}
                      onClick={() => {
                        const trimmed = inlineCatName.trim();
                        if (!trimmed) return;
                        const ok = addRecipeCategory(trimmed, inlineCatIcon);
                        if (ok) {
                          setCategory(trimmed);
                          setAutoDetected(false);
                          setInlineCatName('');
                          setShowInlineNewCat(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#39B54A] hover:bg-[#329e41] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Guardar y asignar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInlineNewCat(false)}
                      className="px-2.5 py-1.5 text-xs text-[#263238]/60 hover:text-[#263238] rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dieta y Dificultad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Tipo de plato
              </label>
              <select
                value={diet}
                onChange={e => setDiet(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              >
                <option value="balanceado">Balanceado</option>
                <option value="carne">Con carne</option>
                <option value="vegetariano">Vegetariano</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              >
                <option value="Fácil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Avanzada">Avanzada</option>
              </select>
            </div>
          </div>

          {/* Tiempo y Porciones */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#263238] flex items-center gap-1 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF8A3D]" />
                Tiempo (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                required
                value={timeMin}
                onChange={e => setTimeMin(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#263238] flex items-center gap-1 mb-1.5">
                <Users className="w-3.5 h-3.5 text-[#4D96FF]" />
                Porciones
              </label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-[#263238] block mb-1.5">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="Rápido, Casero..."
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:outline-none"
              />
            </div>
          </div>

          {/* INGREDIENTES DINÁMICOS */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#263238]">
                  Ingredientes necesarios *
                </h3>
                <p className="text-[11px] text-[#263238]/60">
                  Se compararán con la despensa para saber qué comprar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-2.5 py-1 text-xs font-bold text-[#39B54A] bg-white border border-[#39B54A]/40 hover:bg-[#39B54A]/10 rounded-lg transition-colors cursor-pointer"
              >
                <span>Agregar ingrediente</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#263238]/10"
                >
                  <input
                    type="text"
                    placeholder="Ingrediente (ej: Papa)"
                    value={ing.name}
                    onChange={e => handleUpdateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 min-w-[120px] px-2.5 py-1.5 text-xs bg-[#FFFDF7] border border-[#263238]/15 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
                  />
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="Cant."
                    value={ing.amount}
                    onChange={e => handleUpdateIngredient(idx, 'amount', e.target.value)}
                    className="w-16 px-2 py-1.5 text-xs bg-[#FFFDF7] border border-[#263238]/15 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
                  />
                  <select
                    value={ing.unit}
                    onChange={e => handleUpdateIngredient(idx, 'unit', e.target.value)}
                    className="w-24 px-1.5 py-1.5 text-xs bg-[#FFFDF7] border border-[#263238]/15 rounded-lg focus:outline-none"
                  >
                    {commonUnits.map(u => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <select
                    value={ing.category}
                    onChange={e => handleUpdateIngredient(idx, 'category', e.target.value)}
                    className="w-28 px-1.5 py-1.5 text-xs bg-[#FFFDF7] border border-[#263238]/15 rounded-lg focus:outline-none hidden sm:block"
                  >
                    {productCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-[#263238]/40 hover:text-[#FF5C5C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PASOS DE PREPARACIÓN */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#263238]">
                Pasos de preparación (opcional)
              </h3>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-2.5 py-1 text-xs font-bold text-[#4D96FF] bg-white border border-[#4D96FF]/40 hover:bg-[#4D96FF]/10 rounded-lg transition-colors cursor-pointer"
              >
                <span>Agregar paso</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#39B54A]/20 text-[#2b8838] font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Paso ${idx + 1}...`}
                    value={step}
                    onChange={e => handleUpdateInstruction(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#263238]/15 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(idx)}
                      className="p-1.5 text-[#263238]/40 hover:text-[#FF5C5C] rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#263238]/8">
            <button
              type="button"
              onClick={() => setIsAddRecipeModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-black/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Guardar receta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
