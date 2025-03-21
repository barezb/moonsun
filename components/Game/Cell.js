import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SunIcon from "../Icons/SunIcon";
import MoonIcon from "../Icons/MoonIcon";
import { EMPTY, SUN, MOON } from "../../utils/constants";

const Cell = ({
  value,
  row,
  col,
  onClick,
  isError,
  isPrefilled,
  isComplete,
  cellSize = 44, // Default cell size for mobile
}) => {
  const [showError, setShowError] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);

  // Update previous value when value changes
  useEffect(() => {
    // Small delay to enable smooth transition
    const timer = setTimeout(() => {
      setPreviousValue(value);
    }, 10);

    return () => clearTimeout(timer);
  }, [value]);

  // Delay showing errors by 1 second
  useEffect(() => {
    let timer;
    if (isError) {
      timer = setTimeout(() => {
        setShowError(true);
      }, 1000);
    } else {
      setShowError(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isError]);

  // Smooth transition animations
  const iconVariants = {
    initial: {
      opacity: 0,
      scale: 0.5,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.1,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: {
        duration: 0.1,
        ease: "easeIn",
      },
    },
  };

  // Cell content based on value
  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        {value === SUN && (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SunIcon size={cellSize * 0.75} />
          </motion.div>
        )}
        {value === MOON && (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MoonIcon size={cellSize * 0.75} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      onClick={onClick}
      whileTap={!isPrefilled ? { scale: 0.95 } : {}}
      data-testid={`cell-${row}-${col}`}
      className={`cell ${showError ? "error" : ""} ${
        isPrefilled ? "prefilled" : ""
      } ${isComplete ? "complete" : ""}`}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: isPrefilled
          ? "var(--cell-bg-alternate)"
          : "var(--cell-bg)",
        boxShadow: showError
          ? "inset 0 0 0 2px var(--error-color)"
          : isComplete
          ? "inset 0 0 0 2px var(--success-color)"
          : "none",
      }}
    >
      {renderContent()}
    </motion.div>
  );
};

export default Cell;