// components/Game/Constraint.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EqualIcon from "../Icons/EqualIcon";
import CrossIcon from "../Icons/CrossIcon";
import { CONSTRAINT_TYPES } from "../../utils/constants";

const Constraint = ({ constraint, hasError, cellSize = 44 }) => {
  const { row1, col1, row2, col2, type } = constraint;
  const isHorizontal = row1 === row2;
  const [showError, setShowError] = useState(false);

  // Delay showing errors by 1 second
  useEffect(() => {
    let timer;
    if (hasError) {
      timer = setTimeout(() => {
        setShowError(true);
      }, 1000);
    } else {
      setShowError(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [hasError]);

  // Position the constraint indicator between the cells
  const getPosition = () => {
    if (isHorizontal) {
      // Horizontal constraint
      return {
        left: `${col1 * cellSize + cellSize - cellSize * 0.2}px`,
        top: `${row1 * cellSize + cellSize * 0.5 - cellSize * 0.2}px`,
      };
    } else {
      // Vertical constraint
      return {
        left: `${col1 * cellSize + cellSize * 0.5 - cellSize * 0.2}px`,
        top: `${row1 * cellSize + cellSize - cellSize * 0.2}px`,
      };
    }
  };

  return (
    <motion.div
      style={{
        position: "absolute",
        zIndex: 10,
        ...getPosition(),
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`constraint ${type} ${showError ? "error" : ""}`}
    >
      {type === CONSTRAINT_TYPES.SAME ? (
        <EqualIcon size={cellSize * 0.3} />
      ) : (
        <CrossIcon size={cellSize * 0.3} />
      )}
    </motion.div>
  );
};

export default Constraint;
