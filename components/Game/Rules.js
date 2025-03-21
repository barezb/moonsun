// components/Game/Rules.js - New component for game rules
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Rules = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="rules-panel"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="rules-title">Game Rules</h2>
          <ol className="rules-list">
            <li>
              Each row and column must have an equal number of Suns and Moons
            </li>
            <li>No more than two Suns or Moons can be adjacent</li>
            <li>Each row and column must be unique</li>
            <li>(=) means cells must have the same shape</li>
            <li>(X) means cells must have opposite shapes</li>
          </ol>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Rules;
