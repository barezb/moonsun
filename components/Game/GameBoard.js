// components/Game/GameBoard.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Cell from "./Cell";
import Constraint from "./Constraint";
import { ERROR_TYPES } from "../../utils/constants";

const GameBoard = ({
  board,
  boardSize,
  prefilled,
  constraints,
  errors,
  isComplete,
  onCellClick,
}) => {
  // Log completion status when it changes
  useEffect(() => {
    if (isComplete) {
      console.log("GameBoard: Puzzle is complete!");
    }
  }, [isComplete]);
  
  const [cellSize, setCellSize] = useState(44); // Default for mobile

  // Adjust cell size based on screen width
  useEffect(() => {
    const calculateCellSize = () => {
      const maxBoardWidth = Math.min(window.innerWidth - 32, 400); // Max width with some padding
      const calculatedSize = Math.floor(maxBoardWidth / boardSize);
      setCellSize(calculatedSize);
    };

    calculateCellSize();
    window.addEventListener("resize", calculateCellSize);
    return () => window.removeEventListener("resize", calculateCellSize);
  }, [boardSize]);

  // Check if a cell is pre-filled
  const isPreFilled = (row, col) => {
    return prefilled.some((cell) => cell.row === row && cell.col === col);
  };

  // Check if a cell has an error
  const hasError = (row, col) => {
    return errors.some(
      (error) =>
        (error.type === ERROR_TYPES.ADJACENT &&
          error.row === row &&
          error.col === col) ||
        (error.type === ERROR_TYPES.CONSTRAINT_SAME &&
          ((error.constraint.row1 === row && error.constraint.col1 === col) ||
            (error.constraint.row2 === row &&
              error.constraint.col2 === col))) ||
        (error.type === ERROR_TYPES.CONSTRAINT_DIFFERENT &&
          ((error.constraint.row1 === row && error.constraint.col1 === col) ||
            (error.constraint.row2 === row && error.constraint.col2 === col)))
    );
  };

  // Check if a constraint has an error
  const hasConstraintError = (constraint) => {
    return errors.some(
      (error) =>
        (error.type === ERROR_TYPES.CONSTRAINT_SAME &&
          error.constraint.row1 === constraint.row1 &&
          error.constraint.col1 === constraint.col1 &&
          error.constraint.row2 === constraint.row2 &&
          error.constraint.col2 === constraint.col2) ||
        (error.type === ERROR_TYPES.CONSTRAINT_DIFFERENT &&
          error.constraint.row1 === constraint.row1 &&
          error.constraint.col1 === constraint.col1 &&
          error.constraint.row2 === constraint.row2 &&
          error.constraint.col2 === constraint.col2)
    );
  };

  return (
    <motion.div
      className="game-board"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ width: `${boardSize * cellSize}px`, position: "relative" }}
    >
      {board.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="board-row"
          style={{
            backgroundColor: errors.some(
              (error) =>
                error.type === ERROR_TYPES.ROW_BALANCE && error.row === rowIndex
            )
              ? "rgba(231, 116, 116, 0.1)"
              : "transparent",
            borderLeft: errors.some(
              (error) =>
                error.type === ERROR_TYPES.ROW_DUPLICATE &&
                error.rows.includes(rowIndex)
            )
              ? "2px solid var(--error-color)"
              : "none",
            borderRight: errors.some(
              (error) =>
                error.type === ERROR_TYPES.ROW_DUPLICATE &&
                error.rows.includes(rowIndex)
            )
              ? "2px solid var(--error-color)"
              : "none",
          }}
        >
          {row.map((cell, colIndex) => (
            <Cell
              key={`cell-${rowIndex}-${colIndex}`}
              value={cell}
              row={rowIndex}
              col={colIndex}
              cellSize={cellSize}
              onClick={() => onCellClick(rowIndex, colIndex)}
              isError={hasError(rowIndex, colIndex)}
              isPrefilled={isPreFilled(rowIndex, colIndex)}
              isComplete={isComplete}
              style={{
                backgroundColor: errors.some(
                  (error) =>
                    error.type === ERROR_TYPES.COL_BALANCE &&
                    error.col === colIndex
                )
                  ? "rgba(231, 116, 116, 0.1)"
                  : undefined,
                borderTop: errors.some(
                  (error) =>
                    error.type === ERROR_TYPES.COL_DUPLICATE &&
                    error.cols.includes(colIndex)
                )
                  ? "2px solid var(--error-color)"
                  : undefined,
                borderBottom: errors.some(
                  (error) =>
                    error.type === ERROR_TYPES.COL_DUPLICATE &&
                    error.cols.includes(colIndex)
                )
                  ? "2px solid var(--error-color)"
                  : undefined,
              }}
            />
          ))}
        </div>
      ))}

      {/* Render constraints */}
      {constraints.map((constraint, index) => (
        <Constraint
          key={`constraint-${index}`}
          constraint={constraint}
          hasError={hasConstraintError(constraint)}
          cellSize={cellSize}
        />
      ))}
    </motion.div>
  );
};

export default GameBoard;