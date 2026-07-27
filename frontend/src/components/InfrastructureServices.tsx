import { Layers } from 'lucide-react';

const AVAILABLE_SERVICES = ['PostgreSQL', 'MySQL', 'Redis', 'MongoDB'];

interface InfrastructureServicesProps {
  services: string[];
  toggleService: (service: string) => void;
}

export default function InfrastructureServices({ services, toggleService }: InfrastructureServicesProps) {
  return (
    <div className="form-group glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Layers size={20} /> Infrastructure Services
      </h2>
      <div className="options-grid">
        {AVAILABLE_SERVICES.map(svc => (
          <div
            key={svc}
            className={`option-card ${services.includes(svc) ? 'selected' : ''}`}
            onClick={() => toggleService(svc)}
          >
            <h3>{svc}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

