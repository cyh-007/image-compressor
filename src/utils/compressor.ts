export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedPreview?: string;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
}

export interface CompressionSettings {
  quality: number; // 1-100
  outputFormat: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  resizeEnabled: boolean;
  maxWidth: number;
  maxHeight: number;
}

export const DEFAULT_SETTINGS: CompressionSettings = {
  quality: 80,
  outputFormat: 'original',
  resizeEnabled: false,
  maxWidth: 1920,
  maxHeight: 1080,
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getCompressionRatio(original: number, compressed: number | undefined): string {
  if (!compressed || original === 0) return '-%';
  if (compressed >= original) return '0%';
  const ratio = ((original - compressed) / original) * 100;
  return ratio.toFixed(1) + '%';
}

export function getOutputMimeType(file: File, format: CompressionSettings['outputFormat']): string {
  if (format === 'original') return file.type || 'image/jpeg';
  return format;
}

export function getOutputExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

export function compressImage(
  file: File,
  settings: CompressionSettings
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Resize if enabled
      if (settings.resizeEnabled) {
        if (width > settings.maxWidth) {
          height = (settings.maxWidth / width) * height;
          width = settings.maxWidth;
        }
        if (height > settings.maxHeight) {
          width = (settings.maxHeight / height) * width;
          height = settings.maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputFormat = getOutputMimeType(file, settings.outputFormat);
      const quality = settings.quality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        outputFormat,
        quality
      );

      // Clean up
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
