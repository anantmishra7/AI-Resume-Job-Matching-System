import React, { useState } from 'react';
import { Briefcase, Building, Clock, GraduationCap, ChevronDown, ChevronUp, CheckCircle, Star } from 'lucide-react';

export default function JobSelector({ jobs, selectedJobId, onSelectJob }) {
  const [expanded, setExpanded] = useState(false);
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  if (!activeJob) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Left: Job Info & Switcher */}
        <div style={{ flex: '1 1 350px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">Active Target Requisition</span>
            <span className="badge badge-cyan">{activeJob.role_level} Level</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeJob.title}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building size={14} color="#818cf8" />
              <span>{activeJob.company}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} color="#34d399" />
              <span>Min {activeJob.min_experience_years} Years Experience</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <GraduationCap size={14} color="#f472b6" />
              <span>Required: {activeJob.required_education} Degree</span>
            </div>
          </div>
        </div>

        {/* Right: Job Switcher Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Role:</label>
          <select 
            value={activeJob.id} 
            onChange={(e) => onSelectJob(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Required & Preferred Skills Matrix */}
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Required Skills (Core):
          </span>
          {activeJob.required_skills.map((skill, idx) => (
            <span key={idx} className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              <CheckCircle size={12} /> {skill}
            </span>
          ))}

          {activeJob.preferred_skills.length > 0 && (
            <>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '0.5rem' }}>
                Preferred (Bonus):
              </span>
              {activeJob.preferred_skills.map((skill, idx) => (
                <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  <Star size={11} /> {skill}
                </span>
              ))}
            </>
          )}

          <button 
            onClick={() => setExpanded(!expanded)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {expanded ? <>Hide Full JD <ChevronUp size={14} /></> : <>Read Full Job Description <ChevronDown size={14} /></>}
          </button>
        </div>

        {/* Collapsible Full Description Text */}
        {expanded && (
          <div style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}>
            {activeJob.description_text}
          </div>
        )}
      </div>
    </div>
  );
}
