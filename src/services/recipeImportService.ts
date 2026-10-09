import { Recipe, Ingredient } from '../types';

export interface ExtractedRecipeData {
  name: string;
  emoji: string;
  timeMin: number;
  servings: number;
  difficulty: 'Fácil' | 'Media' | 'Avanzada';
  category: string;
  diet: 'balanceado' | 'carne' | 'vegetariano';
  tags: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

/**
 * Extracts recipe from a web link
 */
export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipeData> {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    throw new Error('Por favor ingresá un enlace web válido que comience con http:// o https://');
  }

  const response = await fetch('/api/extract-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'url',
      url: trimmed,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No se pudo extraer la receta del enlace web proporcionado.');
  }

  return normalizeExtractedRecipe(data.recipe);
}

/**
 * Extracts recipe from a PDF file
 */
export async function extractRecipeFromPdf(file: File): Promise<ExtractedRecipeData> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('El archivo seleccionado debe ser un documento PDF (.pdf).');
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error('El archivo PDF es demasiado grande (máximo 20MB).');
  }

  // Convert File to Base64
  const base64 = await fileToBase64(file);

  const response = await fetch('/api/extract-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'pdf',
      data: base64,
      fileName: file.name,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No se pudo procesar el archivo PDF.');
  }

  return normalizeExtractedRecipe(data.recipe);
}

/**
 * Extracts recipe from pasted text
 */
export async function extractRecipeFromText(text: string): Promise<ExtractedRecipeData> {
  const trimmed = text.trim();
  if (trimmed.length < 15) {
    throw new Error('El texto de la receta es demasiado corto.');
  }

  const response = await fetch('/api/extract-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'text',
      data: trimmed,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No se pudo procesar el texto de la receta.');
  }

  return normalizeExtractedRecipe(data.recipe);
}

/**
 * Normalizes and validates the extracted recipe fields
 */
function normalizeExtractedRecipe(raw: any): ExtractedRecipeData {
  const name = String(raw?.name || 'Receta importada').trim();
  const emoji = String(raw?.emoji || '🍲').trim().slice(0, 4) || '🍲';
  const timeMin = Math.max(5, Math.min(360, Number(raw?.timeMin) || 30));
  const servings = Math.max(1, Math.min(50, Number(raw?.servings) || 4));

  let difficulty: 'Fácil' | 'Media' | 'Avanzada' = 'Media';
  if (raw?.difficulty === 'Fácil' || raw?.difficulty === 'Media' || raw?.difficulty === 'Avanzada') {
    difficulty = raw.difficulty;
  }

  const validCategories = ['Carnes', 'Pastas', 'Guisos', 'Tartas', 'Ensaladas', 'Pizzas', 'Clásicos'];
  let category = String(raw?.category || 'Clásicos').trim();
  if (!category) category = 'Clásicos';

  let diet: 'balanceado' | 'carne' | 'vegetariano' = 'balanceado';
  if (raw?.diet === 'carne' || raw?.diet === 'vegetariano' || raw?.diet === 'balanceado') {
    diet = raw.diet;
  }

  const tags = Array.isArray(raw?.tags) && raw.tags.length > 0
    ? raw.tags.map((t: any) => String(t).trim()).filter(Boolean)
    : ['Importada'];

  // Normalize ingredients
  let ingredients: Ingredient[] = [];
  if (Array.isArray(raw?.ingredients)) {
    ingredients = raw.ingredients
      .filter((ing: any) => ing && (ing.name || ing.nombre))
      .map((ing: any) => ({
        name: String(ing.name || ing.nombre || '').trim(),
        amount: Math.max(0.1, Number(ing.amount || ing.cantidad) || 1),
        unit: String(ing.unit || ing.unidad || 'unidades').trim() || 'unidades',
        category: (ing.category || ing.categoria || 'Otros') as any,
      }));
  }

  if (ingredients.length === 0) {
    ingredients = [{ name: 'Ingrediente principal', amount: 1, unit: 'unidades', category: 'Otros' }];
  }

  // Normalize instructions
  let instructions: string[] = [];
  if (Array.isArray(raw?.instructions)) {
    instructions = raw.instructions
      .map((step: any) => (typeof step === 'string' ? step : step?.text || String(step)))
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (instructions.length === 0) {
    instructions = ['Seguir las instrucciones de la receta original.'];
  }

  return {
    name,
    emoji,
    timeMin,
    servings,
    difficulty,
    category,
    diet,
    tags,
    ingredients,
    instructions,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
