import React from 'react';
import { X, Download, FileSpreadsheet, Printer } from 'lucide-react';

export default function ExportReportModal({ candidates, job, onClose }) {
  if (!candidates) return null;

  const downloadCSV = () => {
    const headers = [
      'Rank', 'Name', 'Email', 'Phone', 'Highest Degree', 'Experience (Yrs)',
      'Match Score (%)', 'Integrity Score (%)', 'Anomaly Risk',
      'Matched Core Skills', 'Missing Core Skills', 'Flagged Anomalies Count'
    ];

    const rows = candidates.map(c => [
      c.rank,
      `"${c.candidate.name}"`,
      `"${c.candidate.email || ''}"`,
      `"${c.candidate.phone || ''}"`,
      `"${c.candidate.highest_degree}"`,
      c.candidate.total_experience_years,
      c.score.final_score,
      c.contradiction_report.integrity_score,
      `"${c.contradiction_report.risk_level}"`,
      `"${c.explainability.matched_required_skills.join(', ')}"`,
      `"${c.explainability.missing_required_skills.join(', ')}"`,
      c.contradiction_report.anomalies.length
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Candidate_Rank_Report_${job?.id || 'Role'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recruiter Ranking Report</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Export candidates evaluation for role: <strong style={{ color: 'var(--text-primary)' }}>{job?.title}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button onClick={downloadCSV} className="btn btn-primary btn-sm">
              <FileSpreadsheet size={15} />
              <span>Download CSV</span>
            </button>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={15} />
              <span>Print PDF</span>
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Table */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0e1424', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>Rank</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Candidate</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Exp</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Degree</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Match Fit</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Claim Integrity</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Core Match</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? '#111728' : '#0e1424' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>#{c.rank}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.candidate.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.candidate.email}</div>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{c.candidate.total_experience_years} yrs</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{c.candidate.highest_degree}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <strong style={{ color: c.score.final_score >= 80 ? '#10b981' : '#f59e0b' }}>
                      {c.score.final_score}%
                    </strong>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    {c.contradiction_report.has_contradictions ? (
                      <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                        {c.contradiction_report.risk_level} ({c.contradiction_report.integrity_score}%)
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        100% Verified
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    {c.explainability.matched_required_skills.length} / {job?.required_skills?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
