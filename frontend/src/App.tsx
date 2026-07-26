import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Download, Settings, CheckCircle2, Layers, Plus, Trash2, Sailboat, GitBranch, X, Code2, Workflow } from 'lucide-react';
import PipelineBuilder from './components/PipelineBuilder';
import './index.css';

function App() {
  const [activeView, setActiveView] = useState<'infrastructure' | 'pipeline'>('infrastructure');

  const [projectType, setProjectType] = useState('WebApp');
  const [language, setLanguage] = useState('Python');
  const [framework, setFramework] = useState('FastAPI');
  const [port, setPort] = useState(8000);
  const [envVars, setEnvVars] = useState([{ key: 'DEBUG', value: 'False' }]);
  const [services, setServices] = useState<string[]>([]);
  
  // Kubernetes Config
  const [appName, setAppName] = useState('my-app');
  const [containerImage, setContainerImage] = useState('my-app:latest');
  const [replicas, setReplicas] = useState(1);
  const [cpuLimit, setCpuLimit] = useState('500m');
  const [memoryLimit, setMemoryLimit] = useState('512Mi');
  const [serviceType, setServiceType] = useState('ClusterIP');
  
  const [activeTab, setActiveTab] = useState('dockerfile');
  const [dockerfileCode, setDockerfileCode] = useState('# Generated Dockerfile will appear here...');
  const [composeCode, setComposeCode] = useState('# Generated compose.yaml will appear here...');
  const [k8sDeploymentCode, setK8sDeploymentCode] = useState('# Generated deployment.yaml will appear here...');
  const [k8sServiceCode, setK8sServiceCode] = useState('# Generated service.yaml will appear here...');
  const [helmChartCode, setHelmChartCode] = useState('# Generated Chart.yaml will appear here...');
  const [helmValuesCode, setHelmValuesCode] = useState('# Generated values.yaml will appear here...');
  const [helmDeploymentCode, setHelmDeploymentCode] = useState('# Generated helm deployment will appear here...');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // GitHub Push Modal State
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepoName, setGithubRepoName] = useState(appName);
  const [githubPrivate, setGithubPrivate] = useState(true);
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubResult, setGithubResult] = useState<{ url: string } | null>(null);
  const [githubError, setGithubError] = useState('');

  // Pipeline state (lifted from PipelineBuilder)
  const [pipelineCode, setPipelineCode] = useState('# Add stages from the palette to build your pipeline...');
  const [pipelineConfig, setPipelineConfig] = useState({ stages: [] as string[], target: 'github-actions', language: 'Python', registry: 'docker.io/myuser', app_name: 'my-app' });
  const handlePipelineUpdate = (code: string, config: typeof pipelineConfig) => {
    setPipelineCode(code);
    setPipelineConfig(config);
  };

  const AVAILABLE_SERVICES = ['PostgreSQL', 'MySQL', 'Redis', 'MongoDB'];

  // Auto-generate code when options change
  useEffect(() => {
    generateCode();
  }, [projectType, language, framework, port, envVars, services, replicas, cpuLimit, memoryLimit, serviceType, appName, containerImage]);

  const getPayload = () => ({
    project_type: projectType,
    language: language,
    framework: framework,
    port: port,
    env_vars: envVars.reduce((acc, curr) => {
      if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
      return acc;
    }, {} as Record<string, string>),
    services: services,
    replicas: replicas,
    cpu_limit: cpuLimit,
    memory_limit: memoryLimit,
    service_type: serviceType,
    app_name: appName,
    container_image: containerImage
  });

  const generateCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      const data = await response.json();
      if (data.dockerfile) setDockerfileCode(data.dockerfile);
      if (data.compose) setComposeCode(data.compose);
      if (data.k8s_deployment) setK8sDeploymentCode(data.k8s_deployment);
      if (data.k8s_service) setK8sServiceCode(data.k8s_service);
      if (data.helm_chart) setHelmChartCode(data.helm_chart);
      if (data.helm_values) setHelmValuesCode(data.helm_values);
      if (data.helm_deployment) setHelmDeploymentCode(data.helm_deployment);
    } catch (error) {
      console.error("Failed to fetch generated code", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportZip = async () => {
    setIsExporting(true);
    try {
      if (activeView === 'pipeline') {
        // Export pipeline YAML
        const response = await fetch('http://localhost:8000/export/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pipelineConfig)
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${pipelineConfig.app_name}-pipeline.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Export infrastructure ZIP
        const response = await fetch('http://localhost:8000/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getPayload())
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'devflow-infrastructure.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export ZIP file. Is the backend running?');
    } finally {
      setIsExporting(false);
    }
  };

  const pushToGitHub = async () => {
    setGithubPushing(true);
    setGithubError('');
    setGithubResult(null);
    try {
      const resp = await fetch('http://localhost:8000/push-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken, repo_name: githubRepoName, private: githubPrivate, config: getPayload() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail ?? 'Unknown error');
      setGithubResult({ url: data.repo_url });
    } catch (e: any) {
      setGithubError(e.message ?? 'Push failed');
    } finally {
      setGithubPushing(false);
    }
  };

  const toggleService = (service: string) => {
    setServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }]);
  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const newVars = [...envVars];
    newVars[index][field] = value;
    setEnvVars(newVars);
  };
  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
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
                onClick={() => setShowGithubModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #24292e 0%, #1b1f23 100%)', border: '1px solid #444' }}
              >
                <GitBranch size={16} /> Push to GitHub
              </button>
              <button 
                className="btn-primary" 
                onClick={exportZip}
                disabled={isExporting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.5rem 1rem', opacity: isExporting ? 0.7 : 1 }}
              >
                <Download size={16} /> {isExporting ? 'Exporting...' : 'Export ZIP'}
              </button>
            </div>
        </header>
      </div>

      {activeView === 'infrastructure' ? (
        <div className="split-pane" style={{ marginTop: '60px', width: '100%' }}>
          {/* Left Side: Builder Panel */}
          <div className="pane-half sidebar" style={{ borderRight: '1px solid var(--border-color)', width: '380px', flex: 'none' }}>
            
            {/* Base Setup */}
            <div className="form-group glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} /> Project Wizard
              </h2>
              
              <div className="form-group">
                <label className="form-label">Project Type</label>
                <div className="options-grid">
                  {['WebApp', 'API', 'Worker', 'Static'].map(type => (
                    <div 
                      key={type}
                      className={`option-card ${projectType === type ? 'selected' : ''}`}
                      onClick={() => setProjectType(type)}
                    >
                      <h3>{type}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Language</label>
                <div className="options-grid">
                  {['Python', 'Node.js', 'Go', 'Java'].map(lang => (
                    <div 
                      key={lang}
                      className={`option-card ${language === lang ? 'selected' : ''}`}
                      onClick={() => setLanguage(lang)}
                    >
                      <h3>{lang}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Framework</label>
                <select 
                  className="form-select" 
                  value={framework} 
                  onChange={(e) => setFramework(e.target.value)}
                >
                  <option value="FastAPI">FastAPI</option>
                  <option value="Django">Django</option>
                  <option value="Flask">Flask</option>
                  <option value="Express">Express</option>
                </select>
              </div>
            </div>

            {/* Advanced Container Setup */}
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

            {/* Docker Compose Services */}
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
            
            {/* Kubernetes Setup */}
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

          </div>

          {/* Right Side: Live Code Preview */}
          <div className="pane-half" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="code-header" style={{ justifyContent: 'space-between', padding: '0', overflowX: 'auto' }}>
              <div style={{ display: 'flex' }}>
                {[
                  { id: 'dockerfile', label: '📄 Dockerfile' },
                  { id: 'compose', label: '🐳 compose.yaml' },
                  { id: 'k8s_deployment', label: '☸️ deployment.yaml' },
                  { id: 'k8s_service', label: '☸️ service.yaml' },
                  { id: 'helm_chart', label: '📦 Chart.yaml' },
                  { id: 'helm_values', label: '📦 values.yaml' },
                  { id: 'helm_deployment', label: '☸️ helm/deployment.yaml' }
                ].map(tab => (
                  <div 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                      padding: '0.75rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
                      borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      background: activeTab === tab.id ? '#1e1e1e' : 'transparent',
                      color: activeTab === tab.id ? '#fff' : '#888'
                    }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>
                {isLoading && <span style={{ color: '#8b5cf6' }}>Generating...</span>}
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative', background: '#1e1e1e' }}>
              <Editor
                height="100%"
                language={activeTab === 'dockerfile' ? 'dockerfile' : 'yaml'}
                theme="vs-dark"
                value={
                  activeTab === 'dockerfile' ? dockerfileCode : 
                  activeTab === 'compose' ? composeCode :
                  activeTab === 'k8s_deployment' ? k8sDeploymentCode :
                  activeTab === 'k8s_service' ? k8sServiceCode :
                  activeTab === 'helm_chart' ? helmChartCode :
                  activeTab === 'helm_values' ? helmValuesCode :
                  helmDeploymentCode
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  readOnly: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 16 }
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '60px', height: 'calc(100vh - 60px)', width: '100%' }}>
          <PipelineBuilder language={language} appName={appName} onPipelineUpdate={handlePipelineUpdate} />
        </div>
      )}

      {/* GitHub Push Modal */}
      {showGithubModal && (
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
                onClick={() => { setShowGithubModal(false); setGithubResult(null); setGithubError(''); }}
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
                  onClick={() => { setShowGithubModal(false); setGithubResult(null); }}
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
                    onClick={() => { setShowGithubModal(false); setGithubError(''); }}
                    style={{
                      padding: '0.6rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)',
                      background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                    }}
                  >Cancel</button>
                  <button
                    className="btn-primary"
                    onClick={pushToGitHub}
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
      )}
    </div>
  );
}

export default App;
