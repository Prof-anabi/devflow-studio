import { GitBranch, X } from 'lucide-react';

interface GithubPushModalProps {
  show: boolean;
  onClose: () => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  githubRepoName: string;
  setGithubRepoName: (name: string) => void;
  githubPrivate: boolean;
  setGithubPrivate: (priv: boolean) => void;
  githubPushing: boolean;
  githubResult: { url: string } | null;
  githubError: string;
  onPush: () => void;
}

export default function GithubPushModal({
  show, onClose,
  githubToken, setGithubToken,
  githubRepoName, setGithubRepoName,
  githubPrivate, setGithubPrivate,
  githubPushing, githubResult, githubError,
  onPush,
}: GithubPushModalProps) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    }}>
      <div className="glass-panel" style={{
        width: '420px', padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <GitBranch size={20} /> Push to GitHub
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {githubResult ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <p style={{ color: '#10b981', fontWeight: 600 }}>Repository created successfully!</p>
            <a
              href={githubResult.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'block', marginTop: '0.5rem' }}
            >{githubResult.url}</a>
            <button
              className="btn-primary"
              onClick={onClose}
              style={{ marginTop: '1.5rem', width: 'auto', padding: '0.5rem 2rem' }}
            >Close</button>
          </div>
        ) : (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">GitHub Personal Access Token</label>
              <input
                type="password"
                className="form-input"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Repository Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="my-infrastructure"
                value={githubRepoName}
                onChange={(e) => setGithubRepoName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Visibility</label>
              <select
                className="form-select"
                value={githubPrivate ? 'private' : 'public'}
                onChange={(e) => setGithubPrivate(e.target.value === 'private')}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            {githubError && (
              <div style={{ padding: '0.75rem', borderRadius: '6px', background: '#ef444418', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.85rem' }}>
                ❌ {githubError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { onClose(); }}
                style={{
                  padding: '0.6rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                className="btn-primary"
                onClick={onPush}
                disabled={githubPushing || !githubToken || !githubRepoName}
                style={{ width: 'auto', padding: '0.6rem 1.5rem', opacity: githubPushing ? 0.7 : 1 }}
              >
                {githubPushing ? 'Pushing...' : 'Create & Push'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

