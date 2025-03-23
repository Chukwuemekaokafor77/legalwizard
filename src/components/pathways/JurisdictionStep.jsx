import React, { useState } from 'react';
import { provinces } from '../../data/canadianProvinces';

const JurisdictionStep = ({ pathway, onSelect, initialValue }) => {
  const [selectedProvince, setSelectedProvince] = useState(initialValue || '');

  const handleChange = (provinceCode) => {
    setSelectedProvince(provinceCode);
    onSelect(provinceCode);
  };

  return (
    <div className="jurisdiction-step">
      <h2>Select Filing Jurisdiction</h2>
      <div className="province-grid">
        {provinces.map(province => (
          <div
            key={province.code}
            className={`province-card ${selectedProvince === province.code ? 'selected' : ''}`}
            onClick={() => handleChange(province.code)}
          >
            <h3>{province.name}</h3>
            <p>Filing Fee: ${province.filingFee}</p>
            <p>{province.courtName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JurisdictionStep;