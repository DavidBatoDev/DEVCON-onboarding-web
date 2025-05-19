
import React from 'react';

interface DevconLogoProps {
  className?: string;
}

const DevconLogo: React.FC<DevconLogoProps> = ({ className = "" }) => {
return (
  <div className={`flex items-center gap-1 ${className}`}>
    <img
      src="/devcon-logo-true.png"
      alt="Devcon Logo"
      className="h-24 w-24 object-contain"
    /> 

  </div>
);
};

export default DevconLogo;
