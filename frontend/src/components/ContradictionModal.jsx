import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle, X, HelpCircle, FileSearch } from 'lucide-react';

export default function ContradictionModal({ item, onClose }) {
  if (!item) return null;

  const { candidate, contradiction_report, score } = item;
  const { anomalies, integrity_score, risk_level, claim_evidence_ratio, audit_summary } = contradiction_report;

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f87171';
      case 'MEDIUM': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const riskColor = getRiskColor(risk_level);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <AlertOctagon size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Forensic Claim & Anomaly Audit</h3>
                <span className="badge badge-primary mono" style={{ fontSize: '0.65rem' }}>INNOVATION BONUS</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Candidate: <strong style={{ color: 'var(--text-primary)' }}>{candidate.name}</strong> • File: {candidate.filename}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Audit Metrics Banner */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          border: `1px solid ${riskColor}40`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Metric 1: Risk Level */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Anomaly Risk Level
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: riskColor, marginTop: '0.2rem' }}>
              {risk_level} RISK
            </div>
          </div>

          {/* Metric 2: Integrity Score */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Authenticity Score
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: integrity_score >= 80 ? '#10b981' : '#f87171', marginTop: '0.2rem' }}>
              {integrity_score}%
            </div>
          </div>

          {/* Metric 3: Claim Evidence Ratio */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Claim Evidence Ratio
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: claim_evidence_ratio < 0.4 ? '#f87171' : '#6ee7b7', marginTop: '0.2rem' }}>
              {Math.round(claim_evidence_ratio * 100)}%
            </div>
          </div>

          {/* Metric 4: Score Penalty */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Score Penalty Applied
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
              -{score.integrity_penalty} pts
            </div>
          </div>
        </div>

        {/* Audit Summary Alert */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.65rem'
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Automated Forensic Audit Assessment:</strong>
            <p style={{ marginTop: '0.2rem' }}>{audit_summary}</p>
          </div>
        </div>

        {/* Anomaly Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Detected Contradictions & Irregularities ({anomalies.length}):
          </h4>

          {anomalies.map((ano, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '1.1rem',
                borderLeft: `4px solid ${ano.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                background: 'rgba(20, 27, 45, 0.9)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className={`badge ${ano.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                  {ano.severity} • {ano.type.replace(/_/g, ' ')}
                </span>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Rule ID: #ANOMALY-0{idx + 1}
                </span>
              </div>

              {/* Claimed Text */}
              <div style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Claimed in Resume: </strong>
                <span style={{ color: '#fed7aa', fontStyle: 'italic' }}>"{ano.claim}"</span>
              </div>

              {/* Forensic Reason */}
              <div style={{ marginBottom: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: '#f87171' }}>Forensic Finding: </strong>
                {ano.reason}
              </div>

              {/* Exact Evidence */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}>
                Evidence snippet: {ano.evidence}
              </div>
            </div>
          ))}
        </div>

        {/* Recruiter Action Guidance */}
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <HelpCircle size={15} /> Recruiter Interview Probing Guidance:
          </h5>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Traditional ATS platforms blindly rewarded this candidate with a high match score due to keyword density. 
            Our forensic engine has downgraded the candidate's rank. Before rejecting or advancing, 
            ask the candidate to demonstrate concrete hands-on production code for the flagged technologies.
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Audit Report
          </button>
        </div>

      </div>
    </div>
  );
}
