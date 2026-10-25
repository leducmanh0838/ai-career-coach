interface UploadCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempFile: File | null;
  setTempFile: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function UploadCVModal({ isOpen, onClose, tempFile, setTempFile, onSubmit }: UploadCVModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Tải lên CV để AI phân tích</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Hỗ trợ định dạng PDF. Hệ thống sẽ chuyển sang trang theo dõi tiến trình xử lý real-time.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setTempFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
            {tempFile && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium truncate">
                Đã chọn: {tempFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-md transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tempFile}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition"
            >
              Tiếp tục & Phân tích ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}