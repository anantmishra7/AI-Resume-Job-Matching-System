import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertTriangle, HelpCircle, 
  Quote, Award, Briefcase, GraduationCap, FileText, 
  ShieldCheck, ShieldAlert 
} from 'lucide-react';

export default function CandidateDetailDrawer({ item, onClose, onOpenContradiction }) {
  const [activeTab, setActiveTab] = useState('match'); // 'match' | 'history' | 'raw'
  if (!item) return null;

  const { rank, candidate, score, contradiction_report, explainability } = item;
  const isFlagged = contradiction_report.has_contradictions;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-content animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">Rank #{rank}</span>
              <span className="badge badge-gray">{candidate.highest_degree}</span>
              <span className="badge badge-cyan">{candidate.total_experience_years} Years Exp</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{candidate.name}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {candidate.email} • {candidate.phone} • {candidate.filename}
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('match')}
            className={`btn btn-sm ${activeTab === 'match' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Match Explanation
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Work & Education
          </button>
          <button 
            onClick={() => setActiveTab('raw')}
            className={`btn btn-sm ${activeTab === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Raw Resume
          </button>

          {isFlagged && (
            <button 
              onClick={() => onOpenContradiction(item)}
              className="btn btn-sm btn-danger"
              style={{ marginLeft: 'auto' }}
            >
              <ShieldAlert size={14} />
              <span>Audit Anomaly ({contradiction_report.anomalies.length})</span>
            </button>
          )}
        </div>

        {/* TAB 1: MATCH EXPLANATION */}
        {activeTab === 'match' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Overall Score & Dimension Bars */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Multi-Vector Evaluation Breakdown</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: score.final_score >= 80 ? '#10b981' : '#f59e0b' }}>
                  {score.final_score}% Match
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                {/* Skills Vector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hard Skills Overlap (Weight 35%)</span>
                    <strong>{score.skills_match}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${score.skills_match}%`, height: '100%', background: '#6366f1', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* Experience Vector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Experience & Seniority Fit (Weight 25%)</span>
                    <strong>{score.experience_match}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${score.experience_match}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* Education Vector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Education Standard (Weight 15%)</span>
                    <strong>{score.education_match}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${score.education_match}%`, height: '100%', background: '#ec4899', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* Semantic Vector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Semantic Context Similarity (Weight 25%)</span>
                    <strong>{score.semantic_match}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${score.semantic_match}%`, height: '100%', background: '#06b6d4', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* Integrity Penalty if any */}
                {score.integrity_penalty > 0 && (
                  <div style={{ color: '#f87171' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span>⚠️ Forensic Anomaly Penalty</span>
                      <strong>-{score.integrity_penalty} pts</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Why Matched: Top Strengths */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6ee7b7', marginBottom: '0.75rem' }}>
                <CheckCircle size={16} /> Key Match Strengths
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {explainability.top_strengths.map((str, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Critical Gaps Identified */}
            {explainability.critical_gaps.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={16} /> Identified Gaps & Shortfalls
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {explainability.critical_gaps.map((gap, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Quotes from Resume */}
            {explainability.evidence_quotes.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', marginBottom: '0.75rem' }}>
                  <Quote size={16} /> Verified Evidence Quotes from Resume
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {explainability.evidence_quotes.map((q, idx) => (
                    <div key={idx} style={{
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '2px solid #818cf8',
                      fontSize: '0.82rem'
                    }}>
                      <strong style={{ color: '#c7d2fe', display: 'block', marginBottom: '0.2rem' }}>
                        Skill: {q.skill}
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{q.quote}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Probing Technical Interview Questions */}
            {explainability.suggested_interview_questions.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                  <HelpCircle size={16} /> Tailored Technical Interview Questions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {explainability.suggested_interview_questions.map((q, idx) => (
                    <div key={idx} style={{
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      color: '#fef08a'
                    }}>
                      {idx + 1}. {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: WORK HISTORY & EDUCATION */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Work History */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={16} color="#818cf8" /> Work Experience Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {candidate.work_history.map((w, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{w.title}</strong>
                      <span className="badge badge-gray">{w.start_year || 'N/A'} - {w.end_year || 'Present'}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      {w.description}
                    </p>
                    {w.technologies.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {w.technologies.map((t, ti) => (
                          <span key={ti} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GraduationCap size={16} color="#f472b6" /> Education Credentials
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {candidate.education.map((ed, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{ed.degree} in {ed.field}</strong>
                      <span className="badge badge-gray">{ed.graduation_year || 'Graduated'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {ed.institution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RAW RESUME */}
        {activeTab === 'raw' && (
          <div className="glass-card" style={{ padding: '1rem' }}>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              maxHeight: '75vh',
              overflowY: 'auto'
            }}>
              {candidate.raw_text}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
