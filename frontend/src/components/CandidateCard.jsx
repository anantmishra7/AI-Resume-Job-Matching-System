import React from 'react';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, 
  ChevronRight, ExternalLink, Mail, Phone, Award, AlertTriangle 
} from 'lucide-react';

export default function CandidateCard({
  item,
  onSelectDetail,
  onSelectContradiction,
  onToggleCompare,
  isSelectedForCompare
}) {
  const { rank, candidate, score, contradiction_report, explainability } = item;
  const isFlagged = contradiction_report.has_contradictions;
  const isCritical = contradiction_report.risk_level === 'CRITICAL' || contradiction_report.risk_level === 'HIGH';

  // Score color helper
  const getScoreColor = (val) => {
    if (val >= 80) return '#10b981';
    if (val >= 65) return '#f59e0b';
    return '#64748b';
  };

  const scoreColor = getScoreColor(score.final_score);
  const scoreDeg = `${(score.final_score / 100) * 360}deg`;

  return (
    <div 
      className={`glass-card ${isCritical ? 'pulse-critical' : ''}`}
      style={{
        padding: '1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        borderLeft: isCritical ? '4px solid #ef4444' : (score.final_score >= 80 ? '4px solid #10b981' : '1px solid var(--border-subtle)')
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Left: Rank, Name, Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Rank Badge */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: rank === 1 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : (rank === 2 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'),
            color: rank === 1 ? '#000' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: rank === 1 ? '0 2px 10px rgba(245, 158, 11, 0.4)' : 'none'
          }}>
            #{rank}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{candidate.name}</h3>
              <span className="badge badge-gray">{candidate.highest_degree}</span>
              <span className="badge badge-cyan">{candidate.total_experience_years} yrs exp</span>
            </div>

            {/* Subtitle Contact & File */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              {candidate.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={12} /> {candidate.email}
                </span>
              )}
              {candidate.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone size={12} /> {candidate.phone}
                </span>
              )}
              <span className="mono" style={{ color: 'var(--text-muted)' }}>
                {candidate.filename}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Dual Visual Gauges (Score & Integrity) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Integrity Badge (Innovation Bonus) */}
          <div 
            onClick={() => isFlagged && onSelectContradiction(item)}
            style={{
              cursor: isFlagged ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              textAlign: 'right'
            }}
            title={isFlagged ? "Click to view forensic claim audit" : "Verified Profile"}
          >
            {isFlagged ? (
              <div className="badge badge-danger" style={{ cursor: 'pointer', padding: '0.35rem 0.65rem' }}>
                <ShieldAlert size={14} />
                <span>{contradiction_report.risk_level} RISK ({contradiction_report.integrity_score}%)</span>
              </div>
            ) : (
              <div className="badge badge-success" style={{ padding: '0.35rem 0.65rem' }}>
                <ShieldCheck size={14} />
                <span>Verified Claims (100%)</span>
              </div>
            )}
            <span style={{ fontSize: '0.7rem', color: isFlagged ? '#f87171' : 'var(--text-muted)', marginTop: '0.15rem' }}>
              {isFlagged ? `${contradiction_report.anomalies.length} Anomaly Flag(s) Detected` : 'Zero Contradictions'}
            </span>
          </div>

          {/* Match Score Radial Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              className="score-circle"
              style={{
                '--score-color': scoreColor,
                '--score-deg': scoreDeg
              }}
            >
              <div className="score-circle-inner" style={{ color: scoreColor }}>
                {Math.round(score.final_score)}%
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scoreColor }}>
                {explainability.match_status}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Algorithmic Fit
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Middle Row: Skills Alignment (Matched vs Missing) */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        {/* Matched Required Skills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Matched Skills:
          </span>
          {explainability.matched_required_skills.length > 0 ? (
            explainability.matched_required_skills.map((s, i) => (
              <span key={i} className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={11} /> {s}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
          )}

          {explainability.matched_preferred_skills.map((s, i) => (
            <span key={i} className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              ★ {s}
            </span>
          ))}
        </div>

        {/* Missing Skills */}
        {explainability.missing_required_skills.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
              Missing:
            </span>
            {explainability.missing_required_skills.map((s, i) => (
              <span key={i} className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                <XCircle size={11} /> {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.35rem' }}>
        
        {/* Executive Snippet */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: '1 1 350px', lineHeight: 1.4 }}>
          {explainability.executive_summary}
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Compare Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(candidate.id)}
              style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
            <span>Compare</span>
          </label>

          {/* Forensic Audit Button if flagged */}
          {isFlagged && (
            <button 
              onClick={() => onSelectContradiction(item)}
              className="btn btn-danger btn-sm"
              title="View Claim Contradictions & Audit Report"
            >
              <AlertTriangle size={13} />
              <span>Audit Claims</span>
            </button>
          )}

          {/* Explain Match Drawer Button */}
          <button 
            onClick={() => onSelectDetail(item)}
            className="btn btn-secondary btn-sm"
          >
            <span>Explain Match</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
