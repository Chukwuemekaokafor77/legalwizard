import React from 'react';

const LegalDisclaimer = ({ accepted, onAccept }) => (
  <div className="legal-disclaimer">
    {!accepted && (
      <>
        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        <button onClick={onAccept}>Accept & Continue</button>
      </>
    )}
  </div>
);

export default LegalDisclaimer;