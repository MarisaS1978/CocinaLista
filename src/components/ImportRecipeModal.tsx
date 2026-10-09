import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  extractRecipeFromPdf,
  extractRecipeFromUrl,
  extractRecipeFromText,
  ExtractedRecipeData,
} from '../services/recipeImportService';
import {
  X,
  FileText,
  Globe,
  UploadCloud,
  FileUp,
  Sparkles,
  Loader2,
  Trash2,
  AlertCircle,
  Clock,
  Users,
} from 'lucide-react';
import { Recipe, ProductCategory } from '../types';

export const ImportRecipeModal: React.FC = () => {
  const {
    isImportRecipeModalOpen,
    setIsImportRecipeModalOpen,
    addRecipe,
    showToast,
    setSelectedRecipeDetail,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pdf' | 'url' | 'text'>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted draft state for user review and editing before saving
  const [draftRecipe, setDraftRecipe] = useState<ExtractedRecipeData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportRecipeModalOpen) return null;

  const handleClose = () => {
    setIsImportRecipeModalOpen(false);
    setSelectedFile(null);
    setUrlInput('');
    setTextInput('');
    setIsLoading(false);
    setErrorMessage(null);
    setDraftRecipe(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Por favor seleccioná un archivo en formato PDF.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Por favor seleccioná un archivo en formato PDF.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleExtract = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      let extracted: ExtractedRecipeData;
      if (activeTab === 'pdf') {
        if (!selectedFile) {
          throw new Error('Por favor seleccioná un archivo PDF para continuar.');
        }
        extracted = await extractRecipeFromPdf(selectedFile);
      } else if (activeTab === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Por favor ingresá la dirección web (URL) de la receta.');
        }
        extracted = await extractRecipeFromUrl(urlInput);
      } else {
        if (!textInput.trim()) {
          throw new Error('Por favor pegá el texto de la receta.');
        }
        extracted = await extractRecipeFromText(textInput);
      }

      setDraftRecipe(extracted);
      showToast('✨ Receta extraída con éxito. Revisá los detalles antes de guardar.', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la receta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!draftRecipe || !draftRecipe.name.trim()) {
      showToast('⚠️ La receta necesita un nombre.', 'warning');
      return;
    }

    const newRecipe: Omit<Recipe, 'id'> = {
      name: draftRecipe.name.trim(),
      emoji: draftRecipe.emoji || '🍲',
      timeMin: draftRecipe.timeMin || 30,
      servings: draftRecipe.servings || 4,
      difficulty: draftRecipe.difficulty || 'Media',
      category: draftRecipe.category || 'Clásicos',
      diet: draftRecipe.diet || 'balanceado',
      tags: draftRecipe.tags || ['Importada'],
      ingredients: draftRecipe.ingredients.map(ing => ({
        name: ing.name.trim(),
        amount: Number(ing.amount) || 1,
        unit: ing.unit || 'unidades',
        category: (ing.category || 'Otros') as ProductCategory,
      })),
      instructions: draftRecipe.instructions.map(s => s.trim()).filter(Boolean),
      isCustom: true,
    };

    addRecipe(newRecipe);
    handleClose();
  };

  // Helper modifications for draft
  const handleUpdateIngredient = (index: number, field: string, value: any) => {
    if (!draftRecipe) return;
    const updated = [...draftRecipe.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setDraftRecipe({ ...draftRecipe, ingredients: updated });
  };

  const handleRemoveIngredient = (index: number) => {
    if (!draftRecipe) return;
    const updated = draftRecipe.ingredients.filter((_, idx) => idx !== index);
    setDraftRecipe({ ...draftRecipe, ingredients: updated });
  };

  const handleAddIngredient = () => {
    if (!draftRecipe) return;
    setDraftRecipe({
      ...draftRecipe,
      ingredients: [
        ...draftRecipe.ingredients,
        { name: '', amount: 1, unit: 'unidades', category: 'Otros' as ProductCategory },
      ],
    });
  };

  const handleUpdateStep = (index: number, value: string) => {
    if (!draftRecipe) return;
    const updated = [...draftRecipe.instructions];
    updated[index] = value;
    setDraftRecipe({ ...draftRecipe, instructions: updated });
  };

  const handleRemoveStep = (index: number) => {
    if (!draftRecipe) return;
    const updated = draftRecipe.instructions.filter((_, idx) => idx !== index);
    setDraftRecipe({ ...draftRecipe, instructions: updated });
  };

  const handleAddStep = () => {
    if (!draftRecipe) return;
    setDraftRecipe({
      ...draftRecipe,
      instructions: [...draftRecipe.instructions, ''],
    });
  };

  const categories = ['Carnes', 'Pastas', 'Guisos', 'Tartas', 'Ensaladas', 'Pizzas', 'Clásicos'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#263238]/10 text-[#263238] my-auto max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4D96FF]/15 text-[#2563EB] flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                {draftRecipe ? 'Revisar receta importada' : 'Importar receta'}
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                {draftRecipe
                  ? 'Verificá los ingredientes y pasos antes de guardar en tu colección.'
                  : 'Extraé ingredientes y pasos automáticamente desde un PDF o enlace web.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#263238]/40 hover:text-[#263238] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {!draftRecipe ? (
            <>
              {/* Tab Selector */}
              <div className="flex p-1 rounded-2xl bg-[#FFFDF7] border border-[#263238]/12 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pdf');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'pdf'
                      ? 'bg-[#263238] text-white shadow-xs'
                      : 'text-[#263238]/70 hover:text-[#263238] hover:bg-black/5'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Archivo PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('url');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-[#263238] text-white shadow-xs'
                      : 'text-[#263238]/70 hover:text-[#263238] hover:bg-black/5'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Enlace Web</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-[#263238] text-white shadow-xs'
                      : 'text-[#263238]/70 hover:text-[#263238] hover:bg-black/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pegar texto</span>
                </button>
              </div>

              {/* Tab 1: PDF Upload */}
              {activeTab === 'pdf' && (
                <div className="space-y-4">
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#263238]/20 hover:border-[#39B54A] rounded-3xl p-6 sm:p-8 text-center bg-[#FFFDF7] hover:bg-[#39B54A]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-[#4D96FF]/10 group-hover:bg-[#39B54A]/15 text-[#2563EB] group-hover:text-[#39B54A] flex items-center justify-center transition-colors">
                      <UploadCloud className="w-7 h-7" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#263238]">
                        {selectedFile ? selectedFile.name : 'Elegí un archivo PDF o arrastralo acá'}
                      </p>
                      <p className="text-xs text-[#263238]/60 mt-1">
                        {selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Listo para procesar`
                          : 'Soporta recetarios, fichas de cocina y recetas descargadas (máx 20MB)'}
                      </p>
                    </div>

                    {selectedFile && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#39B54A]/15 text-[#1e6b29]">
                        Archivo seleccionado
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Web Link */}
              {activeTab === 'url' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#263238] block">
                      Dirección web (URL) de la receta:
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#263238]/40" />
                      <input
                        type="url"
                        placeholder="https://cookpad.com/... o blog de cocina"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#FFFDF7] border border-[#263238]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
                      />
                    </div>
                    <p className="text-[11px] text-[#263238]/60">
                      Admite recetas de Cookpad, Allrecipes, RecetasGratis, Paulina Cocina y cualquier blog de cocina.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Paste Text */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#263238] block">
                      Pegá los ingredientes y pasos de la receta:
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Ejemplo:
Guiso de lentejas
Ingredientes:
- 500g de lentejas
- 1 chorizo colorado
- 1 cebolla picada
Preparación:
1. Sofreír la cebolla..."
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      className="w-full p-3.5 text-xs sm:text-sm bg-[#FFFDF7] border border-[#263238]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={
                    isLoading ||
                    (activeTab === 'pdf' && !selectedFile) ||
                    (activeTab === 'url' && !urlInput.trim()) ||
                    (activeTab === 'text' && !textInput.trim())
                  }
                  onClick={handleExtract}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extrayendo receta...</span>
                    </>
                  ) : (
                    <span>Procesar y extraer receta</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Review & Edit Draft Recipe */
            <div className="space-y-5 animate-in fade-in">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-[11px] font-bold text-[#263238]">
                    Nombre de la receta *
                  </label>
                  <input
                    type="text"
                    value={draftRecipe.name}
                    onChange={e => setDraftRecipe({ ...draftRecipe, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39B54A]"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-[#263238]">
                    Categoría
                  </label>
                  <select
                    value={draftRecipe.category}
                    onChange={e => setDraftRecipe({ ...draftRecipe, category: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time, Servings & Difficulty */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#263238]/10 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#263238]/70">
                    <Clock className="w-3 h-3 text-[#FF8A3D]" />
                    <span>Tiempo (min)</span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={draftRecipe.timeMin}
                    onChange={e =>
                      setDraftRecipe({
                        ...draftRecipe,
                        timeMin: parseInt(e.target.value, 10) || 30,
                      })
                    }
                    className="w-full px-2 py-1 text-xs font-bold bg-white border border-[#263238]/15 rounded-lg"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#263238]/10 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#263238]/70">
                    <Users className="w-3 h-3 text-[#4D96FF]" />
                    <span>Porciones</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={draftRecipe.servings}
                    onChange={e =>
                      setDraftRecipe({
                        ...draftRecipe,
                        servings: parseInt(e.target.value, 10) || 4,
                      })
                    }
                    className="w-full px-2 py-1 text-xs font-bold bg-white border border-[#263238]/15 rounded-lg"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#263238]/10 space-y-1">
                  <span className="text-[11px] font-bold text-[#263238]/70 block">
                    Dificultad
                  </span>
                  <select
                    value={draftRecipe.difficulty}
                    onChange={e =>
                      setDraftRecipe({
                        ...draftRecipe,
                        difficulty: e.target.value as any,
                      })
                    }
                    className="w-full px-1.5 py-1 text-xs bg-white border border-[#263238]/15 rounded-lg"
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Media">Media</option>
                    <option value="Avanzada">Avanzada</option>
                  </select>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#263238]">
                    Ingredientes ({draftRecipe.ingredients.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-xs font-bold text-[#39B54A] hover:underline cursor-pointer"
                  >
                    + Agregar ingrediente
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {draftRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-[#FFFDF7] border border-[#263238]/10 rounded-xl"
                    >
                      <input
                        type="text"
                        placeholder="Ingrediente..."
                        value={ing.name}
                        onChange={e => handleUpdateIngredient(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#263238]/15 rounded-lg focus:outline-none"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Cant."
                        value={ing.amount}
                        onChange={e => handleUpdateIngredient(idx, 'amount', e.target.value)}
                        className="w-16 px-2 py-1.5 text-xs bg-white border border-[#263238]/15 rounded-lg focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Unidad (g, kg...)"
                        value={ing.unit}
                        onChange={e => handleUpdateIngredient(idx, 'unit', e.target.value)}
                        className="w-20 px-2 py-1.5 text-xs bg-white border border-[#263238]/15 rounded-lg focus:outline-none"
                      />
                      {draftRecipe.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-1.5 text-[#263238]/40 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#263238]">
                    Pasos de preparación ({draftRecipe.instructions.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-xs font-bold text-[#4D96FF] hover:underline cursor-pointer"
                  >
                    + Agregar paso
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {draftRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#39B54A]/20 text-[#2b8838] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={e => handleUpdateStep(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-[#FFFDF7] border border-[#263238]/15 rounded-lg focus:outline-none"
                      />
                      {draftRecipe.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1.5 text-[#263238]/40 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Draft Action Buttons */}
              <div className="pt-3 border-t border-[#263238]/8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDraftRecipe(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#263238]/70 hover:text-[#263238] rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Volver a cargar
                </button>

                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#39B54A] hover:bg-[#329e41] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Guardar en Mis Recetas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
