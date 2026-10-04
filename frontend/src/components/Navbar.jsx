import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Download, FileText, PlusCircle } from 'lucide-react';

export default function Navbar({ onReset, onNewJob, onExport, stats, loading }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(8, 11, 17, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.85rem 1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                Nexus<span className="text-gradient">Match</span> AI
              </span>
              <span className="badge badge-primary mono" style={{ fontSize: '0.65rem' }}>ALG-AI-01</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Explainable Candidate Ranking & Forensic Claim Audit
            </p>
          </div>
        </div>

        {/* Global Stats Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Candidates:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{stats.totalCandidates}</strong>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Top Fits (&gt;80%):</span>
            <strong style={{ color: '#6ee7b7' }}>{stats.topMatches}</strong>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Flagged Claims:</span>
            <strong style={{ color: stats.flaggedCount > 0 ? '#fca5a5' : '#94a3b8' }}>
              {stats.flaggedCount}
            </strong>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            onClick={onNewJob}
            className="btn btn-secondary btn-sm"
            title="Create Custom Job Requisition"
          >
            <PlusCircle size={15} color="#818cf8" />
            <span>Custom JD</span>
          </button>

          <button 
            onClick={onReset}
            className="btn btn-secondary btn-sm"
            disabled={loading}
            title="Reload Sample Benchmarks"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Reset Demo</span>
          </button>

          <button 
            onClick={onExport}
            className="btn btn-primary btn-sm"
            title="Export Candidate Ranking Report"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
