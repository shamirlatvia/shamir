import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', '2020', '04');

// Create directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const EITC_IMAGES = [
  'http://shamir.lv/wp-content/uploads/2020/04/2017.04.27.Hol-Jipsy_002-1024x680.jpg',
  'http://shamir.lv/wp-content/uploads/2020/04/2.jpg',
  'http://shamir.lv/wp-content/uploads/2020/04/IMG_5350.jpg',
  'http://shamir.lv/wp-content/uploads/2020/04/IMG_5242.jpg',
  'http://shamir.lv/wp-content/uploads/2020/04/IMG_5226.jpg',
  'http://shamir.lv/wp-content/uploads/2020/04/2017.05.14.Hol-Gipsy_028-1024x794.jpg',
  'http://shamir.lv/wp-content/uploads/2020/04/eitc-logo.jpg',
];

async function downloadImage(url) {
  try {
    const urlObj = new URL(url);
    const filename = path.basename(urlObj.pathname);
    const localPath = path.join(IMAGES_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(localPath)) {
      console.log(`Skipping (already exists): ${filename}`);
      return true;
    }
    
    console.log(`Downloading: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.buffer();
    fs.writeFileSync(localPath, buffer);
    console.log(`  ✓ Saved to ${localPath}`);
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Downloading EITC images...\n');
  
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const url of EITC_IMAGES) {
    const result = await downloadImage(url);
    if (result === true) {
      const urlObj = new URL(url);
      const filename = path.basename(urlObj.pathname);
      const localPath = path.join(IMAGES_DIR, filename);
      if (fs.existsSync(localPath)) {
        if (fs.statSync(localPath).size > 0) {
          downloaded++;
        } else {
          skipped++;
        }
      }
    } else {
      failed++;
    }
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
