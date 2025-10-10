import path from 'path';
import { createHash } from 'crypto';

// Allowed file types and size limits
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates file upload based on MIME type and size
 * @param file The file to validate
 * @returns Boolean indicating if file is valid
 */
export function validateFileUpload(file: { 
  mimetype: string; 
  size: number;
  originalname: string;
}): boolean {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
  }
  
  return true;
}

/**
 * Sanitizes a filename to prevent path traversal attacks
 * @param filename Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components and special characters
  const sanitized = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '');
  
  // Add a unique hash to prevent overwriting
  const hash = createHash('md5')
    .update(filename + Date.now().toString())
    .digest('hex')
    .substring(0, 8);
    
  // Combine hash with sanitized name
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext);
  return `${name}-${hash}${ext}`;
}

/**
 * Handles file upload with proper validation and sanitization
 * @param file The file to process
 * @returns Object with storage information
 */
export async function handleFileUpload(file: {
  mimetype: string;
  size: number;
  originalname: string;
  buffer: Buffer;
}): Promise<{ filename: string; path: string; url: string }> {
  // Validate file
  validateFileUpload(file);
  
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.originalname);
  
  // In production, you would upload to S3/Cloudinary here
  // This is a placeholder for local storage
  const storagePath = path.join('uploads', sanitizedFilename);
  
  // Return file information
  return {
    filename: sanitizedFilename,
    path: storagePath,
    url: `/uploads/${sanitizedFilename}`
  };
}