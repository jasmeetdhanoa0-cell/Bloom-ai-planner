import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Search,
  ShieldCheck,
  Eye,
  Download,
  FileCheck,
  FileImage,
  FileCode,
  File,
  X,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { DocumentCategory, StoredDocument } from '../../types';
import { documentStorage } from '../../services/documentStorage';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { BloomDropdown, BloomDropdownOption } from '../common/BloomDropdown';

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteDocument, triggerCelebration } = useBloom();

  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<StoredDocument | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Education');
  const [uploadTags, setUploadTags] = useState('Academics');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: DocumentCategory[] = [
    'Education',
    'Scholarships',
    'Identity',
    'Applications',
    'Certificates',
    'Other',
  ];

  const categoryDropdownOptions: BloomDropdownOption<DocumentCategory>[] = categories.map((c) => ({
    value: c,
    label: c,
    emoji: c === 'Education' ? '🎓' : c === 'Scholarships' ? '🏆' : c === 'Identity' ? '🪪' : c === 'Applications' ? '📝' : c === 'Certificates' ? '📜' : '📁',
  }));

  const filteredDocs = documents.filter((doc) => {
    if (activeCategory !== 'All' && doc.category !== activeCategory) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    if (!uploadName.trim()) {
      setUploadName(file.name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = uploadName.trim() || selectedFile?.name || 'Untitled Document';

    setIsSaving(true);
    try {
      const fileSizeStr = selectedFile
        ? documentStorage.formatFileSize(selectedFile.size)
        : '1.2 MB';

      await addDocument({
        name: finalName,
        category: uploadCategory,
        size: fileSizeStr,
        file: selectedFile || undefined,
        fileType: selectedFile?.type,
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: uploadNotes.trim() || undefined,
      });

      setSelectedFile(null);
      setUploadName('');
      setUploadNotes('');
      setIsUploadOpen(false);
      triggerCelebration();
    } catch (err) {
      console.error('Error saving document:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectDownload = async (e: React.MouseEvent, doc: StoredDocument) => {
    e.stopPropagation();
    try {
      const data = await documentStorage.getDocumentFile(doc.id, doc);
      if (data && data.blob) {
        const url = URL.createObjectURL(data.blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = data.fileName || doc.name;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    deleteDocument(docId);
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
  };

  // Helper for document icon and extension badge
  const getDocumentTypeInfo = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || 'DOC';
    if (name.toLowerCase().endsWith('.pdf')) {
      return { icon: <FileText className="w-5 h-5 text-rose-500" />, badge: 'PDF', bg: 'bg-rose-500/10' };
    }
    if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) {
      return { icon: <FileImage className="w-5 h-5 text-purple-500" />, badge: ext, bg: 'bg-purple-500/10' };
    }
    if (/\.(txt|md|json|csv|log)$/i.test(name)) {
      return { icon: <FileCode className="w-5 h-5 text-sky-500" />, badge: ext, bg: 'bg-sky-500/10' };
    }
    return { icon: <File className="w-5 h-5 text-pink-500" />, badge: ext, bg: 'bg-pink-500/10' };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>📂</span>
            <span>Document Sanctuary</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Organize diplomas, ID scans, scholarship forms, and applications securely.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedFile(null);
            setUploadName('');
            setUploadNotes('');
            setIsUploadOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Mandatory Privacy Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
          <strong className="block font-bold">Privacy Guarantee:</strong>
          Documents stored in your Vault reside securely in your private, encrypted browser sandbox. They are never sent, analyzed, or shared without your explicit action.
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--bloom-card-subtle)] rounded-2xl border border-[var(--bloom-border)] overflow-x-auto shadow-2xs">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
            }`}
          >
            All ({documents.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                  : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--bloom-text-muted)]" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] text-xs text-[var(--bloom-text)] focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]/40"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] text-xs text-[var(--bloom-text-muted)] space-y-2">
            <span className="text-3xl block">📁</span>
            <p className="font-semibold text-sm text-[var(--bloom-text)]">No documents found in this category.</p>
            <p>Upload a PDF, scan, or note to keep it safe, private, and viewable anytime.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const typeInfo = getDocumentTypeInfo(doc.name);

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="p-5 rounded-3xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] hover:border-[var(--bloom-primary)]/70 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer text-left select-none"
              >
                <div className="space-y-2.5">
                  {/* Category and Delete */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)]">
                      {doc.category}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="text-[var(--bloom-text-muted)] hover:text-rose-500 p-1 rounded-lg opacity-70 group-hover:opacity-100 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon and Document Title */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className={`p-2.5 rounded-2xl ${typeInfo.bg} shrink-0`}>
                      {typeInfo.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[var(--bloom-text)] truncate group-hover:text-[var(--bloom-primary)] transition-colors" title={doc.name}>
                          {doc.name}
                        </h3>
                      </div>
                      <p className="text-[10px] text-[var(--bloom-text-muted)] mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold px-1.5 py-0.2 rounded bg-[var(--bloom-card-subtle)] text-[var(--bloom-text-muted)] border border-[var(--bloom-border)]">
                          {typeInfo.badge}
                        </span>
                        <span>{doc.size} · Uploaded {doc.dateUploaded}</span>
                      </p>
                    </div>
                  </div>

                  {doc.notes && (
                    <p className="text-[11px] text-[var(--bloom-text-muted)] italic line-clamp-2 pl-0.5">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Tags and Action Buttons */}
                <div className="pt-2.5 border-t border-[var(--bloom-border)] flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] text-[var(--bloom-text-muted)] bg-[var(--bloom-card-subtle)] px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDirectDownload(e, doc)}
                      className="p-1.5 rounded-xl text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] hover:bg-[var(--bloom-card-subtle)] transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] hover:bg-[var(--bloom-primary)] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      title="Open and view document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal with File Attachment Dropzone */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] p-6 space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-[var(--bloom-border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading">
                  Upload Document to Vault
                </h3>
                <p className="text-[11px] text-[var(--bloom-text-muted)]">
                  Save actual files securely in your local Bloom sandbox
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-xl border border-[var(--bloom-border)] hover:bg-[var(--bloom-card-subtle)] text-[var(--bloom-text-muted)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-3.5">
              {/* Dropzone File Input */}
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text)] mb-1.5">
                  Select File (PDF, Image, Notes)
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    isDragging
                      ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)]'
                      : selectedFile
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)]/60'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-[var(--bloom-text)] block truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {documentStorage.formatFileSize(selectedFile.size)} · {selectedFile.type || 'Ready to save'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-[var(--bloom-primary)] opacity-80" />
                      <p className="text-xs font-semibold text-[var(--bloom-text)]">
                        Click to browse or drop file here
                      </p>
                      <p className="text-[10px] text-[var(--bloom-text-muted)]">
                        Supports PDF, PNG, JPG, WEBP, TXT, DOCX
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Display Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
                  Document Display Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Scholarship_Recommendation.pdf"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]/40"
                />
              </div>

              {/* Category Dropdown (Clean BloomDropdown without native select glitch) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
                  Category
                </label>
                <BloomDropdown<DocumentCategory>
                  value={uploadCategory}
                  onChange={(cat) => setUploadCategory(cat)}
                  options={categoryDropdownOptions}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="Academics, Fall 2026, Official"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]/40"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
                  Notes / Expiration (optional)
                </label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Certified copy, valid until 2028..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]/40 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--bloom-border)]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !uploadName.trim()}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {isSaving ? 'Saving File...' : 'Save File to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full In-App Document Preview Modal */}
      {selectedDoc && (
        <DocumentPreviewModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};
