// components/Game/index.js - Add enhanced success detection
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameBoard from "./GameBoard";
import GameActions from "./GameActions";
import GameControls from "./GameControls";
import Rules from "./Rules";
import SuccessOverlay from "./SuccessOverlay"; // New component
import { EMPTY, SUN, MOON, DIFFICULTY } from "../../utils/constants";
import {
  generatePuzzle,
  validateBoard,
  resetBoard,
} from "../../utils/gameLogic";

const Game = () => {
  // Game state
  const [boardSize, setBoardSize] = useState(6);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [board, setBoard] = useState([]);
  const [prefilled, setPrefilled] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize or reset the game when board size or difficulty changes
  useEffect(() => {
    generateNewPuzzle();
  }, [boardSize, difficulty]);

  // Add effect to detect and handle game completion
  useEffect(() => {
    if (isComplete) {
      console.log("Puzzle completed successfully!");
      setShowSuccess(true);
    }
  }, [isComplete]);

  // Generate a new puzzle
  const generateNewPuzzle = useCallback(() => {
    const { board, prefilled, constraints } = generatePuzzle(
      boardSize,
      difficulty
    );

    setBoard(board);
    setPrefilled(prefilled);
    setConstraints(constraints);
    setErrors([]);
    setIsComplete(false);
    setShowSuccess(false);
    setMoveHistory([]);
  }, [boardSize, difficulty]);

  // Toggle cell value: empty -> Sun -> Moon -> empty
  const handleCellClick = useCallback(
    (row, col) => {
      // Don't allow changing pre-filled cells
      if (prefilled.some((cell) => cell.row === row && cell.col === col)) {
        return;
      }

      // Save current state in history for undo
      setMoveHistory((prev) => [
        ...prev,
        {
          row,
          col,
          prevValue: board[row][col],
        },
      ]);

      // Create a deep copy of the board
      const newBoard = JSON.parse(JSON.stringify(board));

      // Toggle the cell state (0 -> 1 -> 2 -> 0)
      newBoard[row][col] = (newBoard[row][col] + 1) % 3;

      // Update the board state
      setBoard(newBoard);

      // Validate the board after each move
      const { errors, isComplete } = validateBoard(
        newBoard,
        boardSize,
        constraints
      );
      setErrors(errors);

      // Set completion status separately with explicit logging
      if (isComplete) {
        console.log("Board complete with no errors!");
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
    },
    [board, boardSize, constraints, prefilled]
  );

  // Reset the board (keep prefilled cells)
  const handleReset = useCallback(() => {
    const newBoard = resetBoard(board, prefilled);
    setBoard(newBoard);
    setErrors([]);
    setIsComplete(false);
    setShowSuccess(false);
    setMoveHistory([]);
  }, [board, prefilled]);

  // Undo the last move
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0) return;

    // Get the last move
    const lastMove = moveHistory[moveHistory.length - 1];
    const { row, col, prevValue } = lastMove;

    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board));

    // Set the cell back to its previous value
    newBoard[row][col] = prevValue;

    // Update the board state
    setBoard(newBoard);

    // Validate the board after undoing
    const { errors, isComplete } = validateBoard(
      newBoard,
      boardSize,
      constraints
    );
    setErrors(errors);
    setIsComplete(isComplete);

    // Remove the last move from history
    setMoveHistory((prev) => prev.slice(0, -1));
  }, [board, boardSize, constraints, moveHistory]);

  // Close success overlay
  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  // Provide a hint (placeholder)
  const handleHint = useCallback(() => {
    alert("Hint feature will be available in a future update!");
  }, []);

  // Toggle rules visibility
  const toggleRules = useCallback(() => {
    setShowRules((prev) => !prev);
  }, []);

  // Check if the board is completely filled
  const isBoardFilled = useCallback(() => {
    return board.every((row) => row.every((cell) => cell !== EMPTY));
  }, [board]);

  // Manual check for completion (for debugging)
  const checkCompletion = useCallback(() => {
    if (isBoardFilled()) {
      const { errors, isComplete } = validateBoard(
        board,
        boardSize,
        constraints
      );
      console.log(
        "Manual check - Board filled. Errors:",
        errors.length,
        "Complete:",
        isComplete
      );
      setErrors(errors);
      setIsComplete(isComplete);

      if (isComplete) {
        setShowSuccess(true);
      }
    } else {
      console.log("Manual check - Board not fully filled yet");
    }
  }, [board, boardSize, constraints, isBoardFilled]);

  return (
    <div className="game-container">
      <div className="game-content">
        <AnimatePresence mode="wait">
          <GameBoard
            key={`board-${boardSize}-${difficulty}`}
            board={board}
            boardSize={boardSize}
            prefilled={prefilled}
            constraints={constraints}
            errors={errors}
            isComplete={isComplete}
            onCellClick={handleCellClick}
          />
        </AnimatePresence>

        {/* Success overlay */}
        <SuccessOverlay
          isVisible={showSuccess}
          onClose={handleCloseSuccess}
          onNewGame={generateNewPuzzle}
        />

        {/* Game actions (under the board) */}
        <GameActions
          onNewGame={generateNewPuzzle}
          onReset={handleReset}
          onUndo={moveHistory.length > 0 ? handleUndo : null}
          onHint={handleHint}
          onCheckCompletion={checkCompletion} // Added for debugging
        />

        {/* Error message */}
        {errors.length > 0 && !isComplete && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>
              {errors.length} {errors.length === 1 ? "error" : "errors"} to fix
            </p>
          </motion.div>
        )}

        {/* Game settings */}
        <GameControls
          boardSize={boardSize}
          setBoardSize={setBoardSize}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />

        {/* Rules toggle button */}
        <button className="rules-toggle-button" onClick={toggleRules}>
          {showRules ? "Hide Rules" : "Show Rules"}
        </button>

        {/* Rules panel */}
        <Rules isVisible={showRules} onClose={toggleRules} />
      </div>
    </div>
  );
};

export default Game;