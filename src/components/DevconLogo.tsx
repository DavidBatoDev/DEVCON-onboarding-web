
import React from 'react';

interface DevconLogoProps {
  className?: string;
}

const DevconLogo: React.FC<DevconLogoProps> = ({ className = "" }) => {
return (
  <div className={`flex items-center gap-1 ${className}`}>
    <span className="text-2xl font-black tracking-wider flex items-center">
      DEVC
      <span className="relative w-6 h-6 mx-1">
        <span className="absolute top-0 left-0 w-3 h-3 rounded-full bg-devcon-yellow"></span>
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-devcon-orange"></span>
        <span className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-devcon-purple"></span>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-devcon-green"></span>
      </span>
      N
    </span>
  </div>
);
};

export default DevconLogo;
