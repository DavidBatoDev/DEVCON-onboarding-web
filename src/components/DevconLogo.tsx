
import React from 'react';

interface DevconLogoProps {
  className?: string;
}

const DevconLogo: React.FC<DevconLogoProps> = ({ className = "" }) => {
return (
  <div className={`flex items-center gap-1 ${className}`}>
    <img
      src="/DEVCON Logo.png"
      alt="Devcon Logo"
      className="h-10 w-[100px] object-contain"
    /> 

  </div>
);
};

export default DevconLogo;
