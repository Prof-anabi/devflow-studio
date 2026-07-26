import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Editor from '@monaco-editor/react';
import PipelineNode from './PipelineNode';

type PipelineStage = Node<{ label: string }, 'pipelineNode'>;
type PipelineEdge = Edge;

const AVAILABLE_STAGES = ['Checkout', 'Install', 'Test', 'Lint', 'SAST', 'Build', 'Push Image', 'Deploy'];
const STAGE_COLORS: Record<string, string> = {
  Checkout: '#3b82f6', Install: '#8b5cf6', Test: '#10b981',
  Lint: '#f59e0b', SAST: '#ef4444', Build: '#6366f1',
  'Push Image': '#ec4899', Deploy: '#14b8a6',
};
const STAGE_ICONS: Record<string, string> = {
  Checkout: '⬇️', Install: '📦', Test: '✅', Lint: '🔍',
  SAST: '🛡️', Build: '🏗️', 'Push Image': '🚀', Deploy: '☸️',
};

const nodeTypes = { pipelineNode: PipelineNode };

interface PipelineBuilderProps {
  language: string;
  appName: string;
  onPipelineUpdate?: (code: string, config: { stages: string[]; target: string; language: string; registry: string; app_name: string }) => void;
}

export default function PipelineBuilder({ language, appName, onPipelineUpdate }: PipelineBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineStage>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<PipelineEdge>([]);
  const [target, setTarget] = useState('github-actions');
  const [registry, setRegistry] = useState('docker.io/myuser');
  const [pipelineCode, setPipelineCode] = useState('# Add stages from the palette to build your pipeline...');
  const [isLoading, setIsLoading] = useState(false);
  const [nodeId, setNodeId] = useState(1);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds)),
    [setEdges]
  );

  // Derive ordered stages from left-to-right x position of nodes
  const getOrderedStages = () =>
    [...nodes].sort((a, b) => (a.position.x ?? 0) - (b.position.x ?? 0)).map((n) => n.data.label as string);

  const generatePipeline = async () => {
    const stages = getOrderedStages();
    if (stages.length === 0) {
      const emptyCode = '# Add stages from the palette to build your pipeline...';
      setPipelineCode(emptyCode);
      if (onPipelineUpdate) onPipelineUpdate(emptyCode, { stages: [], target, language, registry, app_name: appName });
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/generate/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages, target, language, registry, app_name: appName }),
      });
      const data = await resp.json();
      if (data.pipeline) {
        setPipelineCode(data.pipeline);
        if (onPipelineUpdate) onPipelineUpdate(data.pipeline, { stages, target, language, registry, app_name: appName });
      }
    } catch {
      const errorCode = '# Backend not running — start the FastAPI server to generate pipeline files.';
      setPipelineCode(errorCode);
      if (onPipelineUpdate) onPipelineUpdate(errorCode, { stages, target, language, registry, app_name: appName });
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate whenever nodes, edges, or target changes
  useEffect(() => { generatePipeline(); }, [nodes, target, registry]);

  const addStage = (stage: string) => {
    const existing = nodes.filter((n) => n.data.label === stage).length;
    if (existing > 0) return; // no duplicates
    const id = `node-${nodeId}`;
    setNodeId((p) => p + 1);
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'pipelineNode',
        position: { x: nds.length * 180 + 20, y: 120 },
        data: { label: stage },
      },
    ]);
  };

  const targetLabels: Record<string, string> = {
    'github-actions': '🐙 GitHub Actions',
    'gitlab-ci': '🦊 GitLab CI',
    'azure-devops': '🔵 Azure DevOps',
  };
  const fileNames: Record<string, string> = {
    'github-actions': '.github/workflows/ci.yml',
    'gitlab-ci': '.gitlab-ci.yml',
    'azure-devops': 'azure-pipelines.yml',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'var(--bg-main)' }}>
      
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Export Target:
        </span>
        {Object.entries(targetLabels).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTarget(val)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: target === val ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.06)',
              color: target === val ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
          >{label}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Registry:</span>
          <input
            value={registry}
            onChange={(e) => setRegistry(e.target.value)}
            className="form-input"
            style={{ padding: '0.4rem 0.75rem', width: '200px', fontSize: '0.85rem' }}
          />
        </div>
        {isLoading && <span style={{ color: '#8b5cf6', fontSize: '0.85rem' }}>Generating...</span>}
      </div>

      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Stage Palette */}
        <div style={{
          width: '160px', flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          padding: '1rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Stages
          </p>
          {AVAILABLE_STAGES.map((stage) => {
            const alreadyAdded = nodes.some((n) => n.data.label === stage);
            return (
              <div
                key={stage}
                onClick={() => !alreadyAdded && addStage(stage)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${alreadyAdded ? '#ffffff15' : STAGE_COLORS[stage]}`,
                  background: alreadyAdded ? 'rgba(255,255,255,0.02)' : `${STAGE_COLORS[stage]}18`,
                  color: alreadyAdded ? 'var(--text-muted)' : '#f8fafc',
                  cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  opacity: alreadyAdded ? 0.4 : 1,
                }}
              >
                <span>{STAGE_ICONS[stage]}</span> {stage}
              </div>
            );
          })}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              onClick={() => { setNodes([]); setEdges([]); }}
              style={{
                width: '100%', padding: '0.5rem', borderRadius: '6px',
                border: '1px solid #ef4444', background: 'transparent',
                color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Canvas + Preview */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* React Flow Canvas */}
          <div style={{ flex: 1, position: 'relative' }}>
            {nodes.length === 0 && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5,
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Click a stage from the palette to add it</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Then drag nodes and connect them in order</p>
              </div>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              style={{ background: 'transparent' }}
            >
              <Background color="#ffffff08" variant={BackgroundVariant.Dots} />
              <Controls style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <MiniMap nodeColor={(n) => STAGE_COLORS[n.data?.label as string] ?? '#6b7280'} style={{ background: 'var(--bg-secondary)' }} />
            </ReactFlow>
          </div>

          {/* Live Code Preview */}
          <div style={{ width: '30%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)' }}>
            <div className="code-header">
              <span>📄 {fileNames[target]}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Live Preview</span>
            </div>
            <div style={{ flex: 1 }}>
              <Editor
                height="100%"
                language="yaml"
                theme="vs-dark"
                value={pipelineCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  readOnly: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 16 },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
