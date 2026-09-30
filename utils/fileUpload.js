'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');


// ============================================================
// Ensure directory exists
// ============================================================

const ensureDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true,
        });
    }

    return dir;
};


// ============================================================
// Convert base64 image -> file
// ============================================================

const saveBase64File = (
    base64Data,
    folder,
    filenamePrefix = 'file'
) => {

    if (!base64Data || typeof base64Data !== 'string') {
        return null;
    }

    // Already an uploaded path
    if (!base64Data.startsWith('data:')) {
        return base64Data;
    }

    const match = base64Data.match(
        /^data:([^;]+);base64,(.+)$/
    );

    if (!match) {
        throw new Error('Invalid base64 file format');
    }

    const mimeType = match[1];
    const base64String = match[2];

    const mimeToExtension = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',

        'application/pdf': 'pdf',

        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'video/quicktime': 'mov',

        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
    };

    const extension = mimeToExtension[mimeType];

    if (!extension) {
        throw new Error(
            `Unsupported file type: ${mimeType}`
        );
    }

    const buffer = Buffer.from(
        base64String,
        'base64'
    );

    const uploadDir = path.join(
        UPLOAD_ROOT,
        folder
    );

    ensureDirectory(uploadDir);

    const uniqueName =
        `${filenamePrefix}_${Date.now()}_` +
        `${crypto.randomBytes(6).toString('hex')}.` +
        extension;

    const absolutePath = path.join(
        uploadDir,
        uniqueName
    );

    fs.writeFileSync(
        absolutePath,
        buffer
    );

    // Always return URL/path, never base64
    return `/uploads/${folder}/${uniqueName}`;
};


// ============================================================
// Delete uploaded file
// ============================================================

const deleteFile = (filePath) => {

    if (!filePath || typeof filePath !== 'string') {
        return false;
    }

    // Only delete our own uploads
    if (!filePath.startsWith('/uploads/')) {
        return false;
    }

    const relativePath = filePath
        .replace(/^\/+/, '');

    const absolutePath = path.resolve(
        process.cwd(),
        relativePath
    );

    const uploadRoot = path.resolve(
        UPLOAD_ROOT
    );

    // Security: don't allow deleting outside uploads
    if (
        absolutePath !== uploadRoot &&
        !absolutePath.startsWith(uploadRoot + path.sep)
    ) {
        return false;
    }

    if (!fs.existsSync(absolutePath)) {
        return false;
    }

    fs.unlinkSync(absolutePath);

    return true;
};


// ============================================================
// Replace existing file
// ============================================================

const replaceFile = (
    newFile,
    oldFile,
    folder,
    filenamePrefix = 'file'
) => {

    // No new file supplied
    if (!newFile) {
        return oldFile || null;
    }

    // New file is already an existing path
    if (
        typeof newFile === 'string' &&
        !newFile.startsWith('data:')
    ) {
        return newFile;
    }

    // Save new file first
    const newPath = saveBase64File(
        newFile,
        folder,
        filenamePrefix
    );

    // Delete old file only after new file was saved
    if (
        oldFile &&
        oldFile !== newPath
    ) {
        deleteFile(oldFile);
    }

    return newPath;
};


// ============================================================
// Delete entire folder
// ============================================================

const deleteFolder = (folder) => {

    if (!folder || typeof folder !== 'string') {
        return false;
    }

    const target = path.resolve(
        UPLOAD_ROOT,
        folder
    );

    const uploadRoot = path.resolve(
        UPLOAD_ROOT
    );

    // Security check
    if (
        target === uploadRoot ||
        !target.startsWith(uploadRoot + path.sep)
    ) {
        return false;
    }

    if (!fs.existsSync(target)) {
        return false;
    }

    fs.rmSync(target, {
        recursive: true,
        force: true,
    });

    return true;
};

const getImageUrl = (filePath) => {
    if (!filePath || typeof filePath !== 'string') {
        return null;
    }

    // Already a full URL
    if (/^https?:\/\//i.test(filePath)) {
        return filePath;
    }

    // Convert relative upload path to full URL
    const cleanPath = filePath.replace(/^\/+/, '');

    const baseUrl =
        process.env.FILE_BASE_URL ||
        process.env.APP_URL ||
        '';

    if (!baseUrl) {
        return `/${cleanPath}`;
    }
    console.log(`${baseUrl.replace(/\/+$/, '')}/${cleanPath}`);
    
    return `${baseUrl.replace(/\/+$/, '')}/${cleanPath}`;
};

module.exports = {
    UPLOAD_ROOT,
    ensureDirectory,
    saveBase64File,
    deleteFile,
    replaceFile,
    deleteFolder,
    getImageUrl,
};