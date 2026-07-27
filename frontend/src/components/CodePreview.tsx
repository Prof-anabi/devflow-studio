import Editor from '@monaco-editor/react';

const TABS = [
  { id: 'dockerfile', label: '📄 Dockerfile' },
  { id: 'compose', label: '🐳 compose.yaml' },
  { id: 'k8s_deployment', label: '☸️ deployment.yaml' },
  { id: 'k8s_service', label: '☸️ service.yaml' },
  { id: 'k8s_pvc', label: '💾 pvc.yaml' },
  { id: 'helm_chart', label: '📦 Chart.yaml' },
  { id: 'helm_values', label: '📦 values.yaml' },
  { id: 'helm_deployment', label: '☸️ helm/deployment.yaml' },
];

interface CodePreviewProps {
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

export default function CodePreview({
  activeTab, setActiveTab, isLoading,
  dockerfileCode, composeCode, k8sDeploymentCode, k8sServiceCode, k8sPvcCode,
  helmChartCode, helmValuesCode, helmDeploymentCode,
}: CodePreviewProps) {
  const getCodeValue = () => {
    switch (activeTab) {
      case 'dockerfile': return dockerfileCode;
      case 'compose': return composeCode;
      case 'k8s_deployment': return k8sDeploymentCode;
      case 'k8s_service': return k8sServiceCode;
      case 'k8s_pvc': return k8sPvcCode;
      case 'helm_chart': return helmChartCode;
      case 'helm_values': return helmValuesCode;
      case 'helm_deployment': return helmDeploymentCode;
      default: return '';
    }
  };

  const getLanguage = () => (activeTab === 'dockerfile' ? 'dockerfile' : 'yaml');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="code-header" style={{ justifyContent: 'space-between', padding: '0', overflowX: 'auto' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                background: activeTab === tab.id ? '#1e1e1e' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#888',
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
          language={getLanguage()}
          theme="vs-dark"
          value={getCodeValue()}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
}

