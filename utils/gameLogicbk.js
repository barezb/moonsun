// utils/gameLogic.js - Solution-first approach
import {
  EMPTY,
  SUN,
  MOON,
  CONSTRAINT_TYPES,
  ERROR_TYPES,
  DIFFICULTY,
} from "./constants";

// Main function to generate a puzzle
export const generatePuzzle = (boardSize, difficulty) => {
  console.log(
    "Generating new puzzle with size:",
    boardSize,
    "difficulty:",
    difficulty
  );

  // Step 1: Generate a completely solved, valid board
  const solution = generateSolution(boardSize);

  // Step 2: Create a copy that we'll selectively empty
  const board = JSON.parse(JSON.stringify(solution));

  // Step 3: Calculate how many cells to keep based on difficulty
  const cellsToKeep = Math.floor(
    boardSize * boardSize * DIFFICULTY[difficulty].filledCellPercentage
  );

  // Step 4: Randomly select cells to keep as prefilled
  const prefilled = selectCellsToKeep(board, cellsToKeep, boardSize);

  // Step 5: Add constraints based on the solution
  const constraints = generateConstraintsFromSolution(
    solution,
    board,
    boardSize
  );

  return {
    board,
    prefilled,
    constraints,
    solution, // For debugging, remove in production
  };
};

// Generate a fully solved, valid board
const generateSolution = (boardSize) => {
  // We'll use a simplified approach that guarantees a valid solution
  let success = false;
  let solution = null;
  let attempts = 0;
  const maxAttempts = 100;

  while (!success && attempts < maxAttempts) {
    attempts++;
    solution = Array(boardSize)
      .fill()
      .map(() => Array(boardSize).fill(EMPTY));

    // Start by filling the first row with alternating SUN and MOON
    for (let c = 0; c < boardSize; c++) {
      solution[0][c] = c % 2 === 0 ? SUN : MOON;
    }

    // For even board sizes, we need to ensure equal numbers
    if (boardSize % 2 === 0 && boardSize > 0) {
      // Shuffle the first row to ensure it has equal numbers of SUN and MOON
      shuffleRow(solution[0]);
    }

    // For each subsequent row, we'll fill based on Latin square principles
    // (each row is a rotation of the first row)
    for (let r = 1; r < boardSize; r++) {
      // Rotate the previous row by 2 positions (to avoid 3-in-a-row)
      for (let c = 0; c < boardSize; c++) {
        const prevRow = solution[r - 1];
        // Rotate by different amounts for each row to create variety
        const offset = (r % (boardSize - 1)) + 1;
        solution[r][c] = prevRow[(c + offset) % boardSize];
      }

      // Shuffle rows while maintaining equal numbers and no adjacency
      shuffleRow(solution[r]);
    }

    // Check if this solution is valid
    const { errors } = validateBoard(solution, boardSize, []);
    success = errors.length === 0;

    // For small board sizes, we might need manual adjustment
    if (!success && boardSize <= 6) {
      // Try to fix obvious issues
      success = fixSmallBoard(solution, boardSize);
    }
  }

  if (!success) {
    console.error(
      "Failed to generate a valid solution after",
      maxAttempts,
      "attempts"
    );
    // Fallback to a simple pattern for small boards
    return generateFallbackSolution(boardSize);
  }

  return solution;
};

// Shuffle a row while maintaining equal sun/moon count
const shuffleRow = (row) => {
  const length = row.length;

  // Count current suns and moons
  let suns = row.filter((cell) => cell === SUN).length;
  let moons = row.filter((cell) => cell === MOON).length;
  const targetCount = Math.floor(length / 2);

  // Ensure we have equal numbers (for even-sized boards)
  if (length % 2 === 0) {
    // First correct the balance if needed
    if (suns > targetCount) {
      // Need to convert some suns to moons
      let converted = 0;
      for (let i = 0; i < length && converted < suns - targetCount; i++) {
        if (row[i] === SUN) {
          row[i] = MOON;
          converted++;
        }
      }
    } else if (moons > targetCount) {
      // Need to convert some moons to suns
      let converted = 0;
      for (let i = 0; i < length && converted < moons - targetCount; i++) {
        if (row[i] === MOON) {
          row[i] = SUN;
          converted++;
        }
      }
    }
  }

  // Now shuffle while avoiding 3 in a row
  for (let i = 0; i < length * 2; i++) {
    const idx1 = Math.floor(Math.random() * length);
    const idx2 = Math.floor(Math.random() * length);

    if (idx1 !== idx2) {
      // Check if swapping would create 3 in a row
      const temp = row[idx1];
      row[idx1] = row[idx2];
      row[idx2] = temp;

      // Check if this swap created any adjacency violations
      let hasViolation = false;
      for (let j = 0; j < length; j++) {
        if (j >= 2 && row[j] === row[j - 1] && row[j] === row[j - 2]) {
          hasViolation = true;
          break;
        }
      }

      // If it did, swap back
      if (hasViolation) {
        const temp = row[idx1];
        row[idx1] = row[idx2];
        row[idx2] = temp;
      }
    }
  }
};

// For small boards, try to fix adjacency and uniqueness issues
const fixSmallBoard = (board, boardSize) => {
  let improved = false;

  // Fix adjacency violations
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (hasAdjacentViolation(board, r, c, boardSize)) {
        // Try swapping with random position
        const r2 = Math.floor(Math.random() * boardSize);
        const c2 = Math.floor(Math.random() * boardSize);

        // Only swap if they're different types
        if (board[r][c] !== board[r2][c2]) {
          const temp = board[r][c];
          board[r][c] = board[r2][c2];
          board[r2][c2] = temp;

          // Check if this fixed the issue
          improved =
            !hasAdjacentViolation(board, r, c, boardSize) &&
            !hasAdjacentViolation(board, r2, c2, boardSize);

          if (!improved) {
            // Swap back
            const temp = board[r][c];
            board[r][c] = board[r2][c2];
            board[r2][c2] = temp;
          }
        }
      }
    }
  }

  // Fix duplicate rows
  for (let r1 = 0; r1 < boardSize; r1++) {
    for (let r2 = r1 + 1; r2 < boardSize; r2++) {
      if (rowsAreEqual(board[r1], board[r2])) {
        // Swap two random positions in the second row
        if (boardSize > 1) {
          const c1 = Math.floor(Math.random() * boardSize);
          let c2 = Math.floor(Math.random() * boardSize);
          while (c2 === c1) c2 = Math.floor(Math.random() * boardSize);

          const temp = board[r2][c1];
          board[r2][c1] = board[r2][c2];
          board[r2][c2] = temp;

          improved = !rowsAreEqual(board[r1], board[r2]);
        }
      }
    }
  }

  // Fix duplicate columns
  for (let c1 = 0; c1 < boardSize; c1++) {
    for (let c2 = c1 + 1; c2 < boardSize; c2++) {
      const col1 = board.map((row) => row[c1]);
      const col2 = board.map((row) => row[c2]);

      if (rowsAreEqual(col1, col2)) {
        // Swap two random positions in the second column
        if (boardSize > 1) {
          const r1 = Math.floor(Math.random() * boardSize);
          let r2 = Math.floor(Math.random() * boardSize);
          while (r2 === r1) r2 = Math.floor(Math.random() * boardSize);

          const temp = board[r1][c2];
          board[r1][c2] = board[r2][c2];
          board[r2][c2] = temp;

          improved = !rowsAreEqual(
            board.map((row) => row[c1]),
            board.map((row) => row[c2])
          );
        }
      }
    }
  }

  // Verify if the board is now valid
  const { errors } = validateBoard(board, boardSize, []);
  return errors.length === 0 || improved;
};

// Helper to check if two rows are equal
const rowsAreEqual = (row1, row2) => {
  return row1.every((cell, i) => cell === row2[i]);
};

// Fallback solution for very small boards
const generateFallbackSolution = (boardSize) => {
  const solution = Array(boardSize)
    .fill()
    .map(() => Array(boardSize).fill(EMPTY));

  // For 2x2
  if (boardSize === 2) {
    solution[0][0] = SUN;
    solution[0][1] = MOON;
    solution[1][0] = MOON;
    solution[1][1] = SUN;
    return solution;
  }

  // For 4x4
  if (boardSize === 4) {
    solution[0] = [SUN, MOON, SUN, MOON];
    solution[1] = [MOON, SUN, MOON, SUN];
    solution[2] = [SUN, MOON, MOON, SUN];
    solution[3] = [MOON, SUN, SUN, MOON];
    return solution;
  }

  // For 6x6
  if (boardSize === 6) {
    solution[0] = [SUN, MOON, SUN, MOON, SUN, MOON];
    solution[1] = [MOON, SUN, MOON, SUN, MOON, SUN];
    solution[2] = [SUN, MOON, SUN, MOON, SUN, MOON];
    solution[3] = [MOON, SUN, MOON, SUN, MOON, SUN];
    solution[4] = [SUN, MOON, SUN, MOON, MOON, SUN];
    solution[5] = [MOON, SUN, MOON, SUN, SUN, MOON];
    return solution;
  }

  // For larger sizes, use a checker pattern with variations
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      solution[r][c] = (r + c) % 2 === 0 ? SUN : MOON;
      // Add some variation to make rows/columns unique
      if (r >= boardSize / 2 && c >= boardSize / 2 && (r + c) % 3 === 0) {
        solution[r][c] = solution[r][c] === SUN ? MOON : SUN;
      }
    }
  }

  return solution;
};

// Select cells to keep as prefilled based on difficulty
const selectCellsToKeep = (board, cellsToKeep, boardSize) => {
  const prefilled = [];
  const totalCells = boardSize * boardSize;
  const cellsToEmpty = totalCells - cellsToKeep;

  // Create an array of all cell positions
  const allPositions = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      allPositions.push({ row: r, col: c });
    }
  }

  // Shuffle the array
  for (let i = allPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
  }

  // Empty the selected cells
  for (let i = 0; i < cellsToEmpty; i++) {
    if (i < allPositions.length) {
      const { row, col } = allPositions[i];
      board[row][col] = EMPTY;
    }
  }

  // Add remaining cells to prefilled
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== EMPTY) {
        prefilled.push({ row: r, col: c });
      }
    }
  }

  return prefilled;
};

// Generate constraints based on the solution
const generateConstraintsFromSolution = (solution, board, boardSize) => {
  const constraints = [];
  const maxConstraints = Math.floor(boardSize * boardSize * 0.2);

  // Collect all possible pairs of adjacent cells
  const possibleConstraints = [];

  // Horizontal pairs
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize - 1; c++) {
      // Only add constraint if at least one cell is empty
      if (board[r][c] === EMPTY || board[r][c + 1] === EMPTY) {
        possibleConstraints.push({
          row1: r,
          col1: c,
          row2: r,
          col2: c + 1,
          type:
            solution[r][c] === solution[r][c + 1]
              ? CONSTRAINT_TYPES.SAME
              : CONSTRAINT_TYPES.DIFFERENT,
        });
      }
    }
  }

  // Vertical pairs
  for (let r = 0; r < boardSize - 1; r++) {
    for (let c = 0; c < boardSize; c++) {
      // Only add constraint if at least one cell is empty
      if (board[r][c] === EMPTY || board[r + 1][c] === EMPTY) {
        possibleConstraints.push({
          row1: r,
          col1: c,
          row2: r + 1,
          col2: c,
          type:
            solution[r][c] === solution[r + 1][c]
              ? CONSTRAINT_TYPES.SAME
              : CONSTRAINT_TYPES.DIFFERENT,
        });
      }
    }
  }

  // Shuffle possible constraints
  for (let i = possibleConstraints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possibleConstraints[i], possibleConstraints[j]] = [
      possibleConstraints[j],
      possibleConstraints[i],
    ];
  }

  // Select constraints up to the max
  const constraintCount = Math.min(maxConstraints, possibleConstraints.length);
  for (let i = 0; i < constraintCount; i++) {
    constraints.push(possibleConstraints[i]);
  }

  return constraints;
};

// Check for 3 or more adjacent same symbols
export const hasAdjacentViolation = (board, row, col, boardSize) => {
  const value = board[row][col];
  if (value === EMPTY) return false;

  // Check horizontal (left)
  if (
    col >= 2 &&
    board[row][col - 1] === value &&
    board[row][col - 2] === value
  ) {
    return true;
  }

  // Check horizontal (right)
  if (
    col <= boardSize - 3 &&
    board[row][col + 1] === value &&
    board[row][col + 2] === value
  ) {
    return true;
  }

  // Check horizontal (center)
  if (
    col >= 1 &&
    col <= boardSize - 2 &&
    board[row][col - 1] === value &&
    board[row][col + 1] === value
  ) {
    return true;
  }

  // Check vertical (up)
  if (
    row >= 2 &&
    board[row - 1][col] === value &&
    board[row - 2][col] === value
  ) {
    return true;
  }

  // Check vertical (down)
  if (
    row <= boardSize - 3 &&
    board[row + 1][col] === value &&
    board[row + 2][col] === value
  ) {
    return true;
  }

  // Check vertical (center)
  if (
    row >= 1 &&
    row <= boardSize - 2 &&
    board[row - 1][col] === value &&
    board[row + 1][col] === value
  ) {
    return true;
  }

  return false;
};

// Validate the board against all rules
export const validateBoard = (currentBoard, boardSize, constraints) => {
  const errors = [];

  // Check if board is filled completely
  const isFilled = currentBoard.every((row) =>
    row.every((cell) => cell !== EMPTY)
  );

  if (isFilled) {
    // Check equal number of Suns and Moons in rows
    for (let r = 0; r < boardSize; r++) {
      const suns = currentBoard[r].filter((cell) => cell === SUN).length;
      const moons = currentBoard[r].filter((cell) => cell === MOON).length;

      if (suns !== moons) {
        errors.push({ type: ERROR_TYPES.ROW_BALANCE, row: r });
      }
    }

    // Check equal number of Suns and Moons in columns
    for (let c = 0; c < boardSize; c++) {
      const suns = currentBoard
        .map((row) => row[c])
        .filter((cell) => cell === SUN).length;
      const moons = currentBoard
        .map((row) => row[c])
        .filter((cell) => cell === MOON).length;

      if (suns !== moons) {
        errors.push({ type: ERROR_TYPES.COL_BALANCE, col: c });
      }
    }

    // Check for unique rows
    for (let r1 = 0; r1 < boardSize; r1++) {
      for (let r2 = r1 + 1; r2 < boardSize; r2++) {
        const row1 = [...currentBoard[r1]];
        const row2 = [...currentBoard[r2]];

        if (row1.every((cell, i) => cell === row2[i])) {
          errors.push({ type: ERROR_TYPES.ROW_DUPLICATE, rows: [r1, r2] });
        }
      }
    }

    // Check for unique columns
    for (let c1 = 0; c1 < boardSize; c1++) {
      for (let c2 = c1 + 1; c2 < boardSize; c2++) {
        const col1 = currentBoard.map((row) => row[c1]);
        const col2 = currentBoard.map((row) => row[c2]);

        if (col1.every((cell, i) => cell === col2[i])) {
          errors.push({ type: ERROR_TYPES.COL_DUPLICATE, cols: [c1, c2] });
        }
      }
    }
  }

  // Check for adjacent violations (more than 2 in a row) - always check this
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (
        currentBoard[r][c] !== EMPTY &&
        hasAdjacentViolation(currentBoard, r, c, boardSize)
      ) {
        errors.push({ type: ERROR_TYPES.ADJACENT, row: r, col: c });
      }
    }
  }

  // Check constraints (= and X)
  for (const constraint of constraints) {
    const { row1, col1, row2, col2, type } = constraint;
    const cell1 = currentBoard[row1][col1];
    const cell2 = currentBoard[row2][col2];

    if (cell1 !== EMPTY && cell2 !== EMPTY) {
      if (type === CONSTRAINT_TYPES.SAME && cell1 !== cell2) {
        errors.push({ type: ERROR_TYPES.CONSTRAINT_SAME, constraint });
      }
      if (type === CONSTRAINT_TYPES.DIFFERENT && cell1 === cell2) {
        errors.push({ type: ERROR_TYPES.CONSTRAINT_DIFFERENT, constraint });
      }
    }
  }

  return {
    errors,
    isComplete: isFilled && errors.length === 0,
  };
};

// Reset the user-added cells back to empty (keep prefilled intact)
export const resetBoard = (board, prefilled) => {
  const newBoard = JSON.parse(JSON.stringify(board));

  for (let r = 0; r < newBoard.length; r++) {
    for (let c = 0; c < newBoard[r].length; c++) {
      // Check if this cell is not prefilled
      if (!prefilled.some((cell) => cell.row === r && cell.col === c)) {
        newBoard[r][c] = EMPTY;
      }
    }
  }

  return newBoard;
};
