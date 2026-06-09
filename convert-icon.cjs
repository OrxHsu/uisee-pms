const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, 'build', 'icons', '512x512.png');
const iconsDir = path.join(__dirname, 'build', 'icons');
const publicDir = path.join(__dirname, 'public');

async function main() {
  // 从 512x512 上采样生成 1024x1024
  await sharp(src)
    .resize(1024, 1024, { fit: 'cover' })
    .png()
    .toFile(path.join(iconsDir, '1024x1024.png'));
  console.log('✓ Generated 1024x1024');

  // favicon.png (32x32)
  await sharp(src)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicon 32x32');

  // logo.png (128x128, 替换旧 logo)
  await sharp(src)
    .resize(128, 128, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Generated logo 128x128');
}

main().catch(err => { console.error(err); process.exit(1); });