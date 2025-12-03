#!/usr/bin/env node

/**
 * Incremental deployment script that only syncs changed files
 * Compares local files with remote files using checksums
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEPLOY_HOST = process.env.DEPLOY_HOST;
const DEPLOY_USER = process.env.DEPLOY_USER;
const DEPLOY_SSH_KEY = process.env.DEPLOY_SSH_KEY;
const DEPLOY_PORT = process.env.DEPLOY_PORT || '22';
const DEPLOY_REMOTE_PATH = process.env.DEPLOY_REMOTE_PATH;
const DIST_DIR = process.env.DIST_DIR || 'dist';

if (!DEPLOY_HOST || !DEPLOY_USER || !DEPLOY_SSH_KEY || !DEPLOY_REMOTE_PATH) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Write SSH key to temporary file
const sshKeyPath = path.join(__dirname, '.deploy_key');
fs.writeFileSync(sshKeyPath, DEPLOY_SSH_KEY, { mode: 0o600 });
process.on('exit', () => {
  if (fs.existsSync(sshKeyPath)) {
    fs.unlinkSync(sshKeyPath);
  }
});

const sshOptions = `-i ${sshKeyPath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${DEPLOY_PORT}`;
const sshCmd = (command) => `ssh ${sshOptions} ${DEPLOY_USER}@${DEPLOY_HOST} "${command}"`;
const scpCmd = (source, target) => `scp ${sshOptions} ${source} ${DEPLOY_USER}@${DEPLOY_HOST}:${target}`;

// Calculate MD5 checksum of a file
function getFileChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get all files recursively from a directory
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

// Get remote file checksums via SSH
function getRemoteFileChecksums() {
  try {
    const command = `find "${DEPLOY_REMOTE_PATH}" -type f -exec md5sum {} \\; 2>/dev/null | sed "s|${DEPLOY_REMOTE_PATH}/||"`;
    const output = execSync(sshCmd(command), { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    const checksums = {};
    const lines = output.trim().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const match = line.match(/^([a-f0-9]{32})\s+(.+)$/);
      if (match) {
        const [, checksum, filePath] = match;
        checksums[filePath] = checksum;
      }
    }
    
    return checksums;
  } catch (error) {
    // If directory doesn't exist or is empty, return empty object
    return {};
  }
}

// Ensure remote directory exists
function ensureRemoteDirectory() {
  try {
    execSync(sshCmd(`mkdir -p "${DEPLOY_REMOTE_PATH}"`), { stdio: 'ignore' });
  } catch (error) {
    console.error('Failed to create remote directory:', error.message);
    process.exit(1);
  }
}

// Upload a single file
function uploadFile(localPath, remotePath) {
  const remoteDir = path.dirname(remotePath);
  const remoteFullPath = path.join(DEPLOY_REMOTE_PATH, remotePath);
  
  // Ensure remote directory exists
  if (remoteDir !== '.') {
    try {
      execSync(sshCmd(`mkdir -p "${path.join(DEPLOY_REMOTE_PATH, remoteDir)}"`), { stdio: 'ignore' });
    } catch (error) {
      console.error(`Failed to create remote directory for ${remotePath}:`, error.message);
      return false;
    }
  }
  
  try {
    execSync(scpCmd(localPath, remoteFullPath), { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error(`Failed to upload ${remotePath}:`, error.message);
    return false;
  }
}

// Delete a remote file
function deleteRemoteFile(remotePath) {
  const remoteFullPath = path.join(DEPLOY_REMOTE_PATH, remotePath);
  try {
    execSync(sshCmd(`rm -f "${remoteFullPath}"`), { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error(`Failed to delete ${remotePath}:`, error.message);
    return false;
  }
}

// Main deployment logic
async function main() {
  console.log('Starting incremental deployment...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Directory ${DIST_DIR} does not exist`);
    process.exit(1);
  }
  
  ensureRemoteDirectory();
  
  // Get local files and their checksums
  console.log('Scanning local files...');
  const localFiles = getAllFiles(DIST_DIR);
  const localChecksums = {};
  
  for (const file of localFiles) {
    const fullPath = path.join(DIST_DIR, file);
    localChecksums[file] = getFileChecksum(fullPath);
  }
  
  console.log(`Found ${localFiles.length} local files`);
  
  // Get remote file checksums
  console.log('Fetching remote file checksums...');
  const remoteChecksums = getRemoteFileChecksums();
  console.log(`Found ${Object.keys(remoteChecksums).length} remote files`);
  
  // Determine what needs to be uploaded, updated, or deleted
  const toUpload = [];
  const toUpdate = [];
  const toDelete = [];
  
  // Check local files
  for (const file of localFiles) {
    const localChecksum = localChecksums[file];
    const remoteChecksum = remoteChecksums[file];
    
    if (!remoteChecksum) {
      toUpload.push(file);
    } else if (localChecksum !== remoteChecksum) {
      toUpdate.push(file);
    }
  }
  
  // Check for files that need to be deleted
  for (const remoteFile of Object.keys(remoteChecksums)) {
    if (!localChecksums[remoteFile]) {
      toDelete.push(remoteFile);
    }
  }
  
  console.log(`\nFiles to upload: ${toUpload.length}`);
  console.log(`Files to update: ${toUpdate.length}`);
  console.log(`Files to delete: ${toDelete.length}`);
  
  if (toUpload.length === 0 && toUpdate.length === 0 && toDelete.length === 0) {
    console.log('\nNo changes detected. Deployment skipped.');
    return;
  }
  
  // Upload new files
  if (toUpload.length > 0) {
    console.log(`\nUploading ${toUpload.length} new files...`);
    for (const file of toUpload) {
      const localPath = path.join(DIST_DIR, file);
      if (uploadFile(localPath, file)) {
        console.log(`  ✓ ${file}`);
      }
    }
  }
  
  // Update changed files
  if (toUpdate.length > 0) {
    console.log(`\nUpdating ${toUpdate.length} changed files...`);
    for (const file of toUpdate) {
      const localPath = path.join(DIST_DIR, file);
      if (uploadFile(localPath, file)) {
        console.log(`  ✓ ${file}`);
      }
    }
  }
  
  // Delete removed files
  if (toDelete.length > 0) {
    console.log(`\nDeleting ${toDelete.length} removed files...`);
    for (const file of toDelete) {
      if (deleteRemoteFile(file)) {
        console.log(`  ✓ ${file}`);
      }
    }
  }
  
  // Clean up empty directories on remote
  console.log('\nCleaning up empty directories...');
  try {
    execSync(sshCmd(`find "${DEPLOY_REMOTE_PATH}" -type d -empty -delete 2>/dev/null || true`), { stdio: 'ignore' });
  } catch (error) {
    // Ignore errors
  }
  
  console.log('\nDeployment completed successfully!');
}

main().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
