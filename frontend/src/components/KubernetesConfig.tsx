import { Sailboat } from 'lucide-react';

interface KubernetesConfigProps {
  appName: string;
  setAppName: (name: string) => void;
  containerImage: string;
  setContainerImage: (image: string) => void;
  replicas: number;
  setReplicas: (replicas: number) => void;
  cpuLimit: string;
  setCpuLimit: (cpu: string) => void;
  memoryLimit: string;
  setMemoryLimit: (mem: string) => void;
  serviceType: string;
  setServiceType: (type: string) => void;
}

export default function KubernetesConfig({
  appName, setAppName,
  containerImage, setContainerImage,
  replicas, setReplicas,
  cpuLimit, setCpuLimit,
  memoryLimit, setMemoryLimit,
  serviceType, setServiceType,
}: KubernetesConfigProps) {
  return (
    <div className="form-group glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sailboat size={20} /> Kubernetes Config
      </h2>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">App Name</label>
          <input
            type="text"
            className="form-input"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Container Image</label>
          <input
            type="text"
            className="form-input"
            value={containerImage}
            onChange={(e) => setContainerImage(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Replicas</label>
        <input
          type="number"
          className="form-input"
          value={replicas}
          min="1"
          onChange={(e) => setReplicas(Number(e.target.value))}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">CPU Limit</label>
          <input
            type="text"
            className="form-input"
            value={cpuLimit}
            onChange={(e) => setCpuLimit(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Memory Limit</label>
          <input
            type="text"
            className="form-input"
            value={memoryLimit}
            onChange={(e) => setMemoryLimit(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Service Type</label>
        <select
          className="form-select"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        >
          <option value="ClusterIP">ClusterIP</option>
          <option value="NodePort">NodePort</option>
          <option value="LoadBalancer">LoadBalancer</option>
        </select>
      </div>
    </div>
  );
}

