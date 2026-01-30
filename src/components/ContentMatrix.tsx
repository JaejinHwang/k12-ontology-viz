import { useMemo, useState } from 'react';
import {
  CONTENT_FORMATS,
  CONTENT_FUNCTIONS,
  PHASES,
  PHASE_COLORS,
  getPhaseForCategory,
} from '../data/ontology';
import type { Category } from '../data/ontology';

interface Props {
  onSelectNode: (cat: Category) => void;
}

interface CellData {
  count: number;
  categories: { cat: Category; direction: 'in' | 'out' }[];
}

export default function ContentMatrix({ onSelectNode }: Props) {
  const [selectedCell, setSelectedCell] = useState<{ format: string; func: string } | null>(null);

  const matrix = useMemo(() => {
    const m: Record<string, Record<string, CellData>> = {};

    CONTENT_FORMATS.forEach(f => {
      m[f.id] = {};
      CONTENT_FUNCTIONS.forEach(fn => {
        m[f.id][fn.id] = { count: 0, categories: [] };
      });
    });

    PHASES.forEach(phase => {
      phase.categories.forEach(cat => {
        const processIO = (ios: any[] | null, direction: 'in' | 'out') => {
          if (!ios) return;
          ios.forEach(io => {
            const formats = Array.isArray(io.format) ? io.format : [io.format];
            const functions = Array.isArray(io.function) ? io.function : [io.function];
            formats.forEach((fmt: string) => {
              functions.forEach((fn: string) => {
                if (m[fmt] && m[fmt][fn]) {
                  m[fmt][fn].count++;
                  m[fmt][fn].categories.push({ cat, direction });
                }
              });
            });
          });
        };
        processIO(cat.content.consumes, 'in');
        processIO(cat.content.produces, 'out');
      });
    });

    return m;
  }, []);

  const maxCount = useMemo(() => {
    let max = 0;
    CONTENT_FORMATS.forEach(f => {
      CONTENT_FUNCTIONS.forEach(fn => {
        if (matrix[f.id][fn.id].count > max) max = matrix[f.id][fn.id].count;
      });
    });
    return max;
  }, [matrix]);

  const selectedCats = selectedCell
    ? matrix[selectedCell.format]?.[selectedCell.func]?.categories || []
    : [];

  return (
    <div className="content-matrix">
      <div className="matrix-header">
        <h2>Content Matrix</h2>
        <p>콘텐츠 포맷 x 기능 매핑: 각 조합을 사용하는 카테고리 수</p>
      </div>

      <div className="matrix-grid-wrapper">
        <table className="matrix-table">
          <thead>
            <tr>
              <th></th>
              {CONTENT_FUNCTIONS.map(fn => (
                <th key={fn.id}>{fn.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONTENT_FORMATS.map(fmt => (
              <tr key={fmt.id}>
                <td className="matrix-row-header">{fmt.name}</td>
                {CONTENT_FUNCTIONS.map(fn => {
                  const cell = matrix[fmt.id][fn.id];
                  const intensity = maxCount > 0 ? cell.count / maxCount : 0;
                  const isSelected =
                    selectedCell?.format === fmt.id && selectedCell?.func === fn.id;
                  return (
                    <td
                      key={fn.id}
                      className={`matrix-cell ${isSelected ? 'matrix-cell--selected' : ''} ${cell.count === 0 ? 'matrix-cell--empty' : ''}`}
                      style={{
                        background: cell.count > 0
                          ? `rgba(99, 102, 241, ${0.1 + intensity * 0.6})`
                          : 'transparent',
                      }}
                      onClick={() => {
                        if (cell.count > 0) {
                          setSelectedCell(
                            isSelected ? null : { format: fmt.id, func: fn.id }
                          );
                        }
                      }}
                    >
                      {cell.count > 0 ? cell.count : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && selectedCats.length > 0 && (
        <div className="matrix-detail">
          <h3>
            {CONTENT_FORMATS.find(f => f.id === selectedCell.format)?.name}
            {' x '}
            {CONTENT_FUNCTIONS.find(f => f.id === selectedCell.func)?.name}
            <span className="matrix-detail-count">({selectedCats.length})</span>
          </h3>
          <div className="matrix-detail-list">
            {selectedCats.map(({ cat, direction }, i) => {
              const phase = getPhaseForCategory(cat.id);
              const color = phase ? PHASE_COLORS[phase.id] : '#64748b';
              return (
                <div
                  key={i}
                  className="matrix-detail-item"
                  style={{ borderLeftColor: color }}
                  onClick={() => onSelectNode(cat)}
                >
                  <span className={`matrix-dir matrix-dir--${direction}`}>
                    {direction === 'in' ? 'IN' : 'OUT'}
                  </span>
                  <span className="matrix-detail-id" style={{ color }}>{cat.id}</span>
                  <span className="matrix-detail-name">{cat.name}</span>
                  {phase && <span className="matrix-detail-phase">{phase.name}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
