/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('sharp not installed. Run: npm i -D sharp', e);
  process.exit(1);
}

const src = path.join(__dirname, '..', 'public', 'vault-bg.jpg');
const outWebp = path.join(__dirname, '..', 'public', 'vault-bg.webp');
const outSmall = path.join(__dirname, '..', 'public', 'vault-bg-small.webp');

(async () => {
  if (!fs.existsSync(src)) {
    console.error('Source image not found:', src);
    process.exit(1);
  }

  await sharp(src)
    .resize({ width: 1600 })
    .webp({ quality: 80 })
    .toFile(outWebp);
  await sharp(src)
    .resize({ width: 900 })
    .webp({ quality: 72 })
    .toFile(outSmall);
  console.log('Generated', outWebp, outSmall);
})();
