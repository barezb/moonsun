// components/Icons/MoonIcon.js - increased size
import React from 'react';

const MoonIcon = ({ size = 34 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="moon-icon"
    >
      <path 
        d="M30 15C28 14 24 14 21 16C18 18 17 22 18 25.5C19 29 23 31 27 31C29.5 31 31 30 32 29C30 32 26 33.5 22 33.5C16 33.5 11 29 11 23C11 17 16 12.5 22 12.5C25.5 12.5 28 14 30 15Z"
        fill="#6F9ED8"
        stroke="#5E8DC5"
        strokeWidth="2"
      />
    </svg>
  );
};

export default MoonIcon;