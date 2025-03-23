import React from 'react';

const PathwaySelection = ({ pathways, onSelect, onGuestMode }) => (
  <div className="pathway-selection">
    <h2>Select Legal Pathway</h2>
    <div className="pathway-grid">
      {pathways.map(pathway => (
        <div key={pathway.id} className="pathway-card">
          <h3>{pathway.title}</h3>
          <p>{pathway.description}</p>
          <button onClick={() => onSelect(pathway.id)}>
            Start {pathway.title}
          </button>
        </div>
      ))}
    </div>
    <button className="guest-mode" onClick={onGuestMode}>
      Continue as Guest
    </button>
  </div>
);

export default PathwaySelection;