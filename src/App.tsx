import { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import SettingsPanel from './components/SettingsPanel';
import ImageList from './components/ImageList';
import {
  ImageFile,
  CompressionSettings,
  DEFAULT_SETTINGS,
  compressImage,
  getOutputMimeType,
  getOutputExtension,
} from './utils/compressor';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesAdded = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.compressedPreview) {
          URL.revokeObjectURL(image.compressedPreview);
        }
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.compressedPreview) {
        URL.revokeObjectURL(img.compressedPreview);
      }
    });
    setImages([]);
  }, [images]);

  const handleClearCompressed = useCallback(() => {
    setImages(prev => {
      prev
        .filter(img => img.status === 'done')
        .forEach(img => {
          URL.revokeObjectURL(img.preview);
          if (img.compressedPreview) {
            URL.revokeObjectURL(img.compressedPreview);
          }
        });
      return prev.filter(img => img.status !== 'done');
    });
  }, []);

  const handleCompressAll = useCallback(async () => {
    setIsCompressing(true);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image.status === 'done') continue;

      // Update status to compressing
      setImages(prev =>
        prev.map((img, idx) => (idx === i ? { ...img, status: 'compressing' as const } : img))
      );

      try {
        const compressedBlob = await compressImage(image.file, settings);
        const compressedPreview = URL.createObjectURL(compressedBlob);

        setImages(prev =>
          prev.map((img, idx) =>
            idx === i
              ? {
                  ...img,
                  compressedBlob,
                  compressedSize: compressedBlob.size,
                  compressedPreview,
                  status: 'done' as const,
                }
              : img
          )
        );
      } catch (error) {
        setImages(prev =>
          prev.map((img, idx) =>
            idx === i
              ? {
                  ...img,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : '未知错误',
                }
              : img
          )
        );
      }
    }

    setIsCompressing(false);
  }, [images, settings]);

  const handleDownload = useCallback((image: ImageFile) => {
    if (!image.compressedBlob) return;

    const outputFormat = getOutputMimeType(image.file, settings.outputFormat);
    const ext = getOutputExtension(outputFormat);
    const originalName = image.file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${originalName}_compressed.${ext}`;

    saveAs(image.compressedBlob, fileName);
  }, [settings.outputFormat]);

  const handleDownloadAll = useCallback(async () => {
    const zip = new JSZip();
    const outputFormat = getOutputMimeType(images[0]?.file || new File([], ''), settings.outputFormat);
    const ext = getOutputExtension(outputFormat);

    const doneImages = images.filter(img => img.status === 'done' && img.compressedBlob);

    for (const image of doneImages) {
      const originalName = image.file.name.replace(/\.[^/.]+$/, '');
      const fileName = `${originalName}_compressed.${ext}`;
      zip.file(fileName, image.compressedBlob!);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `compressed_images_${Date.now()}.zip`);
  }, [images, settings.outputFormat]);

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images
    .filter(img => img.compressedSize)
    .reduce((sum, img) => sum + (img.compressedSize || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">在线图片压缩</h1>
                <p className="text-xs text-gray-500">免费 · 批量 · 浏览器端处理保护隐私</p>
              </div>
            </div>
            {totalCompressedSize > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  已节省 <span className="text-green-600 font-bold">{((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)}%</span>
                </p>
                <p className="text-xs text-gray-500">
                  {(totalOriginalSize / 1024 / 1024).toFixed(2)} MB → {(totalCompressedSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Settings */}
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                imageCount={images.filter(img => img.status === 'pending' || img.status === 'error').length}
                compressedCount={images.filter(img => img.status === 'done').length}
                onCompressAll={handleCompressAll}
                onClearAll={handleClearAll}
                onClearCompressed={handleClearCompressed}
                isCompressing={isCompressing}
              />
            </div>
          </div>

          {/* Right: Upload & Images */}
          <div className="xl:col-span-4 space-y-6">
            <ImageUploader onFilesAdded={handleFilesAdded} />
            <ImageList
              images={images}
              onRemove={handleRemoveImage}
              onDownload={handleDownload}
              onDownloadAll={handleDownloadAll}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="w-full max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">完全免费</h4>
              <p className="text-sm text-gray-500">无需注册，无使用次数限制</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">隐私保护</h4>
              <p className="text-sm text-gray-500">所有处理在浏览器本地完成，图片不会上传到服务器</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">批量处理</h4>
              <p className="text-sm text-gray-500">支持同时压缩多张图片，一键打包下载</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
