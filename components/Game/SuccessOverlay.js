// components/Game/SuccessOverlay.js - New component for success message
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Puzzle Solved!</h2>
            <p>Congratulations! You've successfully solved the puzzle.</p>

            <div className="success-buttons">
              <button className="success-button primary" onClick={onNewGame}>
                New Game
              </button>
              <button className="success-button secondary" onClick={onClose}>
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessOverlay;