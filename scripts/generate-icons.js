import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Clean SVG for MenúListo with solid background, plate with appetizing food (Verde, Amarillo, Naranja, Coral), and prominent Checkmark
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#46C758" />
      <stop offset="100%" stop-color="#2DA03E" />
    </radialGradient>
    <filter id="plateShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#154B1D" flood-opacity="0.35" />
    </filter>
    <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.25" />
    </filter>
    <linearGradient id="foodBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE885" />
      <stop offset="100%" stop-color="#FFD447" />
    </linearGradient>
    <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7070" />
      <stop offset="100%" stop-color="#FF5C5C" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA25B" />
      <stop offset="100%" stop-color="#FF8A3D" />
    </linearGradient>
  </defs>

  <!-- Solid vibrant green brand background -->
  <rect width="512" height="512" rx="0" fill="url(#bgGlow)" />

  <!-- Subtle corner sparkles / accents -->
  <circle cx="96" cy="100" r="6" fill="#FFFDF7" opacity="0.4" />
  <circle cx="416" cy="112" r="8" fill="#FFD447" opacity="0.45" />

  <!-- Steam rising from the warm dish -->
  <path d="M 220 120 Q 232 95 224 72" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.55" />
  <path d="M 256 110 Q 268 85 260 62" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.65" />
  <path d="M 292 120 Q 304 95 296 72" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.55" />

  <!-- Food Plate Outer Body (Ceramic White) -->
  <g filter="url(#plateShadow)">
    <!-- Plate base / rim -->
    <ellipse cx="256" cy="275" rx="160" ry="145" fill="#FFFFFF" />
    <ellipse cx="256" cy="275" rx="146" ry="132" fill="#F7FAF5" />
    <ellipse cx="256" cy="275" rx="130" ry="118" fill="#EBF2E8" />

    <!-- Plate interior / food bed -->
    <ellipse cx="256" cy="275" rx="118" ry="106" fill="url(#foodBase)" />

    <!-- Food elements: warm hearty dish layers -->
    <!-- Hearty stew / roasted portions (Coral & Orange) -->
    <path d="M 175 255 Q 210 220 255 240 Q 295 225 325 260 Q 290 310 235 305 Q 185 300 175 255 Z" fill="url(#orangeGrad)" />
    
    <!-- Delicious grilled / tomato chunks (Coral) -->
    <ellipse cx="215" cy="255" rx="28" ry="24" fill="url(#coralGrad)" />
    <ellipse cx="275" cy="250" rx="32" ry="26" fill="url(#coralGrad)" />
    <ellipse cx="235" cy="285" rx="24" ry="20" fill="url(#coralGrad)" />

    <!-- Golden roasted potatoes / grains (Yellow) -->
    <ellipse cx="190" cy="275" rx="20" ry="17" fill="#FFE27A" />
    <ellipse cx="295" cy="280" rx="22" ry="19" fill="#FFE27A" />
    <ellipse cx="245" cy="235" rx="18" ry="16" fill="#FFF2B2" />

    <!-- Fresh herbs garnish (Verde) -->
    <path d="M 245 265 Q 255 252 268 258 Q 262 272 245 265 Z" fill="#2E9E3E" />
    <path d="M 235 262 Q 225 250 216 256 Q 220 270 235 262 Z" fill="#268233" />
    <circle cx="260" cy="254" r="3.5" fill="#FFFFFF" opacity="0.8" />
  </g>

  <!-- Big Prominent Checkmark Badge ("Listo!") -->
  <g filter="url(#badgeShadow)">
    <!-- Badge outer rim -->
    <circle cx="345" cy="345" r="72" fill="#FFFFFF" />
    <!-- Badge colored core -->
    <circle cx="345" cy="345" r="62" fill="url(#coralGrad)" />
    <!-- Inner soft border -->
    <circle cx="345" cy="345" r="60" fill="none" stroke="#FF8A3D" stroke-width="4" opacity="0.6" />
    <!-- Pure white bold checkmark -->
    <path d="M 314 345 L 336 367 L 380 321" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

// Maskable version with slightly tighter elements inside the 80% safe zone circle (center 408px)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlowM" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#46C758" />
      <stop offset="100%" stop-color="#2DA03E" />
    </radialGradient>
    <filter id="plateShadowM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#154B1D" flood-opacity="0.35" />
    </filter>
    <filter id="badgeShadowM" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.25" />
    </filter>
    <linearGradient id="foodBaseM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE885" />
      <stop offset="100%" stop-color="#FFD447" />
    </linearGradient>
    <linearGradient id="coralGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7070" />
      <stop offset="100%" stop-color="#FF5C5C" />
    </linearGradient>
    <linearGradient id="orangeGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA25B" />
      <stop offset="100%" stop-color="#FF8A3D" />
    </linearGradient>
  </defs>

  <!-- Full-bleed Solid background for Android masking -->
  <rect width="512" height="512" fill="url(#bgGlowM)" />

  <g transform="translate(25.6, 25.6) scale(0.9)">
    <!-- Steam -->
    <path d="M 220 120 Q 232 95 224 72" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.55" />
    <path d="M 256 110 Q 268 85 260 62" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.65" />
    <path d="M 292 120 Q 304 95 296 72" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.55" />

    <!-- Food Plate -->
    <g filter="url(#plateShadowM)">
      <ellipse cx="256" cy="275" rx="160" ry="145" fill="#FFFFFF" />
      <ellipse cx="256" cy="275" rx="146" ry="132" fill="#F7FAF5" />
      <ellipse cx="256" cy="275" rx="130" ry="118" fill="#EBF2E8" />
      <ellipse cx="256" cy="275" rx="118" ry="106" fill="url(#foodBaseM)" />

      <path d="M 175 255 Q 210 220 255 240 Q 295 225 325 260 Q 290 310 235 305 Q 185 300 175 255 Z" fill="url(#orangeGradM)" />
      
      <ellipse cx="215" cy="255" rx="28" ry="24" fill="url(#coralGradM)" />
      <ellipse cx="275" cy="250" rx="32" ry="26" fill="url(#coralGradM)" />
      <ellipse cx="235" cy="285" rx="24" ry="20" fill="url(#coralGradM)" />

      <ellipse cx="190" cy="275" rx="20" ry="17" fill="#FFE27A" />
      <ellipse cx="295" cy="280" rx="22" ry="19" fill="#FFE27A" />
      <ellipse cx="245" cy="235" rx="18" ry="16" fill="#FFF2B2" />

      <path d="M 245 265 Q 255 252 268 258 Q 262 272 245 265 Z" fill="#2E9E3E" />
      <path d="M 235 262 Q 225 250 216 256 Q 220 270 235 262 Z" fill="#268233" />
    </g>

    <!-- Badge -->
    <g filter="url(#badgeShadowM)">
      <circle cx="345" cy="345" r="72" fill="#FFFFFF" />
      <circle cx="345" cy="345" r="62" fill="url(#coralGradM)" />
      <circle cx="345" cy="345" r="60" fill="none" stroke="#FF8A3D" stroke-width="4" opacity="0.6" />
      <path d="M 314 345 L 336 367 L 380 321" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>
</svg>`;

async function generateAll() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);

  const svgBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 2. Generate 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png created');

  // 3. Generate 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png created');

  // 4. Generate Maskable 512x512 PNG
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ pwa-maskable-512x512.png created');

  // 5. Generate Apple Touch Icon (180x180 PNG)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png created');

  // 6. Generate Favicon (32x32 and 64x64 PNG & ICO)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // Use 32x32 png as favicon.ico directly (modern browsers handle PNG inside .ico or direct PNG)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Favicons created');

  console.log('All PWA and favicon icons generated successfully!');
}

generateAll().catch(err => {
  console.error(err);
  process.exit(1);
});
