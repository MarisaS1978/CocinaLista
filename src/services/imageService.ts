export const RECIPE_IMAGES: Record<string, string> = {
  rec_pollo_horno: '/images/pollo_al_horno.jpg',
  rec_pasta_salsa: '/images/pasta_con_salsa.jpg',
  rec_guiso_lentejas: '/images/guiso_de_lentejas.jpg',
  rec_tortilla_papa: '/images/tortilla_de_papa.jpg',
  rec_milanesas_pure: '/images/milanesas_pure.jpg',
  rec_ensalada_completa: '/images/ensalada_completa.jpg',
  rec_pizza_casera: '/images/pizza_casera.jpg',
  rec_tarta_acelga: '/images/tarta_acelga.jpg',
  rec_arroz_pollo: '/images/arroz_pollo.jpg',
  rec_pastel_papa: '/images/pastel_papa.jpg',
  rec_empanadas_carne: '/images/empanadas_carne.jpg',
  rec_hamburguesas_caseras: '/images/hamburguesas_caseras.jpg',
  rec_wok_vegetales: '/images/arroz_pollo.jpg',
  rec_canelones_espinaca: '/images/pasta_con_salsa.jpg',
  rec_revuelto_gramajo: '/images/tortilla_de_papa.jpg',
  rec_risotto_calabaza: '/images/arroz_pollo.jpg',
};

export function getRecipeImageUrl(recipe: { id?: string; image?: string }): string | undefined {
  // If mapped by recipe ID, that's our canonical public path
  if (recipe.id && RECIPE_IMAGES[recipe.id]) {
    return RECIPE_IMAGES[recipe.id];
  }

  if (recipe.image) {
    if (recipe.image.startsWith('/src/assets/images/')) {
      const filename = recipe.image.split('/').pop();
      return filename ? `/images/${filename}` : undefined;
    }
    return recipe.image;
  }

  return undefined;
}
