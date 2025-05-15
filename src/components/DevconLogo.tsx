
import React from 'react';

interface DevconLogoProps {
  className?: string;
}

const DevconLogo: React.FC<DevconLogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-2xl font-bold tracking-wider">DEV<span className="relative">C<span className="absolute -top-1 -right-1 flex">
        <span className="h-2 w-2 rounded-full bg-devcon-yellow"></span>
        <span className="h-2 w-2 rounded-full bg-devcon-orange"></span>
      </span><span className="absolute -bottom-1 -right-1 flex">
        <span className="h-2 w-2 rounded-full bg-devcon-purple"></span>
        <span className="h-2 w-2 rounded-full bg-devcon-green"></span>
      </span></span>N</span>
    </div>
  );
};

export default DevconLogo;
