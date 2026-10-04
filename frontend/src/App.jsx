import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import JobSelector from './components/JobSelector';
import UploadZone from './components/UploadZone';
import FiltersBar from './components/FiltersBar';
import CandidateCard from './components/CandidateCard';
import CandidateDetailDrawer from './components/CandidateDetailDrawer';
import ContradictionModal from './components/ContradictionModal';
import CandidateCompareModal from './components/CandidateCompareModal';
import CustomJobModal from './components/CustomJobModal';
import ExportReportModal from './components/ExportReportModal';
import { Layers, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [minExp, setMinExp] = useState(0);
  const [integrityFilter, setIntegrityFilter] = useState('ALL'); // 'ALL' | 'VERIFIED' | 'FLAGGED'
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'integrity' | 'experience'

  // Modals & Drawers state
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedContradiction, setSelectedContradiction] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCustomJobModal, setShowCustomJobModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch Jobs on Mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch Candidates whenever active job changes
  useEffect(() => {
    if (selectedJobId) {
      fetchRankedCandidates(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    }
  };

  const fetchRankedCandidates = async (jobId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/candidates?job_id=${jobId}`);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidate rankings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await fetch('/api/reset-samples', { method: 'POST' });
      await fetchJobs();
      if (selectedJobId) {
        await fetchRankedCandidates(selectedJobId);
      }
      setCompareIds([]);
    } catch (err) {
      console.error('Reset failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
  };

  const handleToggleCompare = (candidateId) => {
    setCompareIds(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 candidates simultaneously.');
          return prev;
        }
        return [...prev, candidateId];
      }
    });
  };

  // Filter & Sort Logic
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(item => {
        const { candidate, score, contradiction_report } = item;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = candidate.name.toLowerCase().includes(q);
          const matchSkill = candidate.skills.some(s => s.toLowerCase().includes(q));
          const matchFile = candidate.filename.toLowerCase().includes(q);
          if (!matchName && !matchSkill && !matchFile) return false;
        }

        // Min Score filter
        if (score.final_score < minScore) return false;

        // Min Experience filter
        if (candidate.total_experience_years < minExp) return false;

        // Integrity filter
        if (integrityFilter === 'VERIFIED' && contradiction_report.has_contradictions) return false;
        if (integrityFilter === 'FLAGGED' && !contradiction_report.has_contradictions) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'integrity') {
          return b.contradiction_report.integrity_score - a.contradiction_report.integrity_score;
        } else if (sortBy === 'experience') {
          return b.candidate.total_experience_years - a.candidate.total_experience_years;
        } else {
          return b.score.final_score - a.score.final_score;
        }
      });
  }, [candidates, searchQuery, minScore, minExp, integrityFilter, sortBy]);

  // Global Stats
  const stats = useMemo(() => {
    return {
      totalCandidates: candidates.length,
      topMatches: candidates.filter(c => c.score.final_score >= 80).length,
      flaggedCount: candidates.filter(c => c.contradiction_report.has_contradictions).length
    };
  }, [candidates]);

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const compareCandidatesList = candidates.filter(c => compareIds.includes(c.candidate.id));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation */}
      <Navbar 
        onReset={handleResetDemo}
        onNewJob={() => setShowCustomJobModal(true)}
        onExport={() => setShowExportModal(true)}
        stats={stats}
        loading={loading}
      />

      {/* Main Container */}
      <main className="app-container" style={{ flex: 1 }}>
        
        {/* Active Job Requisition Panel */}
        <JobSelector 
          jobs={jobs}
          selectedJobId={selectedJobId}
          onSelectJob={(id) => setSelectedJobId(id)}
        />

        {/* Drag & Drop Resume Upload Zone */}
        <UploadZone 
          onUploadSuccess={() => fetchRankedCandidates(selectedJobId)}
        />

        {/* Real-time Filters and Controls */}
        <FiltersBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minScore={minScore}
          setMinScore={setMinScore}
          minExp={minExp}
          setMinExp={setMinExp}
          integrityFilter={integrityFilter}
          setIntegrityFilter={setIntegrityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalCount={candidates.length}
          filteredCount={filteredCandidates.length}
        />

        {/* Candidate Ranking List */}
        <div>
          {loading ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Analyzing resumes with multi-vector scoring...</div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No candidates match the current filter criteria.</p>
              <button onClick={() => { setSearchQuery(''); setMinScore(0); setMinExp(0); setIntegrityFilter('ALL'); }} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            filteredCandidates.map((item) => (
              <CandidateCard 
                key={item.candidate.id}
                item={item}
                onSelectDetail={(c) => setSelectedDetail(c)}
                onSelectContradiction={(c) => setSelectedContradiction(c)}
                onToggleCompare={handleToggleCompare}
                isSelectedForCompare={compareIds.includes(item.candidate.id)}
              />
            ))
          )}
        </div>

      </main>

      {/* Sticky Bottom Compare Bar if candidates are checked */}
      {compareIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: '9999px',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Layers size={16} color="#818cf8" />
            <span><strong>{compareIds.length}</strong> Candidate(s) Selected</span>
          </div>

          <button 
            onClick={() => setShowCompareModal(true)}
            className="btn btn-primary btn-sm"
          >
            <span>Compare Side-by-Side</span>
            <ArrowRight size={14} />
          </button>

          <button 
            onClick={() => setCompareIds([])}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Slide-over Explainable Match Drawer */}
      {selectedDetail && (
        <CandidateDetailDrawer 
          item={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onOpenContradiction={(c) => {
            setSelectedDetail(null);
            setSelectedContradiction(c);
          }}
        />
      )}

      {/* Innovation Bonus: Contradiction / Anomaly Audit Modal */}
      {selectedContradiction && (
        <ContradictionModal 
          item={selectedContradiction}
          onClose={() => setSelectedContradiction(null)}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <CandidateCompareModal 
          candidates={compareCandidatesList}
          job={activeJob}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Custom Job Description Creator Modal */}
      {showCustomJobModal && (
        <CustomJobModal 
          onClose={() => setShowCustomJobModal(false)}
          onCreated={handleJobCreated}
        />
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <ExportReportModal 
          candidates={filteredCandidates}
          job={activeJob}
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
}
