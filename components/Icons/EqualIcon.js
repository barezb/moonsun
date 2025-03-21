// components/Icons/EqualIcon.js
import React from "react";

const EqualIcon = ({ size = 14 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="equal-icon"
    >
      <line
        x1="3"
        y1="5"
        x2="11"
        y2="5"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="9"
        x2="11"
        y2="9"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default EqualIcon;