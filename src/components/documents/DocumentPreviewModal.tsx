import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  RefreshCw,
  FileQuestion,
  Lock,
  FileImage,
  FileCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { StoredDocument } from '../../types';
import { documentStorage } from '../../services/documentStorage';

interface DocumentPreviewModalProps {
  document: StoredDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: doc,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{
    blob: Blob;
    mimeType: string;
    fileName: string;
    size: number;
  } | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [pdfEmbedFailed, setPdfEmbedFailed] = useState(false);
  const currentUrlRef = useRef<string | null>(null);

  // Lock body scroll while modal is open & handle Escape key
  useEffect(() => {
    if (!doc) return;

    const originalOverflow = window.getComputedStyle(window.document.body).overflow;
    window.document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [doc, onClose]);

  // Load document file from storage
  const loadFile = async () => {
    if (!doc) return;
    setLoading(true);
    setError(null);
    setPdfEmbedFailed(false);
    setImageZoom(1);

    try {
      const data = await documentStorage.getDocumentFile(doc.id, doc);
      if (!data || !data.blob) {
        throw new Error('Document content could not be located in storage.');
      }

      setFileData(data);

      // Clean up previous URL if any
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }

      // Create fresh browser object URL
      const url = URL.createObjectURL(data.blob);
      currentUrlRef.current = url;
      setObjectUrl(url);

      // If text/markdown/json, load content for direct reading
      const isTextFile =
        data.mimeType.startsWith('text/') ||
        data.mimeType === 'application/json' ||
        /\.(txt|md|json|csv|log)$/i.test(doc.name);

      if (isTextFile) {
        try {
          const text = await data.blob.text();
          setTextContent(text);
        } catch {
          setTextContent(null);
        }
      } else {
        setTextContent(null);
      }
    } catch (err: any) {
      console.error('Failed to load document file:', err);
      setError("We couldn't open this document right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFile();

    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, [doc?.id]);

  if (!doc) return null;

  const mime = fileData?.mimeType || '';
  const isPdf = mime === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
  const isImage =
    mime.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(doc.name);
  const isText =
    (mime.startsWith('text/') || mime === 'application/json' || /\.(txt|md|json|csv|log)$/i.test(doc.name)) &&
    !isImage;

  // Direct safe download trigger
  const handleDownloadClick = () => {
    if (!objectUrl) return;
    const a = window.document.createElement('a');
    a.href = objectUrl;
    a.download = fileData?.fileName || doc.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl h-[92vh] max-h-[880px] bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] flex flex-col overflow-hidden text-[var(--bloom-text)] animate-scale-up">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] flex items-center justify-between gap-3 shrink-0">
          {/* Document metadata info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] flex items-center justify-center shrink-0">
              {isPdf ? (
                <FileText className="w-5 h-5 text-rose-500" />
              ) : isImage ? (
                <FileImage className="w-5 h-5 text-purple-500" />
              ) : isText ? (
                <FileCode className="w-5 h-5 text-sky-500" />
              ) : (
                <FileQuestion className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md text-[var(--bloom-text)]"
                  title={doc.name}
                >
                  {doc.name}
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] shrink-0">
                  {doc.category}
                </span>
              </div>
              <p className="text-[10px] text-[var(--bloom-text-muted)] truncate mt-0.5">
                {fileData ? documentStorage.formatFileSize(fileData.size) : doc.size} · Uploaded {doc.dateUploaded}
              </p>
            </div>
          </div>

          {/* Action Controls: ⬇️ Download, ↗️ Open, ✕ Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
              disabled={loading || !objectUrl}
              className="px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] hover:border-[var(--bloom-primary)] hover:text-[var(--bloom-primary)] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Download file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Open in New Tab Link Button */}
            {objectUrl ? (
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] hover:border-[var(--bloom-primary)] hover:text-[var(--bloom-primary)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Open in new browser tab"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open</span>
              </a>
            ) : (
              <button
                disabled
                className="px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] text-xs font-bold flex items-center gap-1.5 opacity-40 cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-400 text-xs font-semibold transition-colors cursor-pointer"
              title="Close document viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-[var(--bloom-bg)] p-3 sm:p-5 overflow-auto flex flex-col justify-center items-center relative">
          {/* 1. Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-[var(--bloom-primary)] animate-spin" />
              <p className="text-xs font-semibold text-[var(--bloom-text)]">
                Loading and preparing document preview...
              </p>
              <p className="text-[10px] text-[var(--bloom-text-muted)]">
                Accessing local secure vault
              </p>
            </div>
          )}

          {/* 2. Error State */}
          {!loading && error && (
            <div className="p-6 max-w-md w-full rounded-3xl bg-[var(--bloom-card)] border border-rose-300 dark:border-rose-900/60 shadow-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--bloom-text)]">
                  {error}
                </h4>
                <p className="text-xs text-[var(--bloom-text-muted)]">
                  The file content could not be displayed directly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={loadFile}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--bloom-primary)] hover:bg-[var(--bloom-primary-hover)] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                {objectUrl && (
                  <button
                    onClick={handleDownloadClick}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--bloom-border)] hover:bg-[var(--bloom-card-subtle)] cursor-pointer"
                  >
                    Download
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* 3. Successful Previews */}
          {!loading && !error && objectUrl && (
            <>
              {/* PDF Preview: Uses standard <object> with rich embedded card fallback */}
              {isPdf && (
                <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-[var(--bloom-border)] bg-stone-900 shadow-inner relative">
                  {!pdfEmbedFailed ? (
                    <object
                      data={objectUrl}
                      type="application/pdf"
                      className="w-full h-full rounded-2xl border-0 bg-stone-900"
                      onError={() => setPdfEmbedFailed(true)}
                    >
                      {/* Fallback if browser/iframe environment blocks inline PDF plugins */}
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--bloom-card)] text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="space-y-1 max-w-md">
                          <h4 className="text-base font-bold text-[var(--bloom-text)]">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-[var(--bloom-text-muted)]">
                            PDF is ready for viewing. Click below to view in full resolution or download.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <a
                            href={objectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-md flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open PDF in Full View</span>
                          </a>
                          <button
                            onClick={handleDownloadClick}
                            className="px-4 py-2.5 rounded-2xl text-xs font-semibold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)] text-[var(--bloom-text)] flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </object>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--bloom-card)] text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 max-w-md">
                        <h4 className="text-base font-bold text-[var(--bloom-text)]">
                          {doc.name}
                        </h4>
                        <p className="text-xs text-[var(--bloom-text-muted)]">
                          PDF document loaded successfully. Tap below to inspect or save.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <a
                          href={objectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open PDF in New Tab</span>
                        </a>
                        <button
                          onClick={handleDownloadClick}
                          className="px-4 py-2.5 rounded-2xl text-xs font-semibold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)] text-[var(--bloom-text)] flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {isImage && (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 relative select-none">
                  {/* Zoom controls floating bar */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg">
                    <button
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono font-bold px-1.5">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setImageZoom(1)}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      title="Reset zoom"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                    <img
                      src={objectUrl}
                      alt={doc.name}
                      style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                      className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] transition-transform duration-150"
                      onError={() => setError('Image rendering failed. The image file may be corrupted.')}
                    />
                  </div>
                </div>
              )}

              {/* Text / Markdown / Code Preview */}
              {isText && textContent !== null && (
                <div className="w-full h-full max-h-[75vh] overflow-y-auto rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] p-5 text-left font-mono text-xs leading-relaxed text-[var(--bloom-text)] whitespace-pre-wrap select-text">
                  {textContent}
                </div>
              )}

              {/* Unsupported Preview Fallback */}
              {!isPdf && !isImage && (!isText || textContent === null) && (
                <div className="p-8 max-w-md w-full rounded-3xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] text-center space-y-4 shadow-md">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                    <FileQuestion className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[var(--bloom-text)]">
                      This file type cannot be previewed inside Bloom.
                    </h4>
                    <p className="text-xs text-[var(--bloom-text-muted)] leading-relaxed">
                      You can open or download the file to inspect it in your computer's native viewer.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <a
                      href={objectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open File</span>
                    </a>
                    <button
                      onClick={handleDownloadClick}
                      className="px-4 py-2.5 rounded-2xl text-xs font-semibold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)] flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Notes & Privacy Indicator */}
        <div className="px-5 py-3 border-t border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--bloom-text-muted)] shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted local storage • Private & isolated to your device</span>
          </div>
          {doc.notes && (
            <div className="italic truncate max-w-sm">
              Note: {doc.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
