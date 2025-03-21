// components/Icons/CrossIcon.js
import React from "react";

const CrossIcon = ({ size = 14 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cross-icon"
    >
      <line
        x1="3"
        y1="3"
        x2="11"
        y2="11"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="3"
        x2="3"
        y2="11"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CrossIcon;