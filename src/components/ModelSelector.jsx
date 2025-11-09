import React from 'react';

const MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', color: '#10a37f' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', color: '#4285f4' },
  { id: 'deep-seek-r1', name: 'Deep Seek R1', provider: 'DeepSeek', color: '#d97706' },
];

export const ModelSelector = ({ selectedModel, onModelChange, disabled, compact = false }) => {
  const wrapperStyle = compact ? {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    padding: '4px 8px',
    background: 'rgba(22,37,73,0.55)',
    borderRadius: 6,
    border: '1px solid rgba(73,112,255,0.25)',
  } : {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(22, 37, 73, 0.6)',
    borderRadius: 8,
    border: '1px solid rgba(73, 112, 255, 0.3)',
  };

  const buttonBase = compact ? {
    padding: '4px 10px',
    borderRadius: 5,
    fontSize: 11,
  } : {
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
  };

  return (
    <div style={wrapperStyle}>
      <span style={{ fontSize: compact ? 12 : 13, color: '#94a3b8', fontWeight: 500 }}>Model:</span>
      <div style={{ display: 'flex', gap: compact ? 4 : 6 }}>
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => !disabled && onModelChange(model.id)}
              disabled={disabled}
              style={{
                ...buttonBase,
                border: isSelected ? `2px solid ${model.color}` : '1px solid rgba(148, 163, 184, 0.2)',
                background: isSelected ? `${model.color}22` : 'transparent',
                color: isSelected ? model.color : '#cbd5e1',
                fontWeight: isSelected ? 600 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
                lineHeight: 1.2,
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                  e.target.style.background = 'rgba(148, 163, 184, 0.1)';
                  e.target.style.borderColor = model.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                }
              }}
            >
              {model.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;
