// components/Game/SuccessOverlay.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const SuccessOverlay = ({ isVisible, onClose, onNewGame }) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
        >
          <motion.div
            className="success-content"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: 0.2, // Add a slight delay for the content appearance
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Puzzle Solved!
            </motion.h2>

            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Congratulations! You&apos;ve successfully solved the puzzle.
            </motion.p>

            <motion.div
              className="success-buttons"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button className="success-button primary" onClick={onNewGame}>
                New Game
              </button>
              <button className="success-button secondary" onClick={onClose}>
                Continue
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessOverlay;