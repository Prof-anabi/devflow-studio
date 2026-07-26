import { Handle, Position } from '@xyflow/react';

const STAGE_COLORS: Record<string, string> = {
  Checkout:     '#3b82f6', // blue
  Install:      '#8b5cf6', // violet
  Test:         '#10b981', // emerald
  Lint:         '#f59e0b', // amber
  SAST:         '#ef4444', // red
  Build:        '#6366f1', // indigo
  'Push Image': '#ec4899', // pink
  Deploy:       '#14b8a6', // teal
};

const STAGE_ICONS: Record<string, string> = {
  Checkout:     '⬇️',
  Install:      '📦',
  Test:         '✅',
  Lint:         '🔍',
  SAST:         '🛡️',
  Build:        '🏗️',
  'Push Image': '🚀',
  Deploy:       '☸️',
};

interface PipelineNodeProps {
  data: { label: string };
}

export default function PipelineNode({ data }: PipelineNodeProps) {
  const color = STAGE_COLORS[data.label] ?? '#6b7280';
  const icon = STAGE_ICONS[data.label] ?? '⚙️';

  return (
    <div
      style={{
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        border: `2px solid ${color}`,
        background: `${color}22`,
        backdropFilter: 'blur(8px)',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 600,
        minWidth: 140,
        textAlign: 'center',
        boxShadow: `0 0 12px ${color}44`,
        cursor: 'grab',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <span style={{ marginRight: '0.4rem' }}>{icon}</span>
      {data.label}
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
}
