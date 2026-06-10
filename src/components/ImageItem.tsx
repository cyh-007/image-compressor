import { useState } from 'react';
import { ImageFile, formatFileSize, getCompressionRatio } from '../utils/compressor';
import ImageCompare from './ImageCompare';

interface ImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onDownload: (image: ImageFile) => void;
}

export default function ImageItem({ image, onRemove, onDownload }: ImageItemProps) {
  const [showComparison, setShowComparison] = useState(false);

  const compressionRatio = image.compressedSize
    ? getCompressionRatio(image.originalSize, image.compressedSize)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 图片预览 */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden group">
        <img
          src={image.preview}
          alt={image.file.name}
          className="w-full h-full object-cover"
        />
        {image.status === 'compressing' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {image.status === 'done' && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium mr-2 transition-colors"
            >
              对比
            </button>
            <button
              onClick={() => onDownload(image)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              下载
            </button>
          </div>
        )}
        {image.status === 'done' && compressionRatio && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{compressionRatio}
          </div>
        )}
      </div>

      {/* 图片信息 */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 truncate" title={image.file.name}>
          {image.file.name}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{formatFileSize(image.originalSize)}</span>
          {image.compressedSize && (
            <>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m0 0l-7-7m7 7V5" />
              </svg>
              <span className="text-green-600 font-medium">{formatFileSize(image.compressedSize)}</span>
            </>
          )}
        </div>

        {/* 对比弹窗 - 使用滑块对比 */}
        {showComparison && image.compressedPreview && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowComparison(false)}>
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-gray-800">压缩对比</h3>
                <button onClick={() => setShowComparison(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-center gap-4 mb-4 text-sm">
                  <span className="text-gray-600">原始: <span className="font-medium">{formatFileSize(image.originalSize)}</span></span>
                  <span className="text-green-600">压缩后: <span className="font-medium">{formatFileSize(image.compressedSize!)}</span></span>
                  <span className="text-blue-600">节省: <span className="font-bold">-{compressionRatio}</span></span>
                </div>
                <div className="w-full h-[60vh]">
                  <ImageCompare
                    beforeImage={image.preview}
                    afterImage={image.compressedPreview}
                    beforeLabel={`原始 (${formatFileSize(image.originalSize)})`}
                    afterLabel={`压缩后 (${formatFileSize(image.compressedSize!)})`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 删除按钮 */}
      <button
        onClick={() => onRemove(image.id)}
        className="absolute top-2 left-2 bg-black/50 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        title="移除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
