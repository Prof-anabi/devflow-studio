import ProjectWizard from './ProjectWizard';
import ContainerConfig from './ContainerConfig';
import InfrastructureServices from './InfrastructureServices';
import KubernetesConfig from './KubernetesConfig';
import PersistentVolumeClaim from './PersistentVolumeClaim';
import CodePreview from './CodePreview';

interface EnvVar {
  key: string;
  value: string;
}

interface InfrastructureViewProps {
  // Project Wizard
  projectType: string;
  setProjectType: (type: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  framework: string;
  setFramework: (fw: string) => void;
  // Container Config
  port: number;
  setPort: (port: number) => void;
  envVars: EnvVar[];
  addEnvVar: () => void;
  updateEnvVar: (index: number, field: 'key' | 'value', value: string) => void;
  removeEnvVar: (index: number) => void;
  // Services
  services: string[];
  toggleService: (service: string) => void;
  // K8s
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
  // Persistent Volume Claim
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
  // Code Preview
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  dockerfileCode: string;
  composeCode: string;
  k8sDeploymentCode: string;
  k8sServiceCode: string;
  k8sPvcCode: string;
  helmChartCode: string;
  helmValuesCode: string;
  helmDeploymentCode: string;
}

export default function InfrastructureView(props: InfrastructureViewProps) {
  return (
    <div className="split-pane" style={{ marginTop: '60px', width: '100%' }}>
      {/* Left Side: Builder Panel */}
      <div className="pane-half sidebar" style={{ borderRight: '1px solid var(--border-color)', width: '380px', flex: 'none' }}>
        <ProjectWizard
          projectType={props.projectType}
          setProjectType={props.setProjectType}
          language={props.language}
          setLanguage={props.setLanguage}
          framework={props.framework}
          setFramework={props.setFramework}
        />
        <ContainerConfig
          port={props.port}
          setPort={props.setPort}
          envVars={props.envVars}
          addEnvVar={props.addEnvVar}
          updateEnvVar={props.updateEnvVar}
          removeEnvVar={props.removeEnvVar}
        />
        <InfrastructureServices
          services={props.services}
          toggleService={props.toggleService}
        />
        <KubernetesConfig
          appName={props.appName}
          setAppName={props.setAppName}
          containerImage={props.containerImage}
          setContainerImage={props.setContainerImage}
          replicas={props.replicas}
          setReplicas={props.setReplicas}
          cpuLimit={props.cpuLimit}
          setCpuLimit={props.setCpuLimit}
          memoryLimit={props.memoryLimit}
          setMemoryLimit={props.setMemoryLimit}
          serviceType={props.serviceType}
          setServiceType={props.setServiceType}
        />
        <PersistentVolumeClaim
          enablePvc={props.enablePvc}
          setEnablePvc={props.setEnablePvc}
          pvcName={props.pvcName}
          setPvcName={props.setPvcName}
          storageSize={props.storageSize}
          setStorageSize={props.setStorageSize}
          storageClassName={props.storageClassName}
          setStorageClassName={props.setStorageClassName}
          accessModes={props.accessModes}
          addAccessMode={props.addAccessMode}
          removeAccessMode={props.removeAccessMode}
          updateAccessMode={props.updateAccessMode}
        />
      </div>

      {/* Right Side: Live Code Preview */}
      <div className="pane-half" style={{ display: 'flex', flexDirection: 'column' }}>
        <CodePreview
          activeTab={props.activeTab}
          setActiveTab={props.setActiveTab}
          isLoading={props.isLoading}
          dockerfileCode={props.dockerfileCode}
          composeCode={props.composeCode}
          k8sDeploymentCode={props.k8sDeploymentCode}
          k8sServiceCode={props.k8sServiceCode}
          k8sPvcCode={props.k8sPvcCode}
          helmChartCode={props.helmChartCode}
          helmValuesCode={props.helmValuesCode}
          helmDeploymentCode={props.helmDeploymentCode}
        />
      </div>
    </div>
  );
}

