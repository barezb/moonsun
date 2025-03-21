// components/Game/GameControls.js - Simplified controls component
import React from "react";
import { BOARD_SIZES, DIFFICULTY } from "../../utils/constants";

const GameControls = ({
  boardSize,
  setBoardSize,
  difficulty,
  setDifficulty,
}) => {
  return (
    <div className="game-controls">
      <div className="control-group">
        <label htmlFor="board-size">Board Size:</label>
        <select
          id="board-size"
          value={boardSize}
          onChange={(e) => setBoardSize(parseInt(e.target.value))}
          className="control-select"
        >
          {BOARD_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="control-select"
        >
          {Object.keys(DIFFICULTY).map((key) => (
            <option key={key} value={key}>
              {DIFFICULTY[key].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GameControls;
