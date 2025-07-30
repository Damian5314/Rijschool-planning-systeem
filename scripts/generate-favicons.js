const fs = require('fs');
const path = require('path');

// Create minimal valid PNG files (1x1 transparent pixel)
// This is a base64 encoded 1x1 transparent PNG
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOAAAAABJRU5ErkJggg==',
  'base64'
);

const publicDir = path.join(__dirname, '..', 'public');
const faviconSizes = ['16x16', '32x32', '192x192', '512x512'];

console.log('🖼️ Generating favicon PNG files...');

faviconSizes.forEach(size => {
  const filename = `favicon-${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  try {
    fs.writeFileSync(filepath, minimalPNG);
    console.log(`✅ Created ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to create ${filename}:`, error.message);
  }
});

console.log('🎉 Favicon generation completed!');