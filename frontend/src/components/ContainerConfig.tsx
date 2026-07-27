import { Box, Plus, Trash2 } from 'lucide-react';

interface EnvVar {
  key: string;
  value: string;
}

interface ContainerConfigProps {
  port: number;
  setPort: (port: number) => void;
  envVars: EnvVar[];
  addEnvVar: () => void;
  updateEnvVar: (index: number, field: 'key' | 'value', value: string) => void;
  removeEnvVar: (index: number) => void;
}

export default function ContainerConfig({ port, setPort, envVars, addEnvVar, updateEnvVar, removeEnvVar }: ContainerConfigProps) {
  return (
    <div className="form-group glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Box size={20} /> Container Config
      </h2>

      <div className="form-group">
        <label className="form-label">Exposed Port</label>
        <input
          type="number"
          className="form-input"
          value={port}
          onChange={(e) => setPort(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Environment Variables
          <button
            onClick={addEnvVar}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
          >
            <Plus size={16} />
          </button>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {envVars.map((envVar, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="KEY"
                className="form-input"
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                value={envVar.key}
                onChange={(e) => updateEnvVar(i, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                className="form-input"
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                value={envVar.value}
                onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
              />
              <button
                onClick={() => removeEnvVar(i)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

