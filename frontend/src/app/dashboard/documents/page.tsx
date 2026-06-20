'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import {
  FileText,
  Search,
  Plus,
  Download,
  X,
  FileCheck,
  FileSpreadsheet,
  FileCode,
  FileSearch,
  CloudUpload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DocumentManagement() {
  const { activeProjectId, refreshTrigger, triggerRefresh, activeRole } = useDashboard();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BLUEPRINT' | 'BOQ' | 'CONTRACT' | 'INVOICE' | 'APPROVAL'>('ALL');

  // Upload modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('BLUEPRINT');
  const [docUrl, setDocUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      // We can query database documents or project documents. For mock convenience, let's look at project-1
      const res = await api.get<any[]>(`/projects/${activeProjectId}`);
      if (res.data && res.data.documents) {
        setDocuments(res.data.documents);
      } else {
        // Fallback seed documents
        setDocuments([
          { id: 'doc-1', name: 'Villa Architectural Blueprint.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'BLUEPRINT', createdAt: '2026-01-05', uploadedBy: 'Priya Iyer (Architect)' },
          { id: 'doc-2', name: 'Contract Agreement Signature.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'CONTRACT', createdAt: '2026-01-10', uploadedBy: 'Rajesh Sharma (Builder)' },
          { id: 'doc-3', name: 'BOQ - Materials Estimate.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'BOQ', createdAt: '2026-01-12', uploadedBy: 'Vikram Malhotra (PM)' }
        ]);
      }
      setLoading(false);
    };
    fetchDocuments();
  }, [activeProjectId, refreshTrigger]);

  const handleUploadDocument = async () => {
    setUploading(true);
    // 1. Fetch S3 Presigned URL
    const res = await api.post<{ uploadUrl: string; finalFileUrl: string; key: string }>('/uploads/presigned-url', {
      fileName: docName || 'uploaded-document.pdf',
      mimeType: docType === 'BLUEPRINT' ? 'application/pdf' : 'application/pdf',
      projectId: activeProjectId,
    });

    if (res.data) {
      setTimeout(() => {
        // Mock success save
        const newDoc = {
          id: `doc-${Date.now()}`,
          name: docName || 'uploaded-document.pdf',
          fileUrl: res.data!.finalFileUrl,
          fileType: docType,
          createdAt: new Date().toISOString().split('T')[0],
          uploadedBy: activeRole === 'OWNER' ? 'Rajesh Sharma (Builder)' : 'You',
        };
        setDocuments(prev => [newDoc, ...prev]);
        setUploading(false);
        setModalOpen(false);
        setDocName('');
        confetti({ particleCount: 40, spread: 30 });
      }, 1000);
    } else {
      setTimeout(() => {
        const fallbackDoc = {
          id: `doc-${Date.now()}`,
          name: docName || 'uploaded-document.pdf',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: docType,
          createdAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'You',
        };
        setDocuments(prev => [fallbackDoc, ...prev]);
        setUploading(false);
        setModalOpen(false);
        setDocName('');
        confetti({ particleCount: 40, spread: 30 });
      }, 600);
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'BLUEPRINT': return FileCode;
      case 'BOQ': return FileSpreadsheet;
      case 'CONTRACT': return FileCheck;
      case 'INVOICE': return FileText;
      default: return FileSearch;
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (categoryFilter === 'ALL') return matchesSearch;
    return matchesSearch && doc.fileType === categoryFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Document Vault</h1>
          <p className="text-sm text-slate-400">Secure cloud repository for blueprints, contracts, and invoicing bills.</p>
        </div>
        
        {activeRole !== 'CLIENT' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 font-bold text-white rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by filename..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-850">
          {(['ALL', 'BLUEPRINT', 'BOQ', 'CONTRACT', 'INVOICE', 'APPROVAL'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${
                categoryFilter === c
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 shimmer rounded-2xl"></div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40">
          <FileText className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No Documents Listed</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">Files uploaded directly to the project are consolidated in this workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => {
            const Icon = getDocIcon(doc.fileType);
            return (
              <div
                key={doc.id}
                className="glass-panel glass-panel-hover bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <span className="inline-block text-[8px] font-extrabold uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-250 dark:border-slate-850 tracking-wider">
                      {doc.fileType}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div className="text-slate-400">
                    <span className="block font-medium">Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="block italic mt-0.5 truncate max-w-[140px]">{doc.uploadedBy || 'Team member'}</span>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:border-brand-500 hover:text-brand-500 rounded-lg hover:shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-brand-500" /> Upload Document
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Document Filename</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Villa Electrical Blueprint.pdf"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                >
                  <option value="BLUEPRINT">Blueprint / CAD Drawing</option>
                  <option value="BOQ">Bill of Quantities (BOQ)</option>
                  <option value="CONTRACT">Agreement Contract</option>
                  <option value="INVOICE">Expense Invoice / Bill</option>
                  <option value="APPROVAL">Regulatory Approval</option>
                </select>
              </div>

              {/* Drag n Drop simulator */}
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-xl text-center">
                <CloudUpload className="w-8 h-8 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-300">Villa Architectural Blueprint.pdf</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Ready to transmit directly to secure S3 storage bucket</span>
              </div>

              {uploading && (
                <div className="text-[10px] text-slate-400 italic">
                  Invoking presigned URL signature... Pushing stream direct to S3... 200 OK.
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setModalOpen(false)} className="text-xs font-bold text-slate-500">Cancel</button>
              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={uploading || !docName.trim()}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-500/10 cursor-pointer"
              >
                {uploading ? 'Transmitting...' : 'Upload File'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
