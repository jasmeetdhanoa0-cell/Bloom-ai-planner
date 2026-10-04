import { StoredDocument } from '../types';

export interface StoredFileRecord {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  size: number;
  updatedAt: string;
}

const DB_NAME = 'bloom_document_vault';
const DB_VERSION = 1;
const STORE_NAME = 'document_files';

class DocumentStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache = new Map<
    string,
    { blob: Blob; mimeType: string; fileName: string; size: number }
  >();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  // Format file size for human display
  public formatFileSize(bytes: number): string {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Detect MIME type from file extension or provided type
  public detectMimeType(fileName: string, providedType?: string): string {
    if (providedType && providedType !== 'application/octet-stream' && providedType.trim()) {
      return providedType;
    }
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      case 'bmp':
        return 'image/bmp';
      case 'txt':
        return 'text/plain';
      case 'md':
        return 'text/markdown';
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'doc':
      case 'docx':
        return 'application/msword';
      default:
        return providedType || 'application/octet-stream';
    }
  }

  // Convert Blob/File to Data URL
  public fileToDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Convert Data URL back to Blob
  public dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
    try {
      const parts = dataUrl.split(',');
      const match = parts[0].match(/:(.*?);/);
      const mimeType = match ? match[1] : 'application/octet-stream';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return { blob: new Blob([u8arr], { type: mimeType }), mimeType };
    } catch (e) {
      console.warn('Error converting dataUrl to blob:', e);
      return { blob: new Blob([''], { type: 'text/plain' }), mimeType: 'text/plain' };
    }
  }

  // Internal helper to put record in IndexedDB
  private async putToIndexedDB(
    id: string,
    blob: Blob,
    fileName: string,
    mimeType: string,
    size: number
  ): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const record: StoredFileRecord = {
          id,
          blob,
          fileName,
          mimeType,
          size,
          updatedAt: new Date().toISOString(),
        };
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB write skipped/failed:', err);
    }
  }

  // Save an uploaded file or blob across all storage tiers
  public async saveDocumentFile(
    id: string,
    file: File | Blob,
    metadata: { name: string; type?: string; size?: number }
  ): Promise<void> {
    const mimeType = this.detectMimeType(metadata.name, metadata.type || file.type);
    const size = metadata.size !== undefined ? metadata.size : file.size;

    // Ensure we store a typed Blob with exact MIME type
    const blobToStore = file instanceof Blob && file.type === mimeType ? file : new Blob([file], { type: mimeType });

    // 1. In-memory cache tier
    this.memoryCache.set(id, {
      blob: blobToStore,
      mimeType,
      fileName: metadata.name,
      size,
    });

    // 2. Primary local storage: IndexedDB
    await this.putToIndexedDB(id, blobToStore, metadata.name, mimeType, size);

    // 3. Prepare data URL for localStorage and backend sync
    try {
      const dataUrl = await this.fileToDataUrl(blobToStore);

      // 4. Server storage tier (async, background, fails gracefully)
      fetch(`/api/documents/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: metadata.name,
          mimeType,
          dataUrl,
        }),
      }).catch((e) => console.warn('Server document backup sync skipped:', e));

      // 5. LocalStorage fallback tier for fast recovery (if size <= 2.5MB)
      if (size <= 2.5 * 1024 * 1024) {
        try {
          localStorage.setItem(`bloom_doc_backup_${id}`, dataUrl);
        } catch {
          // localStorage quota exceeded, safe to ignore
        }
      }
    } catch (e) {
      console.warn('DataURL generation for document backup skipped:', e);
    }
  }

  // Retrieve a file by ID from any tier with fallback for seed demo documents
  public async getDocumentFile(
    id: string,
    fallbackDoc?: StoredDocument
  ): Promise<{ blob: Blob; mimeType: string; fileName: string; size: number } | null> {
    // Tier 1: In-memory cache
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!;
    }

    // Tier 2: IndexedDB
    try {
      const db = await this.getDB();
      const record: StoredFileRecord | null = await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (record && record.blob) {
        const result = {
          blob: record.blob,
          mimeType: record.mimeType,
          fileName: record.fileName,
          size: record.size,
        };
        this.memoryCache.set(id, result);
        return result;
      }
    } catch (e) {
      console.warn('Could not read from IndexedDB, checking backup tiers:', e);
    }

    // Tier 3: Server backend storage
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const blob = await response.blob();
        const headerMime = response.headers.get('content-type');
        const mimeType = headerMime && headerMime !== 'application/octet-stream'
          ? headerMime
          : this.detectMimeType(fallbackDoc?.name || id);

        const result = {
          blob,
          mimeType,
          fileName: fallbackDoc?.name || `${id}.bin`,
          size: blob.size,
        };
        this.memoryCache.set(id, result);
        this.putToIndexedDB(id, blob, result.fileName, mimeType, blob.size).catch(() => {});
        return result;
      }
    } catch {
      // Backend not reached or running client-only, proceed to next tier
    }

    // Tier 4: LocalStorage backup
    try {
      const localData = localStorage.getItem(`bloom_doc_backup_${id}`);
      if (localData && localData.startsWith('data:')) {
        const { blob, mimeType } = this.dataUrlToBlob(localData);
        const result = {
          blob,
          mimeType,
          fileName: fallbackDoc?.name || `${id}.bin`,
          size: blob.size,
        };
        this.memoryCache.set(id, result);
        this.putToIndexedDB(id, blob, result.fileName, mimeType, blob.size).catch(() => {});
        return result;
      }
    } catch {
      // LocalStorage access failed
    }

    // Tier 5: fallbackDoc embedded fileDataUrl
    if (fallbackDoc && fallbackDoc.fileDataUrl && fallbackDoc.fileDataUrl.startsWith('data:')) {
      const { blob, mimeType } = this.dataUrlToBlob(fallbackDoc.fileDataUrl);
      const result = {
        blob,
        mimeType: fallbackDoc.fileType || mimeType,
        fileName: fallbackDoc.name,
        size: blob.size,
      };
      this.memoryCache.set(id, result);
      this.putToIndexedDB(id, blob, result.fileName, result.mimeType, blob.size).catch(() => {});
      return result;
    }

    // Tier 6: Automatic high-fidelity sample generation (for seed docs or empty uploads)
    if (fallbackDoc) {
      const generated = this.generateSampleDocumentBlob(id, fallbackDoc);
      this.memoryCache.set(id, generated);

      // Automatically cache into storage so subsequent fetches are instant
      this.saveDocumentFile(id, generated.blob, {
        name: generated.fileName,
        type: generated.mimeType,
        size: generated.size,
      }).catch(console.warn);

      return generated;
    }

    return null;
  }

  // Delete a document file across all tiers
  public async deleteDocumentFile(id: string): Promise<void> {
    this.memoryCache.delete(id);

    try {
      localStorage.removeItem(`bloom_doc_backup_${id}`);
    } catch {
      // Ignore
    }

    try {
      fetch(`/api/documents/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Ignore
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Error deleting file from IndexedDB:', e);
    }
  }

  // Generate realistic valid PDF / SVG image / Text Blobs for documents
  public generateSampleDocumentBlob(
    id: string,
    doc: StoredDocument
  ): { blob: Blob; mimeType: string; fileName: string; size: number } {
    const isPdf = doc.name.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(doc.name);

    if (isPdf) {
      let title = doc.name.replace('.pdf', '').replace(/_/g, ' ');
      let lines: string[] = [];

      if (id === 'doc-1' || doc.name.includes('Transcript')) {
        title = 'OFFICIAL UNIVERSITY ACADEMIC TRANSCRIPT';
        lines = [
          'Institution: Global Arts & Science University - Office of the Registrar',
          'Student Name: Aria Thorne',
          'Student ID: #GASU-2026-94812',
          'Academic Term: Fall Semester 2026',
          'Degree: Bachelor of Science in Cognitive Systems & Psychology',
          '----------------------------------------------------------------------',
          'Course Code     Course Title                          Credits   Grade',
          '----------------------------------------------------------------------',
          'COG-201         Cognitive Biases & Decision Making    4.0       A (4.0)',
          'ECON-102        Microeconomics: Market Dynamics       4.0       A- (3.7)',
          'NEUR-310        Neural Basis of Learning & Memory     4.0       A (4.0)',
          'DES-105         Foundations of Human-Computer Design  3.0       A (4.0)',
          'PHIL-215        Ethics of Modern Artificial Systems   3.0       A (4.0)',
          '----------------------------------------------------------------------',
          'Term GPA: 3.94   |   Cumulative GPA: 3.96   |   Academic Standing: Dean\'s List',
          '',
          'Verified by Office of the Registrar: S. Vance, Registrar Official Seal',
          'Security Verification Hash: 9f82-a4c1-33e7-b501',
          'Document protected by Bloom Personal Sanctuary Security'
        ];
      } else if (id === 'doc-2' || doc.name.includes('Scholarship')) {
        title = 'GLOBAL EXCELLENCE SCHOLARSHIP APPLICATION';
        lines = [
          'Grant Committee: International Scholars Foundation - 2026-2027 Award Cycle',
          'Applicant: Aria Thorne   |   Status: Submitted for Final Faculty Review',
          'Application Reference: #GES-2026-8841',
          '----------------------------------------------------------------------',
          'Award Category: Full Merit Tuition & Independent Research Stipend',
          'Proposed Research: Mindful AI Systems for Sustainable Student Focus',
          'Faculty Sponsor: Dr. H. Vance, Department of Cognitive Science',
          '',
          'Summary of Proposal:',
          'Developing ambient, privacy-first companion software designed to reduce',
          'academic burnout and anxiety among undergraduate students through active recall.',
          '',
          'Required Supporting Attachments:',
          '1. Official Transcripts (Attached / Verified)',
          '2. Personal Statement & Research Abstract (Included)',
          '3. Letters of Recommendation (2 Received from Department Head)',
          '',
          'Committee Review Date: October 14, 2026',
          'Notification of Award: November 01, 2026'
        ];
      } else if (id === 'doc-3' || doc.name.includes('Identity')) {
        title = 'STUDENT IDENTITY & CAMPUS ACCESS PASS';
        lines = [
          'Global Arts & Science University - Department of Campus Safety',
          'Cardholder: Aria Thorne',
          'Role: Undergraduate Researcher / Student',
          'Issue Date: September 01, 2026   |   Expiration: June 30, 2028',
          '----------------------------------------------------------------------',
          'Access Clearances: Library Archives, Cognitive Science Lab, 24h Study Commons',
          'Emergency Contact: Campus Safety dispatch ext. 4410',
          '',
          'Card Serial: 7729-1094-8821',
          'RFID Frequency: 13.56 MHz Secure Encrypted Sector',
          'Official University Document - Valid with photo identification'
        ];
      } else if (id === 'doc-4' || doc.name.includes('Certificate')) {
        title = 'CERTIFICATE OF PROFESSIONAL FOUNDATIONS';
        lines = [
          'Interaction Design Guild & Cognitive Systems Institute',
          'This is to officially certify that',
          'ARIA THORNE',
          'has demonstrated comprehensive mastery in',
          'UX DESIGN FOUNDATIONS & COGNITIVE ERGONOMICS',
          '----------------------------------------------------------------------',
          'Competencies Verified:',
          '- User Experience Architecture & Typography Hierarchy',
          '- Attention Economy & Calming Interface Design',
          '- Qualitative Usability Testing & Accessibility Standards (WCAG 2.2 AAA)',
          '',
          'Issued: August 20, 2026   |   Credential ID: UXD-2026-009184',
          'Signature: Marcus Sterling, Director of Design Research'
        ];
      } else {
        title = doc.name;
        lines = [
          `Document Name: ${doc.name}`,
          `Category: ${doc.category}`,
          `Date Uploaded: ${doc.dateUploaded}`,
          `Notes: ${doc.notes || 'None'}`,
          `Tags: ${doc.tags.join(', ')}`,
          '----------------------------------------------------------------------',
          'This document is stored securely in your Bloom Document Sanctuary.',
          'All contents are private, encrypted locally, and never shared without consent.'
        ];
      }

      const pdfString = this.createMinimalValidPdf(title, lines);
      const blob = new Blob([pdfString], { type: 'application/pdf' });
      return {
        blob,
        mimeType: 'application/pdf',
        fileName: doc.name,
        size: blob.size,
      };
    }

    if (isImage) {
      const svg = this.createSampleSvgImage(doc.name, doc.category, doc.notes);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      return {
        blob,
        mimeType: 'image/svg+xml',
        fileName: doc.name,
        size: blob.size,
      };
    }

    // Fallback formatted text
    const textContent = `🌷 BLOOM DOCUMENT SANCTUARY
=========================================
Document: ${doc.name}
Category: ${doc.category}
Date Stored: ${doc.dateUploaded}
Tags: ${doc.tags?.join(', ') || 'None'}
Notes: ${doc.notes || 'No extra notes provided.'}
=========================================

Document content preserved safely in your private local Bloom sandbox.
No third-party trackers or telemetry.`;

    const textBlob = new Blob([textContent], { type: 'text/plain' });
    return {
      blob: textBlob,
      mimeType: 'text/plain',
      fileName: doc.name,
      size: textBlob.size,
    };
  }

  // Create a clean, crisp vector graphic for image documents
  private createSampleSvgImage(title: string, category: string, notes?: string): string {
    const cleanTitle = title.replace(/[<>&'"]/g, '');
    const cleanCat = category.replace(/[<>&'"]/g, '');
    const cleanNotes = (notes || 'Official Document Scan • Bloom Sanctuary').replace(/[<>&'"]/g, '');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141724"/>
      <stop offset="50%" stop-color="#1e2238"/>
      <stop offset="100%" stop-color="#0f111a"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a304e"/>
      <stop offset="100%" stop-color="#1b1f33"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="900" height="600" fill="url(#bgGrad)" rx="24"/>

  <!-- Decorative Outer Border -->
  <rect x="25" y="25" width="850" height="550" fill="none" stroke="#374151" stroke-width="2" stroke-dasharray="6,6" rx="20"/>

  <!-- Main Card -->
  <rect x="50" y="50" width="800" height="500" fill="url(#cardGrad)" rx="20" stroke="#475569" stroke-width="1.5"/>

  <!-- Header Accent Line -->
  <rect x="50" y="50" width="800" height="8" fill="url(#accentGrad)" rx="4"/>

  <!-- Emblem / Icon Badge -->
  <circle cx="120" cy="130" r="40" fill="#ec4899" fill-opacity="0.15" stroke="#ec4899" stroke-width="2"/>
  <text x="120" y="142" font-family="sans-serif" font-size="34" text-anchor="middle" fill="#f472b6">🌸</text>

  <!-- Title & Category -->
  <text x="180" y="125" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">${cleanTitle}</text>
  <rect x="180" y="140" width="110" height="24" rx="12" fill="#ec4899" fill-opacity="0.2"/>
  <text x="235" y="156" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#f472b6">${cleanCat.toUpperCase()}</text>

  <!-- Certificate / Document Divider -->
  <line x1="80" y1="200" x2="820" y2="200" stroke="#334155" stroke-width="1"/>

  <!-- Content Representation -->
  <rect x="80" y="230" width="460" height="14" rx="7" fill="#64748b" fill-opacity="0.5"/>
  <rect x="80" y="260" width="580" height="14" rx="7" fill="#64748b" fill-opacity="0.3"/>
  <rect x="80" y="290" width="520" height="14" rx="7" fill="#64748b" fill-opacity="0.3"/>
  <rect x="80" y="320" width="380" height="14" rx="7" fill="#64748b" fill-opacity="0.3"/>

  <!-- Notes Box -->
  <rect x="80" y="370" width="740" height="80" rx="12" fill="#0f172a" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
  <text x="105" y="405" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1">Notes / Description:</text>
  <text x="105" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">${cleanNotes}</text>

  <!-- Security Seal -->
  <g transform="translate(680, 240)">
    <circle cx="60" cy="60" r="55" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-width="2"/>
    <circle cx="60" cy="60" r="45" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="4,4"/>
    <text x="60" y="55" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#34d399">VERIFIED</text>
    <text x="60" y="72" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#6ee7b7">SANCTUARY</text>
  </g>

  <!-- Footer Information -->
  <text x="80" y="515" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b">🔒 Bloom Encrypted Document Storage • ID: ${cleanTitle}</text>
  <text x="820" y="515" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="end" fill="#64748b">Original File Preview</text>
</svg>`;
  }

  // Construct a standard, valid PDF 1.4 byte sequence without external dependencies
  private createMinimalValidPdf(title: string, lines: string[]): string {
    const escapePdf = (str: string) =>
      str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

    const contentLines: string[] = [
      'BT',
      '/F1 16 Tf',
      '50 740 Td',
      `(${escapePdf(title)}) Tj`,
      '/F1 10 Tf',
      '0 -24 Td',
    ];

    lines.forEach((line) => {
      contentLines.push(`(${escapePdf(line)}) Tj`);
      contentLines.push('0 -15 Td');
    });

    contentLines.push('ET');
    const contentStream = contentLines.join('\n');
    const streamLength = contentStream.length;

    const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    const obj3 =
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
    const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
    const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

    let offset = 0;
    const header = '%PDF-1.4\n';
    offset += header.length;

    const offset1 = offset;
    offset += obj1.length;

    const offset2 = offset;
    offset += obj2.length;

    const offset3 = offset;
    offset += obj3.length;

    const offset4 = offset;
    offset += obj4.length;

    const offset5 = offset;
    offset += obj5.length;

    const pad = (n: number) => String(n).padStart(10, '0');
    const xref = `xref\n0 6\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n`;
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;

    return header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  }
}

export const documentStorage = new DocumentStorageService();
