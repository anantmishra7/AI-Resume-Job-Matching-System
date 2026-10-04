import React from 'react';
import { Search, Filter, ShieldAlert, ArrowUpDown } from 'lucide-react';

export default function FiltersBar({
  searchQuery, setSearchQuery,
  minScore, setMinScore,
  minExp, setMinExp,
  integrityFilter, setIntegrityFilter,
  sortBy, setSortBy,
  totalCount, filteredCount
}) {
  return (
    <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Search candidate name, skills, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Min Score Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Min Match: <strong>{minScore}%</strong>
          </span>
          <input 
            type="range"
            min="0"
            max="95"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ width: '100px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Experience Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Exp:</span>
          <select
            value={minExp}
            onChange={(e) => setMinExp(Number(e.target.value))}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={0}>All Experience</option>
            <option value={2}>2+ Years</option>
            <option value={4}>4+ Years</option>
            <option value={6}>6+ Years</option>
          </select>
        </div>

        {/* Integrity / Fraud Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Audit:</span>
          <select
            value={integrityFilter}
            onChange={(e) => setIntegrityFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Candidates</option>
            <option value="VERIFIED">Verified Only (High Integrity)</option>
            <option value="FLAGGED">⚠️ Flagged Claims Only</option>
          </select>
        </div>

        {/* Sort Order */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="score">Sort: Match Score</option>
            <option value="integrity">Sort: Integrity Score</option>
            <option value="experience">Sort: Experience (High to Low)</option>
          </select>
        </div>

        {/* Result Counter */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredCount} of {totalCount}
        </div>
      </div>
    </div>
  );
}
