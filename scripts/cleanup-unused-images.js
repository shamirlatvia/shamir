import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const ARCHIVE_DIR = path.join(__dirname, '..', 'src', 'content', 'archive');
const TRANSLATIONS_FILE = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');
const HOMEPAGE_FILE = path.join(__dirname, '..', 'src', 'components', 'HomePage.tsx');
const EITC_COMPONENT = path.join(__dirname, '..', 'src', 'components', 'eitc.tsx');

function getAllImageFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllImageFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getImageUrlFromPath(filePath) {
  // Convert absolute path to URL path relative to public directory
  const publicDir = path.join(__dirname, '..', 'public');
  const relativePath = path.relative(publicDir, filePath);
  return '/' + relativePath.replace(/\\/g, '/');
}

function extractImageReferences(content) {
  const references = new Set();
  
  // Match markdown images: ![alt](url) or [![alt](thumb)](full)
  const markdownImages = content.matchAll(/!\[.*?\]\(([^)]+)\)/g);
  for (const match of markdownImages) {
    const url = match[1];
    // Remove query params and fragments
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.startsWith('/images/') || cleanUrl.startsWith('images/')) {
      references.add(cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
  }
  
  // Also match link URLs in markdown: [![alt](thumb)](link)
  // Extract the link part which might point to full-resolution images
  const markdownImageLinks = content.matchAll(/\[!\[.*?\]\([^)]+\)\]\(([^)]+)\)/g);
  for (const match of markdownImageLinks) {
    const url = match[1];
    const cleanUrl = url.split('?')[0].split('#')[0];
    // Check if it's a local image path (might be full-res version)
    if (cleanUrl.startsWith('/images/') || cleanUrl.startsWith('images/')) {
      references.add(cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
  }
  
  // Match HTML img tags: <img src="url">
  const htmlImages = content.matchAll(/<img[^>]+src=["']([^'"]+)["']/gi);
  for (const match of htmlImages) {
    const url = match[1];
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.startsWith('/images/') || cleanUrl.startsWith('images/')) {
      references.add(cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
  }
  
  // Match frontmatter image fields
  const frontmatterImages = content.matchAll(/image:\s*['"]([^'"]+)['"]/g);
  for (const match of frontmatterImages) {
    const url = match[1];
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.startsWith('/images/') || cleanUrl.startsWith('images/')) {
      references.add(cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
  }
  
  // Match in strings (for translations.ts and components)
  const stringImages = content.matchAll(/['"`]([^'"`]*\/images\/[^'"`]+)['"`]/g);
  for (const match of stringImages) {
    const url = match[1];
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.startsWith('/images/') || cleanUrl.startsWith('images/')) {
      references.add(cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
  }
  
  return Array.from(references);
}

async function main() {
  console.log('Scanning for image files...\n');
  
  // Get all image files
  const allImageFiles = getAllImageFiles(IMAGES_DIR);
  console.log(`Found ${allImageFiles.length} image files in public/images/\n`);
  
  // Collect all image references from codebase
  console.log('Scanning codebase for image references...\n');
  const allReferences = new Set();
  
  // Scan article files
  console.log('Scanning article files...');
  const articleFiles = fs.readdirSync(ARTICLES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(ARTICLES_DIR, file));
  
  for (const filePath of articleFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const refs = extractImageReferences(content);
    refs.forEach(ref => allReferences.add(ref));
  }
  
  // Scan archive files
  console.log('Scanning archive files...');
  if (fs.existsSync(ARCHIVE_DIR)) {
    const archiveFiles = fs.readdirSync(ARCHIVE_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(ARCHIVE_DIR, file));
    
    for (const filePath of archiveFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const refs = extractImageReferences(content);
      refs.forEach(ref => allReferences.add(ref));
    }
  }
  
  // Scan translations file
  console.log('Scanning translations file...');
  const translationsContent = fs.readFileSync(TRANSLATIONS_FILE, 'utf-8');
  const translationRefs = extractImageReferences(translationsContent);
  translationRefs.forEach(ref => allReferences.add(ref));
  
  // Scan HomePage component
  console.log('Scanning HomePage component...');
  const homepageContent = fs.readFileSync(HOMEPAGE_FILE, 'utf-8');
  const homepageRefs = extractImageReferences(homepageContent);
  homepageRefs.forEach(ref => allReferences.add(ref));
  
  // Scan EITC component
  console.log('Scanning EITC component...');
  const eitcContent = fs.readFileSync(EITC_COMPONENT, 'utf-8');
  const eitcRefs = extractImageReferences(eitcContent);
  eitcRefs.forEach(ref => allReferences.add(ref));
  
  console.log(`\nFound ${allReferences.size} unique image references\n`);
  
  // Map image files to their URL paths
  const imageFileMap = new Map();
  for (const imageFile of allImageFiles) {
    const urlPath = getImageUrlFromPath(imageFile);
    imageFileMap.set(urlPath, imageFile);
  }
  
  // Find unused images
  const usedImages = new Set();
  for (const ref of allReferences) {
    // Try exact match
    if (imageFileMap.has(ref)) {
      usedImages.add(imageFileMap.get(ref));
      continue;
    }
    
    // Try without leading slash
    const refWithoutSlash = ref.startsWith('/') ? ref.substring(1) : ref;
    if (imageFileMap.has('/' + refWithoutSlash)) {
      usedImages.add(imageFileMap.get('/' + refWithoutSlash));
      continue;
    }
    
    // Try with leading slash
    const refWithSlash = ref.startsWith('/') ? ref : '/' + ref;
    if (imageFileMap.has(refWithSlash)) {
      usedImages.add(imageFileMap.get(refWithSlash));
    }
  }
  
  const unusedImages = allImageFiles.filter(file => !usedImages.has(file));
  
  console.log(`=== Summary ===`);
  console.log(`Total images: ${allImageFiles.length}`);
  console.log(`Used images: ${usedImages.size}`);
  console.log(`Unused images: ${unusedImages.length}\n`);
  
  if (unusedImages.length === 0) {
    console.log('No unused images found!');
    return;
  }
  
  console.log('Unused images:');
  unusedImages.forEach(file => {
    const urlPath = getImageUrlFromPath(file);
    console.log(`  - ${urlPath}`);
  });
  
  console.log(`\nDeleting ${unusedImages.length} unused images...\n`);
  
  let deleted = 0;
  let failed = 0;
  
  for (const file of unusedImages) {
    try {
      fs.unlinkSync(file);
      deleted++;
      console.log(`  ✓ Deleted: ${getImageUrlFromPath(file)}`);
    } catch (error) {
      failed++;
      console.error(`  ✗ Failed to delete ${getImageUrlFromPath(file)}: ${error.message}`);
    }
  }
  
  // Clean up empty directories
  console.log('\nCleaning up empty directories...');
  function removeEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        removeEmptyDirs(fullPath);
        // Try to remove directory if it's now empty
        try {
          const dirEntries = fs.readdirSync(fullPath);
          if (dirEntries.length === 0) {
            fs.rmdirSync(fullPath);
            console.log(`  ✓ Removed empty directory: ${path.relative(IMAGES_DIR, fullPath)}`);
          }
        } catch (e) {
          // Directory not empty or other error, ignore
        }
      }
    }
  }
  
  removeEmptyDirs(IMAGES_DIR);
  
  console.log(`\n=== Cleanup Summary ===`);
  console.log(`Deleted: ${deleted}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
