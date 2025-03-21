// components/Game/Controls.js
import React from "react";
import { motion } from "framer-motion";
import { BOARD_SIZES, DIFFICULTY } from "../../utils/constants";

const Controls = ({
  boardSize,
  setBoardSize,
  difficulty,
  setDifficulty,
  onNewGame,
  onReset,
  onUndo,
  onHint,
}) => {
  return (
    <motion.div
      className="controls"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="control-row">
        <label htmlFor="board-size">Board Size:</label>
        <select
          id="board-size"
          value={boardSize}
          onChange={(e) => setBoardSize(parseInt(e.target.value))}
          className="select-input"
        >
          {BOARD_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-row">
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="select-input"
        >
          {Object.keys(DIFFICULTY).map((key) => (
            <option key={key} value={key}>
              {DIFFICULTY[key].label}
            </option>
          ))}
        </select>
      </div>

      <div className="button-row">
        <motion.button
          className="button new-game"
          onClick={onNewGame}
          whileTap={{ scale: 0.95 }}
        >
          New Game
        </motion.button>

        <motion.button
          className="button reset"
          onClick={onReset}
          whileTap={{ scale: 0.95 }}
        >
          Clear Board
        </motion.button>
      </div>

      <div className="button-row">
        <motion.button
          className="undo-button"
          onClick={onUndo}
          whileTap={{ scale: 0.95 }}
          disabled={!onUndo}
        >
          Undo
        </motion.button>

        <motion.button
          className="hint-button"
          onClick={onHint}
          whileTap={{ scale: 0.95 }}
          disabled={!onHint}
        >
          Hint
        </motion.button>
      </div>

      <style jsx>{`
        .controls {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0 1rem;
        }

        .control-row label {
          font-size: 1rem;
          color: var(--primary-color);
        }

        .select-input {
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--cell-border);
          background-color: white;
          font-size: 1rem;
          min-width: 10rem;
          color: var(--primary-color);
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 1em;
        }

        .button-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0 1rem;
        }

        .button,
        .undo-button,
        .hint-button {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .new-game {
          background-color: var(--success-color);
          color: white;
          font-weight: 500;
        }

        .reset {
          background-color: var(--button-bg);
          color: var(--primary-color);
        }

        .undo-button,
        .hint-button {
          background-color: var(--button-bg);
          color: var(--primary-color);
        }

        .undo-button:disabled,
        .hint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </motion.div>
  );
};

export default Controls;