import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow large payloads for base64 encoded PDFs
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to clean HTML text
function cleanHtml(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract Schema.org JSON-LD Recipe from HTML if present
function extractJsonLdRecipe(html: string): any | null {
  try {
    const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@graph'] && Array.isArray(item['@graph'])) {
            const graphRecipe = item['@graph'].find((g: any) =>
              g['@type'] === 'Recipe' || (Array.isArray(g['@type']) && g['@type'].includes('Recipe'))
            );
            if (graphRecipe) return graphRecipe;
          }
          if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            return item;
          }
        }
      } catch {}
    }
  } catch {}
  return null;
}

// Convert ISO 8601 duration to minutes (e.g. PT45M, PT1H30M)
function parseDurationToMinutes(duration?: string): number {
  if (!duration) return 30;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return 30;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const total = hours * 60 + minutes;
  return total > 0 ? total : 30;
}

// Helper: classify ingredient category based on name
function classifyIngredientCategory(name: string): string {
  const n = name.toLowerCase();
  if (/carne|pollo|lomo|peceto|molida|cerdo|asado|bife|costill|pescado|merluza|atun|jamon|panceta|salchicha/i.test(n)) {
    return 'Carnicería';
  }
  if (/papa|cebolla|tomate|lechuga|zanahoria|ajo|morron|pimiento|acelga|espinaca|calabaza|choclo|limon|palta|rucula|zucchini|berenjena|manzana|banana|fruta/i.test(n)) {
    return 'Verdulería';
  }
  if (/leche|queso|manteca|crema|yogur|ricota|mozzarella|parmesano/i.test(n)) {
    return 'Lácteos';
  }
  if (/huevo/i.test(n)) {
    return 'Huevos';
  }
  if (/congelad|helad/i.test(n)) {
    return 'Congelados';
  }
  return 'Almacén';
}

// Parse ingredient text line into structured amount, unit, name
function parseIngredientString(raw: string) {
  const cleaned = raw.replace(/^[•\-\*\d+\.]\s*/, '').trim();
  const match = cleaned.match(/^([\d\/\.,]+)\s*([a-zA-Záéíóúñ]+)?\s+(?:de\s+)?(.+)$/i);
  if (match) {
    let amtStr = match[1].replace(',', '.');
    let amount = parseFloat(amtStr);
    if (isNaN(amount) || amount <= 0) amount = 1;
    let unit = (match[2] || 'unidades').toLowerCase();
    if (/kg|kilo|kilogramos?/i.test(unit)) unit = 'kg';
    else if (/g|gr|gramos?/i.test(unit)) unit = 'g';
    else if (/ml|mililitros?/i.test(unit)) unit = 'ml';
    else if (/l|lt|litros?/i.test(unit)) unit = 'litros';
    else if (/taza|tazas/i.test(unit)) unit = 'tazas';
    else if (/cucharad|cucharadas?/i.test(unit)) unit = 'cucharadas';
    else if (/lata|latas/i.test(unit)) unit = 'latas';
    else if (/paquete|paquetes/i.test(unit)) unit = 'paquetes';
    else unit = 'unidades';

    const ingName = match[3].trim();
    return {
      name: ingName,
      amount,
      unit,
      category: classifyIngredientCategory(ingName),
    };
  }

  return {
    name: cleaned,
    amount: 1,
    unit: 'unidades',
    category: classifyIngredientCategory(cleaned),
  };
}

// Build recipe object from JSON-LD Schema.org
function buildRecipeFromJsonLd(schema: any) {
  const name = schema.name || 'Receta importada';
  const timeMin =
    parseDurationToMinutes(schema.totalTime) ||
    parseDurationToMinutes(schema.cookTime) ||
    parseDurationToMinutes(schema.prepTime) ||
    35;

  let servings = 4;
  if (schema.recipeYield) {
    const yieldNum = parseInt(String(schema.recipeYield).match(/\d+/)?.[0] || '4', 10);
    if (!isNaN(yieldNum) && yieldNum > 0) servings = yieldNum;
  }

  // Parse ingredients
  const rawIngredients = Array.isArray(schema.recipeIngredient)
    ? schema.recipeIngredient
    : [];
  const ingredients = rawIngredients.map((item: string) => parseIngredientString(String(item)));

  // Parse instructions
  const instructions: string[] = [];
  if (Array.isArray(schema.recipeInstructions)) {
    schema.recipeInstructions.forEach((step: any) => {
      if (typeof step === 'string') {
        instructions.push(step.trim());
      } else if (step && typeof step === 'object') {
        if (step.text) instructions.push(step.text.trim());
        else if (step.itemListElement && Array.isArray(step.itemListElement)) {
          step.itemListElement.forEach((sub: any) => {
            if (typeof sub === 'string') instructions.push(sub.trim());
            else if (sub?.text) instructions.push(sub.text.trim());
          });
        }
      }
    });
  } else if (typeof schema.recipeInstructions === 'string') {
    instructions.push(schema.recipeInstructions.trim());
  }

  // Guess category
  let category = 'Clásicos';
  const catCandidate = schema.recipeCategory;
  if (typeof catCandidate === 'string') {
    const lower = catCandidate.toLowerCase();
    if (lower.includes('carne') || lower.includes('pollo')) category = 'Carnes';
    else if (lower.includes('pasta') || lower.includes('fideo')) category = 'Pastas';
    else if (lower.includes('ensalada')) category = 'Ensaladas';
    else if (lower.includes('tarta') || lower.includes('empanada')) category = 'Tartas';
    else if (lower.includes('guiso') || lower.includes('sopa')) category = 'Guisos';
    else if (lower.includes('pizza')) category = 'Pizzas';
  }

  return {
    name,
    emoji: '🍲',
    timeMin,
    servings,
    difficulty: timeMin <= 25 ? 'Fácil' : timeMin <= 50 ? 'Media' : 'Avanzada',
    category,
    diet: 'balanceado',
    tags: ['Importada', 'Web'],
    ingredients: ingredients.length > 0 ? ingredients : [
      { name: 'Ingredientes a revisar', amount: 1, unit: 'unidades', category: 'Otros' }
    ],
    instructions: instructions.length > 0 ? instructions : [
      'Seguir instrucciones de la receta original.'
    ],
  };
}

// Call Gemini with model fallback and error handling
async function callGeminiExtract(promptContents: any): Promise<any> {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const ai = new GoogleGenAI();

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptContents,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: `Eres un chef experto y asistente de cocina. Tu tarea es extraer la receta culinaria dada en formato JSON estricto con los siguientes campos en español:
{
  "name": "Nombre claro y apetitoso de la receta",
  "emoji": "un solo emoji representativo (ej: 🍲, 🥩, 🥗, 🥧, 🍝)",
  "timeMin": tiempo_total_en_minutos_entero,
  "servings": porciones_entero,
  "difficulty": "Fácil" | "Media" | "Avanzada",
  "category": "Carnes" | "Pastas" | "Guisos" | "Tartas" | "Ensaladas" | "Pizzas" | "Clásicos",
  "diet": "balanceado" | "carne" | "vegetariano",
  "tags": ["Casero", "Almuerzo"],
  "ingredients": [
    {
      "name": "nombre del ingrediente",
      "amount": numero_o_decimal,
      "unit": "kg" | "g" | "unidades" | "latas" | "paquetes" | "litros" | "ml" | "cucharadas" | "tazas",
      "category": "Verdulería" | "Carnicería" | "Almacén" | "Lácteos" | "Huevos" | "Congelados" | "Otros"
    }
  ],
  "instructions": [
    "Paso 1 detallado...",
    "Paso 2 detallado..."
  ]
}
Asegúrate de que cada ingrediente tenga cantidades numéricas válidas para poder calcular listas de compras.`,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} failed:`, err?.message || err);
      // continue to next model
    }
  }

  throw new Error('No se pudo conectar con el servicio de IA en este momento.');
}

// API Route: /api/extract-recipe
app.post('/api/extract-recipe', async (req: Request, res: Response) => {
  try {
    const { type, data, url, fileName } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Falta el tipo de extracción (pdf, url o text).' });
    }

    // 1. URL Extraction
    if (type === 'url') {
      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Proporciona una URL válida (ej: https://...).' });
      }

      let html = '';
      try {
        const fetchRes = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(12000),
        });
        html = await fetchRes.text();
      } catch (fetchErr: any) {
        console.warn('Direct URL fetch failed, trying AI with URL directly:', fetchErr.message);
      }

      // Check if schema.org Recipe is present in HTML
      if (html) {
        const jsonLdRecipe = extractJsonLdRecipe(html);
        if (jsonLdRecipe && jsonLdRecipe.name) {
          const recipe = buildRecipeFromJsonLd(jsonLdRecipe);
          return res.json({ success: true, recipe, source: 'schema.org' });
        }
      }

      // If no JSON-LD or direct fetch succeeded, use Gemini
      const textToAnalyze = html ? cleanHtml(html).slice(0, 18000) : `Enlace web: ${url}`;
      try {
        const recipe = await callGeminiExtract([
          {
            text: `Por favor extrae la receta completa de este contenido web (${url}):\n\n${textToAnalyze}`,
          },
        ]);
        return res.json({ success: true, recipe, source: 'gemini' });
      } catch (aiErr: any) {
        // Fallback: simple extraction from HTML text
        if (html) {
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].split(/[|\-–]/)[0].trim() : 'Receta de ' + url;
          return res.json({
            success: true,
            recipe: {
              name: title,
              emoji: '🍽️',
              timeMin: 35,
              servings: 4,
              difficulty: 'Media',
              category: 'Clásicos',
              diet: 'balanceado',
              tags: ['Web'],
              ingredients: [
                { name: 'Ingrediente principal', amount: 1, unit: 'unidades', category: 'Otros' },
              ],
              instructions: [
                'Ver receta original en: ' + url,
              ],
            },
            source: 'fallback',
          });
        }
        throw aiErr;
      }
    }

    // 2. PDF Extraction
    if (type === 'pdf') {
      if (!data || typeof data !== 'string') {
        return res.status(400).json({ error: 'Faltan los datos base64 del archivo PDF.' });
      }

      // Clean base64 string
      const base64Data = data.includes('base64,') ? data.split('base64,')[1] : data;

      try {
        const recipe = await callGeminiExtract([
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: `Analiza este documento PDF (${fileName || 'receta.pdf'}) y extrae la receta culinaria presente en él.`,
          },
        ]);

        return res.json({ success: true, recipe, source: 'gemini-pdf' });
      } catch (aiErr: any) {
        console.error('Gemini PDF extraction error:', aiErr);
        // Fallback recipe draft so the user can still proceed
        const cleanName = (fileName || 'Receta desde PDF').replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        return res.json({
          success: true,
          recipe: {
            name: cleanName,
            emoji: '📄',
            timeMin: 30,
            servings: 4,
            difficulty: 'Media',
            category: 'Clásicos',
            diet: 'balanceado',
            tags: ['PDF'],
            ingredients: [
              { name: 'Ingredientes del PDF', amount: 1, unit: 'unidades', category: 'Otros' },
            ],
            instructions: [
              'Revisar los pasos del archivo PDF.',
            ],
          },
          warning: 'No se pudo leer automáticamente el PDF por alta demanda. Podés completar los detalles a mano.',
          source: 'fallback',
        });
      }
    }

    // 3. Text Extraction
    if (type === 'text') {
      if (!data || typeof data !== 'string') {
        return res.status(400).json({ error: 'Falta el texto de la receta.' });
      }

      try {
        const recipe = await callGeminiExtract([
          {
            text: `Extrae la receta de este texto:\n\n${data.slice(0, 15000)}`,
          },
        ]);
        return res.json({ success: true, recipe, source: 'gemini-text' });
      } catch {
        // Simple line parser fallback
        const lines = data.split('\n').map(l => l.trim()).filter(Boolean);
        const name = lines[0] || 'Receta personalizada';
        return res.json({
          success: true,
          recipe: {
            name,
            emoji: '🍲',
            timeMin: 30,
            servings: 4,
            difficulty: 'Media',
            category: 'Clásicos',
            diet: 'balanceado',
            tags: ['Texto'],
            ingredients: [
              { name: 'Ingrediente 1', amount: 1, unit: 'unidades', category: 'Otros' },
            ],
            instructions: lines.slice(1, 6),
          },
          source: 'fallback',
        });
      }
    }

    return res.status(400).json({ error: 'Tipo no soportado.' });
  } catch (err: any) {
    console.error('Error in /api/extract-recipe:', err);
    return res.status(500).json({
      error: err.message || 'Error interno al procesar la receta.',
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
