import { Settings } from 'lucide-react';

interface ProjectWizardProps {
  projectType: string;
  setProjectType: (type: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  framework: string;
  setFramework: (fw: string) => void;
}

export default function ProjectWizard({ projectType, setProjectType, language, setLanguage, framework, setFramework }: ProjectWizardProps) {
  return (
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
  );
}

