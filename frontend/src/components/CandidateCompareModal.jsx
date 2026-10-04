import React from 'react';
import { X, CheckCircle, XCircle, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export default function CandidateCompareModal({ candidates, job, onClose }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Side-by-Side Candidate Comparison</h3>
              <span className="badge badge-primary">{candidates.length} Candidates Selected</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target Role: <strong style={{ color: 'var(--text-primary)' }}>{job?.title}</strong> ({job?.company})
            </p>
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

        {/* Comparison Grid Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          {/* HEADER ROW */}
          <div style={{ background: '#0e1424', padding: '1rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Candidate
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#0e1424', padding: '1rem', textAlign: 'center' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Rank #{c.rank}</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{c.candidate.name}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.candidate.highest_degree}</span>
            </div>
          ))}

          {/* OVERALL MATCH SCORE ROW */}
          <div style={{ background: '#121a2d', padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Composite Fit Score
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#121a2d', padding: '0.85rem 1rem', textAlign: 'center' }}>
              <strong style={{
                fontSize: '1.2rem',
                color: c.score.final_score >= 80 ? '#10b981' : (c.score.final_score >= 65 ? '#f59e0b' : '#94a3b8')
              }}>
                {c.score.final_score}%
              </strong>
            </div>
          ))}

          {/* INTEGRITY & AUTHENTICITY ROW */}
          <div style={{ background: '#0e1424', padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Claim Integrity Audit
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#0e1424', padding: '0.85rem 1rem', textAlign: 'center' }}>
              {c.contradiction_report.has_contradictions ? (
                <span className="badge badge-danger">
                  <ShieldAlert size={12} /> {c.contradiction_report.risk_level} ({c.contradiction_report.integrity_score}%)
                </span>
              ) : (
                <span className="badge badge-success">
                  <ShieldCheck size={12} /> 100% Verified
                </span>
              )}
            </div>
          ))}

          {/* EXPERIENCE ROW */}
          <div style={{ background: '#121a2d', padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Experience (Req: {job?.min_experience_years}y)
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#121a2d', padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <strong>{c.candidate.total_experience_years} yrs</strong>
              <div style={{ fontSize: '0.72rem', color: c.candidate.total_experience_years >= (job?.min_experience_years || 0) ? '#6ee7b7' : '#fca5a5' }}>
                {c.candidate.total_experience_years >= (job?.min_experience_years || 0) ? '✓ Meets Requirement' : '✗ Experience Shortfall'}
              </div>
            </div>
          ))}

          {/* MATCHED SKILLS ROW */}
          <div style={{ background: '#0e1424', padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Matched Skills
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#0e1424', padding: '0.85rem 1rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {c.explainability.matched_required_skills.map((s, idx) => (
                  <span key={idx} className="badge badge-success" style={{ fontSize: '0.7rem' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}

          {/* MISSING SKILLS ROW */}
          <div style={{ background: '#121a2d', padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Missing Required Skills
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#121a2d', padding: '0.85rem 1rem', textAlign: 'center' }}>
              {c.explainability.missing_required_skills.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {c.explainability.missing_required_skills.map((s, idx) => (
                    <span key={idx} className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{s}</span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>✓ Full Match</span>
              )}
            </div>
          ))}

          {/* STRENGTH HIGHLIGHT */}
          <div style={{ background: '#0e1424', padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Top Strength Highlight
          </div>
          {candidates.map((c, i) => (
            <div key={i} style={{ background: '#0e1424', padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {c.explainability.top_strengths[0] || 'Good profile alignment'}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
