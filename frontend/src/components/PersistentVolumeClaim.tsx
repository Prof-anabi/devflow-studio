import { HardDrive, Plus, Trash2 } from 'lucide-react';

const AVAILABLE_ACCESS_MODES = ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany', 'ReadWriteOncePod'];

interface PersistentVolumeClaimProps {
  enablePvc: boolean;
  setEnablePvc: (enabled: boolean) => void;
  pvcName: string;
  setPvcName: (name: string) => void;
  storageSize: string;
  setStorageSize: (size: string) => void;
  storageClassName: string;
  setStorageClassName: (className: string) => void;
  accessModes: string[];
  addAccessMode: () => void;
  removeAccessMode: (index: number) => void;
  updateAccessMode: (index: number, mode: string) => void;
}

export default function PersistentVolumeClaim({
  enablePvc, setEnablePvc,
  pvcName, setPvcName,
  storageSize, setStorageSize,
  storageClassName, setStorageClassName,
  accessModes, addAccessMode, removeAccessMode, updateAccessMode,
}: PersistentVolumeClaimProps) {
  const availableModes = AVAILABLE_ACCESS_MODES.filter(m => !accessModes.includes(m));

  return (
    <div className="form-group glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HardDrive size={20} /> Persistent Storage
      </h2>

      {/* Enable toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <label
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '44px',
            height: '24px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={enablePvc}
            onChange={(e) => setEnablePvc(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              transition: 'all 0.3s',
              background: enablePvc ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: enablePvc ? '22px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'all 0.3s',
              }}
            />
          </span>
        </label>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Enable Persistent Volume Claim
        </span>
      </div>

      {enablePvc && (
        <>
          <div className="form-group">
            <label className="form-label">PVC Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="my-app-data"
              value={pvcName}
              onChange={(e) => setPvcName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Storage Size</label>
              <input
                type="text"
                className="form-input"
                placeholder="1Gi"
                value={storageSize}
                onChange={(e) => setStorageSize(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Storage Class</label>
              <input
                type="text"
                className="form-input"
                placeholder="standard"
                value={storageClassName}
                onChange={(e) => setStorageClassName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Access Modes
              <button
                onClick={addAccessMode}
                disabled={availableModes.length === 0}
                style={{
                  background: 'transparent', border: 'none',
                  color: availableModes.length === 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                  cursor: availableModes.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <Plus size={16} />
              </button>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {accessModes.map((mode, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    value={mode}
                    onChange={(e) => updateAccessMode(i, e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                  >
                    {AVAILABLE_ACCESS_MODES.map(m => (
                      <option key={m} value={m} disabled={m !== mode && accessModes.includes(m)}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeAccessMode(i)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {accessModes.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No access modes configured. Click + to add one.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

