import { useState, useCallback, useRef } from 'react';
import { ImageFile } from '../utils/compressor';

interface ImageUploaderProps {
  onFilesAdded: (files: ImageFile[]) => void;
}

export default function ImageUploader({ onFilesAdded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    const newImages: ImageFile[] = imageFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'pending',
    }));

    onFilesAdded(newImages);
  }, [onFilesAdded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragging
          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex flex-col items-center gap-3">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
        </svg>
        <div>
          <p className="text-lg font-medium text-gray-700">
            拖拽图片到这里，或 <span className="text-blue-500">点击选择</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            支持 JPG、PNG、WebP、GIF、BMP 格式，可批量上传
          </p>
        </div>
      </div>
    </div>
  );
}
