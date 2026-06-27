import React from 'react';

interface StoryModalProps {
  onClose: () => void;
}

export function StoryModal({ onClose }: StoryModalProps) {
  return (
    <div className="modal-overlay">
      <div className="hud-box modal-box" style={{ maxWidth: '600px', borderColor: 'var(--color-accent)' }}>
        <h2 className="modal-title" style={{ color: 'var(--color-accent)' }}>THE HEART OF OSIRIS</h2>
        <div className="modal-content" style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <p className="question-text" style={{ fontStyle: 'italic', color: '#ccc' }}>
            "We were wrong. This was never a tomb. It is a prison."
          </p>
          <p className="question-text" style={{ marginTop: '1rem' }}>
            Before you lies a pulsating artifact of impossible geometry. Ancient inscriptions carved into the chamber walls warn that it possesses knowledge no civilization was meant to access.
          </p>
          <p style={{ marginTop: '1rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
            "Let the future remain unborn."
          </p>
          <div className="modal-actions" style={{ marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="basic-btn primary-btn" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
              Seal The Chamber
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
