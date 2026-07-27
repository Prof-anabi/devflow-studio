import { useState, useEffect } from 'react';
import PipelineBuilder from './components/PipelineBuilder';
import Header from './components/Header';
import InfrastructureView from './components/InfrastructureView';
import GithubPushModal from './components/GithubPushModal';
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

  // Persistent Volume Claim
  const [enablePvc, setEnablePvc] = useState(false);
  const [pvcName, setPvcName] = useState('my-app-data');
  const [storageSize, setStorageSize] = useState('1Gi');
  const [storageClassName, setStorageClassName] = useState('standard');
  const [accessModes, setAccessModes] = useState<string[]>(['ReadWriteOnce']);

  const [activeTab, setActiveTab] = useState('dockerfile');
  const [dockerfileCode, setDockerfileCode] = useState('# Generated Dockerfile will appear here...');
  const [composeCode, setComposeCode] = useState('# Generated compose.yaml will appear here...');
  const [k8sDeploymentCode, setK8sDeploymentCode] = useState('# Generated deployment.yaml will appear here...');
  const [k8sServiceCode, setK8sServiceCode] = useState('# Generated service.yaml will appear here...');
  const [k8sPvcCode, setK8sPvcCode] = useState('# Generated pvc.yaml will appear here...');
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

  // Auto-generate code when options change
  useEffect(() => {
    generateCode();
  }, [projectType, language, framework, port, envVars, services, replicas, cpuLimit, memoryLimit, serviceType, appName, containerImage, enablePvc, pvcName, storageSize, storageClassName, accessModes]);

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
    container_image: containerImage,
    persistent_volume_claim: enablePvc ? {
      name: pvcName,
      storage_size: storageSize,
      storage_class_name: storageClassName,
      access_modes: accessModes,
    } : null,
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
      if (data.k8s_pvc !== undefined) setK8sPvcCode(data.k8s_pvc || '# PVC not configured');
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

  const addAccessMode = () => {
    const nextMode = ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany', 'ReadWriteOncePod'].find(m => !accessModes.includes(m));
    if (nextMode) setAccessModes([...accessModes, nextMode]);
  };
  const removeAccessMode = (index: number) => {
    setAccessModes(accessModes.filter((_, i) => i !== index));
  };
  const updateAccessMode = (index: number, mode: string) => {
    const newModes = [...accessModes];
    newModes[index] = mode;
    setAccessModes(newModes);
  };

  const closeGithubModal = () => {
    setShowGithubModal(false);
    setGithubResult(null);
    setGithubError('');
  };

  return (
    <div className="app-container">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isExporting={isExporting}
        onExportZip={exportZip}
        onOpenGithubModal={() => setShowGithubModal(true)}
      />

      {activeView === 'infrastructure' ? (
        <InfrastructureView
          projectType={projectType}
          setProjectType={setProjectType}
          language={language}
          setLanguage={setLanguage}
          framework={framework}
          setFramework={setFramework}
          port={port}
          setPort={setPort}
          envVars={envVars}
          addEnvVar={addEnvVar}
          updateEnvVar={updateEnvVar}
          removeEnvVar={removeEnvVar}
          services={services}
          toggleService={toggleService}
          appName={appName}
          setAppName={setAppName}
          containerImage={containerImage}
          setContainerImage={setContainerImage}
          replicas={replicas}
          setReplicas={setReplicas}
          cpuLimit={cpuLimit}
          setCpuLimit={setCpuLimit}
          memoryLimit={memoryLimit}
          setMemoryLimit={setMemoryLimit}
          serviceType={serviceType}
          setServiceType={setServiceType}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLoading={isLoading}
          dockerfileCode={dockerfileCode}
          composeCode={composeCode}
          k8sDeploymentCode={k8sDeploymentCode}
          k8sServiceCode={k8sServiceCode}
          k8sPvcCode={k8sPvcCode}
          helmChartCode={helmChartCode}
          helmValuesCode={helmValuesCode}
          helmDeploymentCode={helmDeploymentCode}
          // Persistent Volume Claim
          enablePvc={enablePvc}
          setEnablePvc={setEnablePvc}
          pvcName={pvcName}
          setPvcName={setPvcName}
          storageSize={storageSize}
          setStorageSize={setStorageSize}
          storageClassName={storageClassName}
          setStorageClassName={setStorageClassName}
          accessModes={accessModes}
          addAccessMode={addAccessMode}
          removeAccessMode={removeAccessMode}
          updateAccessMode={updateAccessMode}
        />
      ) : (
        <div style={{ marginTop: '60px', height: 'calc(100vh - 60px)', width: '100%' }}>
          <PipelineBuilder language={language} appName={appName} onPipelineUpdate={handlePipelineUpdate} />
        </div>
      )}

      <GithubPushModal
        show={showGithubModal}
        onClose={closeGithubModal}
        githubToken={githubToken}
        setGithubToken={setGithubToken}
        githubRepoName={githubRepoName}
        setGithubRepoName={setGithubRepoName}
        githubPrivate={githubPrivate}
        setGithubPrivate={setGithubPrivate}
        githubPushing={githubPushing}
        githubResult={githubResult}
        githubError={githubError}
        onPush={pushToGitHub}
      />
    </div>
  );
}

export default App;

