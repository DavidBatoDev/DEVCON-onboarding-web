
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start mb-4">
      <div className="text-white rounded-lg rounded-tl-none p-4 max-w-[80%] md:max-w-[70%]">
        <div className="mb-1 font-semibold">DEBBIE</div>
        <div className="typing-dots">
          <span className="bg-devcon-yellow"></span>
          <span className="bg-devcon-orange"></span>
          <span className="bg-devcon-purple"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
