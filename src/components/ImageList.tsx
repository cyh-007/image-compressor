import { ImageFile } from '../utils/compressor';
import ImageItem from './ImageItem';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onDownload: (image: ImageFile) => void;
  onDownloadAll: () => void;
}

export default function ImageList({ images, onRemove, onDownload, onDownloadAll }: ImageListProps) {
  const compressedCount = images.filter(img => img.status === 'done').length;

  if (images.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          图片列表 ({images.length} 张)
        </h3>
        {compressedCount > 0 && (
          <button
            onClick={onDownloadAll}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m0 0v8m0-8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            全部下载 (ZIP)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map(image => (
          <ImageItem
            key={image.id}
            image={image}
            onRemove={onRemove}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
