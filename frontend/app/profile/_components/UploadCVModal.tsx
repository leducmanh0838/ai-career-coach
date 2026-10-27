/**
 * Copyright (c) 2026 AURA FARMING 20 PRO MAX
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
      <div className="bg-surface border border-border rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text transition"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-text mb-2">Tải lên CV để AI phân tích</h3>
        <p className="text-xs text-muted mb-4">
          Hỗ trợ định dạng PDF. Hệ thống sẽ chuyển sang trang theo dõi tiến trình xử lý real-time.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-border bg-surface-2 rounded-lg p-6 text-center hover:border-primary transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setTempFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-primary cursor-pointer"
            />
            {tempFile && (
              <p className="mt-2 text-xs text-green-600 font-medium truncate">
                Đã chọn: {tempFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted bg-surface-2 hover:opacity-80 rounded-sm border border-border transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tempFile}
              className="px-4 py-2 text-sm font-medium text-on-primary bg-primary hover:opacity-90 disabled:opacity-50 rounded-sm shadow-sm transition"
            >
              Tiếp tục & Phân tích ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}