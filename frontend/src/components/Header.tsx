import { Box, CheckCircle2, GitBranch, Download, Code2, Workflow } from 'lucide-react';

interface HeaderProps {
  activeView: 'infrastructure' | 'pipeline';
  setActiveView: (view: 'infrastructure' | 'pipeline') => void;
  isExporting: boolean;
  onExportZip: () => void;
  onOpenGithubModal: () => void;
}

export default function Header({ activeView, setActiveView, isExporting, onExportZip, onOpenGithubModal }: HeaderProps) {
  return (
    <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
      <header className="topbar">
        <div className="brand">
          <Box size={24} color="#8b5cf6" />
          DevFlow Studio
        </div>
        {/* View Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '2rem' }}>
          <button
            onClick={() => setActiveView('infrastructure')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: activeView === 'infrastructure' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.06)',
              color: activeView === 'infrastructure' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s',
            }}
          >
            <Code2 size={16} /> Infrastructure
          </button>
          <button
            onClick={() => setActiveView('pipeline')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: activeView === 'pipeline' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.06)',
              color: activeView === 'pipeline' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s',
            }}
          >
            <Workflow size={16} /> Pipeline Builder
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} /> All changes saved
          </div>
          <button
            className="btn-primary"
            onClick={onOpenGithubModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #24292e 0%, #1b1f23 100%)', border: '1px solid #444' }}
          >
            <GitBranch size={16} /> Push to GitHub
          </button>
          <button
            className="btn-primary"
            onClick={onExportZip}
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.5rem 1rem', opacity: isExporting ? 0.7 : 1 }}
          >
            <Download size={16} /> {isExporting ? 'Exporting...' : 'Export ZIP'}
          </button>
        </div>
      </header>
    </div>
  );
}

