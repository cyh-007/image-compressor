import { CompressionSettings, DEFAULT_SETTINGS, formatFileSize } from '../utils/compressor';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  imageCount: number;
  onCompressAll: () => void;
  onClearAll: () => void;
  isCompressing: boolean;
}

export default function SettingsPanel({
  settings,
  onSettingsChange,
  imageCount,
  onCompressAll,
  onClearAll,
  isCompressing,
}: SettingsPanelProps) {
  const presets = [
    { label: '无损', quality: 100 },
    { label: '高', quality: 80 },
    { label: '中', quality: 60 },
    { label: '低', quality: 40 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">压缩设置</h3>

      {/* 质量调节 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">压缩质量</label>
          <span className="text-sm font-bold text-blue-600">{settings.quality}%</span>
        </div>
        <div className="flex gap-2 mb-3">
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => onSettingsChange({ ...settings, quality: preset.quality })}
              className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${
                settings.quality === preset.quality
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={settings.quality}
          onChange={e => onSettingsChange({ ...settings, quality: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* 输出格式 */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">输出格式</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'original', label: '原格式' },
            { value: 'image/jpeg', label: 'JPG' },
            { value: 'image/png', label: 'PNG' },
            { value: 'image/webp', label: 'WebP' },
          ].map(format => (
            <button
              key={format.value}
              onClick={() => onSettingsChange({ ...settings, outputFormat: format.value as CompressionSettings['outputFormat'] })}
              className={`py-2 text-sm rounded-lg transition-colors ${
                settings.outputFormat === format.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* 尺寸调整 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="resize"
            checked={settings.resizeEnabled}
            onChange={e => onSettingsChange({ ...settings, resizeEnabled: e.target.checked })}
            className="w-4 h-4 text-blue-500 rounded"
          />
          <label htmlFor="resize" className="text-sm font-medium text-gray-700">调整尺寸</label>
        </div>
        {settings.resizeEnabled && (
          <div className="grid grid-cols-2 gap-3 ml-6">
            <div>
              <label className="text-xs text-gray-500 block mb-1">最大宽度 (px)</label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={e => onSettingsChange({ ...settings, maxWidth: parseInt(e.target.value) || 1920 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">最大高度 (px)</label>
              <input
                type="number"
                value={settings.maxHeight}
                onChange={e => onSettingsChange({ ...settings, maxHeight: parseInt(e.target.value) || 1080 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCompressAll}
          disabled={imageCount === 0 || isCompressing}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isCompressing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              压缩中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              开始压缩 ({imageCount})
            </>
          )}
        </button>
        <button
          onClick={onClearAll}
          disabled={imageCount === 0}
          className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
        >
          清空
        </button>
      </div>
    </div>
  );
}
