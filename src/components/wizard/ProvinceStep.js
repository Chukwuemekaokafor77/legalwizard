// src/components/wizard/ProvinceStep.js
import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, ChevronDown } from 'lucide-react';
import { PathwayService } from '../../services/PathwayService';
import JurisdictionInfoCard from '../ui/JurisdictionInfoCard';

const ProvinceStep = ({ pathway, value, onChange }) => {
  const [province, setProvince] = useState(value || '');
  const [jurisdictionInfo, setJurisdictionInfo] = useState(null);
  const [validation, setValidation] = useState({ isValid: false, message: '' });

  const pathwayService = new PathwayService();
  const provinces = pathwayService.getJurisdictions(pathway.type);

  useEffect(() => {
    const validateJurisdiction = async () => {
      if (!province) {
        setValidation({ isValid: false, message: 'Please select a province' });
        return;
      }

      const result = await pathwayService.validateJurisdiction({
        pathwayId: pathway.id,
        jurisdiction: province
      });

      setValidation(result);
      setJurisdictionInfo(result.info);
    };

    validateJurisdiction();
  }, [province]);

  const handleChange = (e) => {
    const selected = e.target.value;
    setProvince(selected);
    onChange({
      province: selected,
      isValid: validation.isValid,
      jurisdictionRules: jurisdictionInfo
    });
  };

  return (
    <div className="jurisdiction-step">
      <div className="step-header">
        <MapPin size={24} />
        <h2>Select Jurisdiction</h2>
        <span className="step-subtitle">Where are you filing?</span>
      </div>

      <div className="jurisdiction-selector">
        <select
          value={province}
          onChange={handleChange}
          className={!validation.isValid ? 'error' : ''}
        >
          <option value="">Select Province/Territory</option>
          {provinces.map(prov => (
            <option key={prov.code} value={prov.code}>
              {prov.name} ({prov.code})
            </option>
          ))}
        </select>
        <ChevronDown className="select-icon" />
      </div>

      {!validation.isValid && province && (
        <div className="validation-error">
          <AlertTriangle size={16} />
          <span>{validation.message}</span>
        </div>
      )}

      {jurisdictionInfo && (
        <JurisdictionInfoCard 
          info={jurisdictionInfo}
          pathway={pathway}
        />
      )}
    </div>
  );
};

export default ProvinceStep;