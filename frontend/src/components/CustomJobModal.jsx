import React, { useState } from 'react';
import { X, PlusCircle, Briefcase, FileText } from 'lucide-react';

export default function CustomJobModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [minExp, setMinExp] = useState(3.0);
  const [education, setEducation] = useState('Bachelor');
  const [roleLevel, setRoleLevel] = useState('Senior');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('');
  const [preferredSkillsStr, setPreferredSkillsStr] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !requiredSkillsStr.trim()) {
      alert('Please provide a job title and at least 2 required skills.');
      return;
    }

    setLoading(true);
    const reqSkills = requiredSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const prefSkills = preferredSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newId = `job-custom-${Date.now()}`;

    const newJob = {
      id: newId,
      title: title.trim(),
      company: company.trim() || 'My Company',
      role_level: roleLevel,
      min_experience_years: Number(minExp),
      required_education: education,
      required_skills: reqSkills,
      preferred_skills: prefSkills,
      description_text: description.trim() || `${title} role requiring expertise in ${reqSkills.join(', ')}.`
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (!res.ok) throw new Error('Failed to create job');
      const saved = await res.json();
      onCreated(saved);
      onClose();
    } catch (err) {
      alert(err.message || 'Error saving job description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create Custom Job Requisition</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target candidate scoring will adapt immediately
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Job Title *
              </label>
              <input 
                type="text" 
                placeholder="e.g. Senior Backend Engineer" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Company Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Acme Tech" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Min Experience (Yrs)
              </label>
              <input 
                type="number" 
                step="0.5"
                min="0"
                max="20"
                value={minExp} 
                onChange={(e) => setMinExp(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Required Degree
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Associate">Associate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Role Seniority
              </label>
              <select
                value={roleLevel}
                onChange={(e) => setRoleLevel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead / Architect</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Required Core Skills * (comma-separated)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Python, FastAPI, Docker, PostgreSQL, AWS" 
              value={requiredSkillsStr} 
              onChange={(e) => setRequiredSkillsStr(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Preferred / Nice-to-Have Skills (comma-separated)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Redis, Kubernetes, CI/CD, GraphQL" 
              value={preferredSkillsStr} 
              onChange={(e) => setPreferredSkillsStr(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Job Description Context & Requirements
            </label>
            <textarea 
              rows={4}
              placeholder="Paste full job description, responsibilities, and team scope..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <PlusCircle size={15} />
              <span>{loading ? 'Creating...' : 'Activate & Re-Rank'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
