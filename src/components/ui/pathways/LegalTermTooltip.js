import React from 'react';

const LegalTermTooltip = ({ terms }) => (
  <div className="legal-term-tooltip">
    {Object.entries(terms).map(([term, definition]) => (
      <div key={term} className="term-definition">
        <span className="term">{term}</span>
        <span className="definition">{definition}</span>
      </div>
    ))}
  </div>
);

export default LegalTermTooltip;