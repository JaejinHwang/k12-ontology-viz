import { useState } from 'react';
import {
  COMPOUND_RULES,
  getCategoryById,
  PHASE_COLORS,
  getPhaseForCategory,
} from '../data/ontology';
import type { Category } from '../data/ontology';

interface Props {
  onSelectNode: (cat: Category) => void;
}

function ConditionNode({ node, depth, onSelectNode }: { node: any; depth: number; onSelectNode: (cat: Category) => void }) {
  if (node.type === 'AND' || node.type === 'OR' || node.type === 'SEQUENCE') {
    const shapeClass = node.type === 'AND' ? 'rule-gate-and' : node.type === 'OR' ? 'rule-gate-or' : 'rule-gate-seq';
    return (
      <div className="rule-tree-branch" style={{ marginLeft: depth * 16 }}>
        <div className={`rule-gate ${shapeClass}`}>
          {node.type}
        </div>
        <div className="rule-tree-children">
          {node.children.map((child: any, i: number) => (
            <ConditionNode key={i} node={child} depth={depth + 1} onSelectNode={onSelectNode} />
          ))}
        </div>
      </div>
    );
  }

  // Leaf node
  const cat = node.behavior ? getCategoryById(node.behavior) : null;
  const phase = cat ? getPhaseForCategory(cat.id) : null;
  const color = phase ? PHASE_COLORS[phase.id] : '#64748b';

  return (
    <div
      className="rule-leaf"
      style={{ marginLeft: depth * 16, borderLeftColor: color }}
      onClick={() => cat && onSelectNode(cat)}
    >
      {cat && (
        <span className="rule-leaf-id" style={{ color }}>{node.behavior}</span>
      )}
      {cat && <span className="rule-leaf-name">{cat.name}</span>}
      {node.state && <span className="rule-leaf-state">{node.state}</span>}
      {node.detail && <span className="rule-leaf-detail">{node.detail}</span>}
      {!cat && node.detail && <span className="rule-leaf-detail">{node.detail}</span>}
    </div>
  );
}

export default function CompoundRules({ onSelectNode }: Props) {
  const [expandedRule, setExpandedRule] = useState<string | null>(COMPOUND_RULES[0]?.id || null);

  return (
    <div className="compound-rules">
      <div className="rules-header">
        <h2>Compound Rules</h2>
        <p>복합 판단 규칙: AI 에이전트가 학습 상태를 감지하는 패턴</p>
      </div>
      <div className="rules-list">
        {COMPOUND_RULES.map(rule => {
          const isExpanded = expandedRule === rule.id;
          return (
            <div key={rule.id} className={`rule-card ${isExpanded ? 'rule-card--expanded' : ''}`}>
              <div
                className="rule-card-header"
                onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
              >
                <span className="rule-expand-icon">{isExpanded ? '▼' : '▶'}</span>
                <span className="rule-card-name">{rule.name}</span>
                {rule.confidence && (
                  <span className="rule-confidence">{rule.confidence}</span>
                )}
              </div>
              {isExpanded && (
                <div className="rule-card-body">
                  {rule.description && (
                    <p className="rule-description">{rule.description}</p>
                  )}
                  <div className="rule-conditions">
                    <div className="rule-section-label">Conditions</div>
                    <ConditionNode node={rule.conditions} depth={0} onSelectNode={onSelectNode} />
                  </div>
                  {rule.recommended_action.length > 0 && (
                    <div className="rule-actions">
                      <div className="rule-section-label">Recommended Actions</div>
                      <div className="rule-action-list">
                        {rule.recommended_action.map((action, i) => {
                          const cat = getCategoryById(action);
                          const phase = cat ? getPhaseForCategory(cat.id) : null;
                          const color = phase ? PHASE_COLORS[phase.id] : '#64748b';
                          return (
                            <div
                              key={i}
                              className="rule-action-item"
                              style={{ borderLeftColor: color }}
                              onClick={() => cat && onSelectNode(cat)}
                            >
                              {cat ? (
                                <>
                                  <span style={{ color }}>{action}</span>
                                  <span>{cat.name}</span>
                                </>
                              ) : (
                                <span className="rule-action-text">{action}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
