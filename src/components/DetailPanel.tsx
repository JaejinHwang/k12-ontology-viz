import {
  PHASE_COLORS,
  RELATION_TYPES,
  SIGNAL_TYPES,
  getPhaseForCategory,
  getCategoryById,
  getIncomingRelations,
} from '../data/ontology';
import type { Category } from '../data/ontology';

interface Props {
  category: Category | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function stateColor(state: string): string {
  const positive = ['appropriate', 'complete', 'correct', 'success', 'occurred', 'high', 'good', 'stable', 'on_track', 'managed', 'adaptive', 'established', 'effective', 'accepted', 'received', 'given', 'attended', 'specific', 'strategic', 'executed', 'positive'];
  const negative = ['inappropriate', 'incomplete', 'incorrect', 'failure', 'not_occurred', 'low', 'poor', 'unstable', 'behind', 'urgent', 'unrealistic', 'avoidant', 'not_established', 'ineffective', 'rejected', 'absent', 'vague', 'quit', 'not_executed', 'negative', 'stuck', 'abandoned', 'guessed', 'skipped', 'superficial', 'low_quality', 'avoided'];
  if (positive.includes(state)) return '#22c55e';
  if (negative.includes(state)) return '#ef4444';
  return '#94a3b8';
}

function signalIcon(type: string): string {
  const st = SIGNAL_TYPES.find(s => s.id === type);
  return st?.icon || '?';
}

export default function DetailPanel({ category, onClose, onNavigate }: Props) {
  if (!category) {
    return (
      <div className="detail-panel detail-panel--empty">
        <p>노드를 클릭하면 상세 정보가 표시됩니다</p>
      </div>
    );
  }

  const phase = getPhaseForCategory(category.id);
  const phaseColor = phase ? PHASE_COLORS[phase.id] : '#666';
  const incoming = getIncomingRelations(category.id);

  return (
    <div className="detail-panel">
      <button className="detail-close" onClick={onClose}>x</button>

      {/* Header */}
      <div className="detail-header" style={{ borderLeftColor: phaseColor }}>
        <div className="detail-id" style={{ color: phaseColor }}>{category.id}</div>
        <h2 className="detail-name">{category.name}</h2>
        <div className="detail-name-en">{category.name_en}</div>
        {phase && <div className="detail-phase" style={{ background: phaseColor }}>{phase.name}</div>}
      </div>

      {/* Description */}
      <div className="detail-section">
        <p className="detail-desc">{category.description}</p>
        <div className="detail-examples">
          {category.examples.map((e, i) => (
            <span key={i} className="detail-example-tag">{e}</span>
          ))}
        </div>
      </div>

      {/* State Signals */}
      <div className="detail-section">
        <h3 className="detail-section-title">State Signals</h3>
        {Object.entries(category.state_signals).map(([state, signals]) => (
          <div key={state} className="detail-state-group">
            <div className="detail-state-label" style={{ color: stateColor(state) }}>
              <span className="detail-state-dot" style={{ background: stateColor(state) }} />
              {state}
            </div>
            <div className="detail-signals">
              {signals.map((s, i) => (
                <div key={i} className="detail-signal">
                  <span className="detail-signal-icon">{signalIcon(s.type)}</span>
                  <span className="detail-signal-type">{s.type}</span>
                  <span className="detail-signal-text">{s.indicator}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content I/O */}
      <div className="detail-section">
        <h3 className="detail-section-title">Content I/O</h3>
        {category.content.consumes && category.content.consumes.length > 0 && (
          <div className="detail-content-io">
            <span className="detail-io-label detail-io-in">IN</span>
            {category.content.consumes.map((c, i) => (
              <div key={i} className="detail-io-row">
                <span className="detail-io-formats">
                  {c.format.map(f => <span key={f} className="detail-format-tag">{f}</span>)}
                </span>
                <span className="detail-io-func">
                  {Array.isArray(c.function)
                    ? c.function.join(', ')
                    : c.function}
                </span>
              </div>
            ))}
          </div>
        )}
        {category.content.produces && category.content.produces.length > 0 && (
          <div className="detail-content-io">
            <span className="detail-io-label detail-io-out">OUT</span>
            {category.content.produces.map((c, i) => (
              <div key={i} className="detail-io-row">
                <span className="detail-io-formats">
                  {(Array.isArray(c.format) ? c.format : [c.format]).map(f => (
                    <span key={f} className="detail-format-tag">{f}</span>
                  ))}
                </span>
                <span className="detail-io-func">
                  {Array.isArray(c.function)
                    ? c.function.join(', ')
                    : c.function}
                </span>
              </div>
            ))}
          </div>
        )}
        {!category.content.consumes && !category.content.produces && (
          <p className="detail-no-data">콘텐츠 매핑 없음</p>
        )}
      </div>

      {/* Relations */}
      <div className="detail-section">
        <h3 className="detail-section-title">Relations</h3>
        {category.relations.length > 0 && (
          <div className="detail-relations">
            {category.relations.map((r, i) => {
              const rt = RELATION_TYPES.find(t => t.id === r.type);
              const targetCat = getCategoryById(r.target);
              return (
                <div
                  key={i}
                  className="detail-relation"
                  onClick={() => onNavigate(r.target)}
                >
                  <span className="detail-rel-arrow">→</span>
                  <span className="detail-rel-type" style={{ color: rt?.color }}>
                    {rt?.name || r.type}
                  </span>
                  <span className="detail-rel-target">
                    {targetCat ? `${targetCat.name} (${r.target})` : r.target}
                  </span>
                  {r.condition && (
                    <span className="detail-rel-condition">{r.condition}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {incoming.length > 0 && (
          <div className="detail-relations detail-relations--incoming">
            <div className="detail-incoming-label">Incoming</div>
            {incoming.map((r, i) => {
              const rt = RELATION_TYPES.find(t => t.id === r.type);
              const sourceCat = getCategoryById(r.source);
              return (
                <div
                  key={i}
                  className="detail-relation"
                  onClick={() => onNavigate(r.source)}
                >
                  <span className="detail-rel-arrow">←</span>
                  <span className="detail-rel-type" style={{ color: rt?.color }}>
                    {rt?.name || r.type}
                  </span>
                  <span className="detail-rel-target">
                    {sourceCat ? `${sourceCat.name} (${r.source})` : r.source}
                  </span>
                  {r.condition && (
                    <span className="detail-rel-condition">{r.condition}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {category.relations.length === 0 && incoming.length === 0 && (
          <p className="detail-no-data">관계 없음</p>
        )}
      </div>
    </div>
  );
}
