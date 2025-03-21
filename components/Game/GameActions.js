// components/Game/GameActions.js - New component for game actions
import React from "react";
import { motion } from "framer-motion";

const GameActions = ({ onNewGame, onReset, onUndo, onHint }) => {
  return (
    <div className="game-actions">
      <div className="action-row">
        <motion.button
          className="action-button primary"
          onClick={onNewGame}
          whileTap={{ scale: 0.95 }}
        >
          New Game
        </motion.button>

        <motion.button
          className="action-button secondary"
          onClick={onReset}
          whileTap={{ scale: 0.95 }}
        >
          Clear Board
        </motion.button>
      </div>

      <div className="action-row">
        <motion.button
          className="action-button tertiary"
          onClick={onUndo}
          whileTap={{ scale: 0.95 }}
          disabled={!onUndo}
        >
          Undo
        </motion.button>

        <motion.button
          className="action-button tertiary"
          onClick={onHint}
          whileTap={{ scale: 0.95 }}
        >
          Hint
        </motion.button>
      </div>
    </div>
  );
};

export default GameActions;