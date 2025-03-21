// components/Icons/SunIcon.js
import React from "react";

const SunIcon = ({ size = 34 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="sun-icon"
    >
      {/* Sun circle with border */}
      <circle
        cx="20"
        cy="20"
        r="14"
        fill="#F8B94B"
        stroke="#E08E27"
        strokeWidth="2"
      />
    </svg>
  );
};

export default SunIcon;
