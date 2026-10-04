import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadZone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'doc', 'txt'].includes(ext);
    });

    if (validFiles.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please upload valid PDF, DOCX, or TXT resumes.' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    validFiles.forEach(f => formData.append('files', f));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setUploadStatus({
        type: 'success',
        message: `Parsed & registered ${data.candidates.length} candidate resume(s) successfully!`
      });
      onUploadSuccess();
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message || 'Error processing resume files.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed rgba(255, 255, 255, 0.15)',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0, 0, 0, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem'
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".pdf,.docx,.doc,.txt" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8'
        }}>
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            {uploading ? 'Parsing & Extracting Resumes...' : 'Bulk Upload Candidate Resumes'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Drag and drop multiple resumes here, or click to browse (PDF, DOCX, TXT)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Multi-format Ingestion</span>
          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>OCR & Entity Extraction</span>
          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Forensic Verification</span>
        </div>
      </div>

      {uploadStatus && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: uploadStatus.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          border: `1px solid ${uploadStatus.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
          color: uploadStatus.type === 'success' ? '#6ee7b7' : '#fca5a5'
        }}>
          {uploadStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
}
