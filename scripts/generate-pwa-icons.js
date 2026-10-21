import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

function createSvg(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.15 : size * 0.05;
  const contentSize = size - padding * 2;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18181b" />
        <stop offset="50%" stop-color="#09090b" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>
      <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="40%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#fbbf24" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${size * 0.02}" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${size}" height="${size}" fill="url(#bgGrad)" rx="${isMaskable ? 0 : size * 0.22}" />
    <circle cx="${size / 2}" cy="${size / 2}" r="${contentSize * 0.45}" fill="url(#glowGrad)" />

    <!-- Center Icon Group -->
    <g transform="translate(${size / 2}, ${size / 2}) scale(${contentSize / 200})" filter="url(#glow)">
      <!-- Cocktail Stirrer / Dynamic S-Swirl -->
      <path d="M-20 -70 C 40 -80, 70 -30, 20 0 C -40 30, -30 80, 40 70" 
            fill="none" 
            stroke="url(#flameGrad)" 
            stroke-width="18" 
            stroke-linecap="round" />
      
      <!-- Sparkle / Star 1 -->
      <path d="M-35 -40 Q -35 -25 -20 -25 Q -35 -25 -35 -10 Q -35 -25 -50 -25 Q -35 -25 -35 -40 Z" 
            fill="#fbbf24" />
      
      <!-- Sparkle / Star 2 -->
      <path d="M45 20 Q 45 32 57 32 Q 45 32 45 44 Q 45 32 33 32 Q 45 32 45 20 Z" 
            fill="#f97316" />

      <!-- Center Flame Diamond -->
      <polygon points="0,-15 15,0 0,15 -15,0" fill="#ffffff" opacity="0.9" />
    </g>
  </svg>
  `;
}

async function run() {
  console.log('Generating PWA icons with sharp...');

  const targets = [
    { name: 'icon-192.png', size: 192, maskable: false },
    { name: 'icon-512.png', size: 512, maskable: false },
    { name: 'icon-maskable-192.png', size: 192, maskable: true },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png', size: 180, maskable: false },
    { name: 'favicon-32x32.png', size: 32, maskable: false },
    { name: 'favicon-16x16.png', size: 16, maskable: false },
  ];

  for (const t of targets) {
    const svg = createSvg(t.size, t.maskable);
    const dest = path.join(publicDir, t.name);
    await sharp(Buffer.from(svg))
      .resize(t.size, t.size)
      .png()
      .toFile(dest);
    console.log(`✓ Generated ${t.name} (${t.size}x${t.size})`);
  }

  // Also write app-icon.svg
  fs.writeFileSync(path.join(publicDir, 'app-icon.svg'), createSvg(512, false).trim());
  console.log('✓ Generated app-icon.svg');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
