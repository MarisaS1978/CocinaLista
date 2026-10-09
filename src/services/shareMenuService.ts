import { WeeklyMenu, Recipe, DayOfWeek } from '../types';

interface CompactMealSlot {
  r?: string; // recipeId
  n?: string; // customName
  e?: string; // customEmoji
  t?: number; // timeMin
}

type CompactWeeklyMenu = Partial<Record<DayOfWeek, { a?: CompactMealSlot; c?: CompactMealSlot }>>;

const DAY_LABELS: Record<DayOfWeek, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

/**
 * Encodes the weekly menu into a safe base64 URL query string
 */
export function encodeWeeklyMenuToUrl(menu: WeeklyMenu, recipes: Recipe[]): string {
  try {
    const compact: CompactWeeklyMenu = {};
    const recipeMap = new Map<string, Recipe>();
    recipes.forEach(r => recipeMap.set(r.id, r));

    (Object.keys(menu) as DayOfWeek[]).forEach(day => {
      const dayMeals = menu[day];
      if (!dayMeals) return;

      const compactDay: { a?: CompactMealSlot; c?: CompactMealSlot } = {};

      if (dayMeals.almuerzo) {
        const slot = dayMeals.almuerzo;
        if (slot.recipeId) {
          compactDay.a = { r: slot.recipeId };
        } else if (slot.customName) {
          compactDay.a = { n: slot.customName, e: slot.customEmoji, t: slot.timeMin };
        }
      }

      if (dayMeals.cena) {
        const slot = dayMeals.cena;
        if (slot.recipeId) {
          compactDay.c = { r: slot.recipeId };
        } else if (slot.customName) {
          compactDay.c = { n: slot.customName, e: slot.customEmoji, t: slot.timeMin };
        }
      }

      if (compactDay.a || compactDay.c) {
        compact[day] = compactDay;
      }
    });

    const jsonString = JSON.stringify(compact);
    // Safe base64 encoding for UTF-8
    const base64 = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));

    const url = new URL(window.location.href);
    url.searchParams.set('menu', base64);
    return url.toString();
  } catch (err) {
    console.error('Error encoding weekly menu to URL:', err);
    return window.location.href;
  }
}

/**
 * Decodes a base64 weekly menu from a URL query parameter
 */
export function decodeWeeklyMenuFromUrl(param: string, recipes: Recipe[]): WeeklyMenu | null {
  try {
    if (!param) return null;

    // Safe base64 decoding for UTF-8
    const binary = atob(param);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    const jsonString = decodeURIComponent(escape(binary));
    const compact = JSON.parse(jsonString) as CompactWeeklyMenu;

    const days: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const decodedMenu: Partial<WeeklyMenu> = {};

    days.forEach(d => {
      const dayData = compact[d];
      decodedMenu[d] = {
        almuerzo: null,
        cena: null,
      };

      if (dayData?.a) {
        if (dayData.a.r) {
          // verify recipe exists or fallback
          const rec = recipes.find(r => r.id === dayData.a!.r);
          decodedMenu[d]!.almuerzo = {
            recipeId: dayData.a.r,
            customName: rec?.name,
            customEmoji: rec?.emoji,
          };
        } else if (dayData.a.n) {
          decodedMenu[d]!.almuerzo = {
            customName: dayData.a.n,
            customEmoji: dayData.a.e || '🍽️',
            timeMin: dayData.a.t || 30,
          };
        }
      }

      if (dayData?.c) {
        if (dayData.c.r) {
          const rec = recipes.find(r => r.id === dayData.c!.r);
          decodedMenu[d]!.cena = {
            recipeId: dayData.c.r,
            customName: rec?.name,
            customEmoji: rec?.emoji,
          };
        } else if (dayData.c.n) {
          decodedMenu[d]!.cena = {
            customName: dayData.c.n,
            customEmoji: dayData.c.e || '🍽️',
            timeMin: dayData.c.t || 30,
          };
        }
      }
    });

    return decodedMenu as WeeklyMenu;
  } catch (err) {
    console.error('Error decoding weekly menu from URL:', err);
    return null;
  }
}

/**
 * Generates human readable text summary of the weekly menu for WhatsApp or chat sharing
 */
export function generateMenuShareText(menu: WeeklyMenu, recipes: Recipe[], shareUrl?: string): string {
  const recipeMap = new Map<string, Recipe>();
  recipes.forEach(r => recipeMap.set(r.id, r));

  let text = `🍽️ *Mi Menú Semanal — Cocina Lista*\n\n`;

  const days: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  days.forEach(day => {
    const d = menu[day];
    const dayLabel = DAY_LABELS[day].toUpperCase();
    text += `📅 *${dayLabel}*\n`;

    // Almuerzo
    if (d?.almuerzo) {
      const rec = d.almuerzo.recipeId ? recipeMap.get(d.almuerzo.recipeId) : null;
      const emoji = rec?.emoji || d.almuerzo.customEmoji || '🍽️';
      const name = rec?.name || d.almuerzo.customName || 'Comida personalizada';
      text += `  • Almuerzo: ${emoji} ${name}\n`;
    } else {
      text += `  • Almuerzo: (Sin planificar)\n`;
    }

    // Cena
    if (d?.cena) {
      const rec = d.cena.recipeId ? recipeMap.get(d.cena.recipeId) : null;
      const emoji = rec?.emoji || d.cena.customEmoji || '🍽️';
      const name = rec?.name || d.cena.customName || 'Comida personalizada';
      text += `  • Cena: ${emoji} ${name}\n`;
    } else {
      text += `  • Cena: (Sin planificar)\n`;
    }

    text += `\n`;
  });

  if (shareUrl) {
    text += `🔗 Ver o importar este menú en Cocina Lista:\n${shareUrl}\n`;
  }

  return text;
}
