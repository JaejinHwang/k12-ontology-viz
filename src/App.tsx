import { useState, useCallback } from 'react';
import RadialGraph from './components/RadialGraph';
import DetailPanel from './components/DetailPanel';
import LearningFlow from './components/LearningFlow';
import CompoundRules from './components/CompoundRules';
import ContentMatrix from './components/ContentMatrix';
import { RELATION_TYPES, PHASES, PHASE_COLORS, getCategoryById } from './data/ontology';
import type { Category } from './data/ontology';
import './App.css';

type ViewTab = 'graph' | 'flow' | 'rules' | 'matrix';

function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('graph');
  const [selectedNode, setSelectedNode] = useState<Category | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSelectNode = useCallback((cat: Category | null) => {
    setSelectedNode(cat);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const cat = getCategoryById(id);
    if (cat) setSelectedNode(cat);
  }, []);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );
  };

  const tabs: { id: ViewTab; label: string; labelEn: string }[] = [
    { id: 'graph', label: '관계 그래프', labelEn: 'Radial Graph' },
    { id: 'flow', label: '학습 흐름', labelEn: 'Learning Flow' },
    { id: 'rules', label: '복합 규칙', labelEn: 'Compound Rules' },
    { id: 'matrix', label: '콘텐츠 매트릭스', labelEn: 'Content Matrix' },
  ];

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="app-header">
        <div className="app-title">
          <h1>K-12 학습 행동 온톨로지</h1>
          <span className="app-subtitle">v0.4 | {PHASES.length} Phases | 43 Categories | 58 Relations</span>
        </div>
        <nav className="app-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`app-tab ${activeTab === tab.id ? 'app-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-label-en">{tab.labelEn}</span>
            </button>
          ))}
        </nav>
      </header>

      <div className="app-body">
        {/* Main Content */}
        <div className={`app-main ${selectedNode ? 'app-main--with-panel' : ''}`}>
          {/* Filter bar for graph view */}
          {activeTab === 'graph' && (
            <div className="filter-bar">
              <div className="filter-group">
                <span className="filter-label">Relations:</span>
                {RELATION_TYPES.map(rt => (
                  <button
                    key={rt.id}
                    className={`filter-btn ${activeFilters.length === 0 || activeFilters.includes(rt.id) ? 'filter-btn--active' : ''}`}
                    style={{
                      borderColor: rt.color,
                      color: activeFilters.length === 0 || activeFilters.includes(rt.id) ? rt.color : '#475569',
                    }}
                    onClick={() => toggleFilter(rt.id)}
                  >
                    <span
                      className="filter-dot"
                      style={{
                        background: activeFilters.length === 0 || activeFilters.includes(rt.id)
                          ? rt.color
                          : 'transparent',
                        borderColor: rt.color,
                      }}
                    />
                    {rt.name}
                  </button>
                ))}
                {activeFilters.length > 0 && (
                  <button className="filter-btn filter-btn--reset" onClick={() => setActiveFilters([])}>
                    Reset
                  </button>
                )}
              </div>
              <div className="filter-group">
                <span className="filter-label">Phases:</span>
                <div className="phase-legend">
                  {PHASES.map(p => (
                    <span key={p.id} className="phase-legend-item">
                      <span className="phase-dot" style={{ background: PHASE_COLORS[p.id] }} />
                      <span className="phase-legend-name">{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* View Content */}
          <div className="view-content">
            {activeTab === 'graph' && (
              <RadialGraph
                onSelectNode={handleSelectNode}
                selectedNode={selectedNode}
                activeFilters={activeFilters}
              />
            )}
            {activeTab === 'flow' && <LearningFlow onSelectNode={handleSelectNode} />}
            {activeTab === 'rules' && <CompoundRules onSelectNode={handleSelectNode} />}
            {activeTab === 'matrix' && <ContentMatrix onSelectNode={handleSelectNode} />}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <aside className="app-sidebar">
            <DetailPanel
              category={selectedNode}
              onClose={() => setSelectedNode(null)}
              onNavigate={handleNavigate}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
