// utils/gameLogic.js - Fixed solution-first approach
import { EMPTY, SUN, MOON, CONSTRAINT_TYPES, ERROR_TYPES, DIFFICULTY } from './constants';

// Main function to generate a puzzle
export const generatePuzzle = (boardSize, difficulty) => {
  console.log("Generating new puzzle with size:", boardSize, "difficulty:", difficulty);
  
  // Step 1: Generate a completely solved, valid board
  const solution = generateValidSolution(boardSize);
  
  if (!solution) {
    console.error("Failed to generate a valid solution");
    return generateFallbackPuzzle(boardSize, difficulty);
  }
  
  // Verify solution is valid
  const { errors } = validateBoard(solution, boardSize, []);
  if (errors.length > 0) {
    console.error("Generated solution has errors:", errors);
    return generateFallbackPuzzle(boardSize, difficulty);
  }
  
  // Step 2: Create a copy that we'll selectively empty
  const board = JSON.parse(JSON.stringify(solution));
  
  // Step 3: Calculate how many cells to keep based on difficulty
  const cellsToKeep = Math.floor(
    boardSize * boardSize * DIFFICULTY[difficulty].filledCellPercentage
  );
  
  // Step 4: Randomly select cells to keep as prefilled
  const prefilled = selectCellsToKeep(board, cellsToKeep, boardSize);
  
  // Step 5: Add constraints based on the solution
  const constraints = generateConstraintsFromSolution(solution, board, boardSize);
  
  // Step 6: Verify that the puzzle is solvable with these constraints
  const isSolvable = verifySolvability(board, constraints, solution, boardSize);
  
  if (!isSolvable) {
    console.warn("Generated puzzle might not be uniquely solvable, trying again");
    return generatePuzzle(boardSize, difficulty);
  }
  
  return {
    board,
    prefilled,
    constraints
  };
};

// Generate a valid solution using Latin square technique
const generateValidSolution = (boardSize) => {
  // For even-sized boards, we need to ensure balance
  if (boardSize % 2 !== 0) {
    console.error("Board size must be even");
    return null;
  }
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Create an empty board
    const solution = Array(boardSize).fill().map(() => Array(boardSize).fill(EMPTY));
    
    // Generate a Latin square pattern that guarantees balance and no adjacency
    if (generateLatinSquare(solution, boardSize)) {
      // Verify the solution
      if (verifySolution(solution, boardSize)) {
        return solution;
      }
    }
  }
  
  console.error("Failed to generate valid solution after", maxAttempts, "attempts");
  return null;
};

// Generate a Latin square pattern with Sun/Moon balance
const generateLatinSquare = (board, size) => {
  // For a Latin square, each row and column has exactly one of each symbol
  // For our game with only 2 symbols and an even size, we need half of each
  
  // First, create a pattern for the first row
  const firstRow = [];
  for (let i = 0; i < size; i++) {
    // Alternate Sun and Moon to avoid adjacency, then shuffle
    firstRow.push(i % 2 === 0 ? SUN : MOON);
  }
  
  // Shuffle the first row while maintaining balance and avoiding adjacency
  shuffleRowWithConstraints(firstRow, size);
  
  // Copy to the board
  for (let c = 0; c < size; c++) {
    board[0][c] = firstRow[c];
  }
  
  // For each subsequent row, shift the pattern
  for (let r = 1; r < size; r++) {
    // Different shift amount for each row to avoid patterns
    const shift = (r % (size/2)) + 1;
    
    // Create the row by shifting
    for (let c = 0; c < size; c++) {
      const sourceCol = (c + shift) % size;
      board[r][c] = board[r-1][sourceCol];
    }
    
    // Shuffle this row to add variety while maintaining constraints
    shuffleRowWithConstraints(board[r], size);
    
    // Check if this row creates any violations with previous rows
    for (let c = 0; c < size; c++) {
      // Check vertical adjacency
      if (r >= 2 && 
          board[r][c] === board[r-1][c] && 
          board[r-1][c] === board[r-2][c]) {
        // Try to swap with another position
        let swapped = false;
        for (let c2 = 0; c2 < size && !swapped; c2++) {
          if (c2 !== c && board[r][c2] !== board[r][c] && 
              !(c2 >= 2 && board[r][c2-1] === board[r][c] && board[r][c2-2] === board[r][c]) &&
              !(c2 < size-2 && board[r][c2+1] === board[r][c] && board[r][c2+2] === board[r][c]) &&
              !(r < size-1 && board[r+1][c2] === board[r][c]) &&
              !(c2 >= 1 && c2 < size-1 && board[r][c2-1] === board[r][c] && board[r][c2+1] === board[r][c])) {
            // Swap to fix adjacency
            const temp = board[r][c];
            board[r][c] = board[r][c2];
            board[r][c2] = temp;
            swapped = true;
          }
        }
        
        if (!swapped) {
          // If no swap worked, try again with the whole generation
          return false;
        }
      }
    }
  }
  
  return true;
};

// Shuffle a row while maintaining balance and avoiding adjacency
const shuffleRowWithConstraints = (row, size) => {
  // We need to maintain equal numbers of Sun and Moon
  const targetCount = size / 2;
  
  // Count current suns and moons
  let suns = row.filter(cell => cell === SUN).length;
  let moons = row.filter(cell => cell === MOON).length;
  
  // First ensure we have the right balance
  if (suns !== targetCount || moons !== targetCount) {
    // Reset the row to alternating pattern
    for (let i = 0; i < size; i++) {
      row[i] = i % 2 === 0 ? SUN : MOON;
    }
  }
  
  // Now shuffle while respecting adjacency
  for (let attempts = 0; attempts < size * 3; attempts++) {
    const idx1 = Math.floor(Math.random() * size);
    const idx2 = Math.floor(Math.random() * size);
    
    if (idx1 !== idx2 && row[idx1] !== row[idx2]) {
      // Try swapping these positions
      const temp = row[idx1];
      row[idx1] = row[idx2];
      row[idx2] = temp;
      
      // Check if this creates adjacency issues
      let hasAdjacency = false;
      for (let i = 0; i < size; i++) {
        if ((i >= 2 && row[i] === row[i-1] && row[i-1] === row[i-2]) ||
            (i >= 1 && i < size-1 && row[i-1] === row[i] && row[i] === row[i+1])) {
          hasAdjacency = true;
          break;
        }
      }
      
      if (hasAdjacency) {
        // Swap back
        const temp = row[idx1];
        row[idx1] = row[idx2];
        row[idx2] = temp;
      }
    }
  }
};

// Verify the solution meets all game rules
const verifySolution = (board, size) => {
  // Check rows for balance
  for (let r = 0; r < size; r++) {
    const suns = board[r].filter(cell => cell === SUN).length;
    const moons = board[r].filter(cell => cell === MOON).length;
    
    if (suns !== moons || suns !== size / 2) {
      return false;
    }
  }
  
  // Check columns for balance
  for (let c = 0; c < size; c++) {
    const column = board.map(row => row[c]);
    const suns = column.filter(cell => cell === SUN).length;
    const moons = column.filter(cell => cell === MOON).length;
    
    if (suns !== moons || suns !== size / 2) {
      return false;
    }
  }
  
  // Check for adjacency violations
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (hasAdjacentViolation(board, r, c, size)) {
        return false;
      }
    }
  }
  
  // Check for duplicate rows
  for (let r1 = 0; r1 < size; r1++) {
    for (let r2 = r1 + 1; r2 < size; r2++) {
      if (rowsAreEqual(board[r1], board[r2])) {
        return false;
      }
    }
  }
  
  // Check for duplicate columns
  for (let c1 = 0; c1 < size; c1++) {
    for (let c2 = c1 + 1; c2 < size; c2++) {
      const col1 = board.map(row => row[c1]);
      const col2 = board.map(row => row[c2]);
      
      if (rowsAreEqual(col1, col2)) {
        return false;
      }
    }
  }
  
  return true;
};

// Select cells to keep as prefilled
const selectCellsToKeep = (board, cellsToKeep, boardSize) => {
  const prefilled = [];
  const totalCells = boardSize * boardSize;
  const cellsToEmpty = totalCells - cellsToKeep;
  
  // Collect all positions
  const positions = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      positions.push({ row: r, col: c });
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Empty the selected positions
  for (let i = 0; i < cellsToEmpty; i++) {
    if (i < positions.length) {
      const { row, col } = positions[i];
      board[row][col] = EMPTY;
    }
  }
  
  // Record remaining filled positions
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== EMPTY) {
        prefilled.push({ row: r, col: c });
      }
    }
  }
  
  return prefilled;
};

// Generate constraints based on solution
const generateConstraintsFromSolution = (solution, board, boardSize) => {
  const constraints = [];
  const maxConstraints = Math.floor(boardSize * boardSize * 0.2);
  
  // Collect possible constraint positions (adjacent cells with at least one empty)
  const potentialConstraints = [];
  
  // Horizontal constraints
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize - 1; c++) {
      if (board[r][c] === EMPTY || board[r][c+1] === EMPTY) {
        potentialConstraints.push({
          row1: r, col1: c,
          row2: r, col2: c+1,
          type: solution[r][c] === solution[r][c+1] ? 
            CONSTRAINT_TYPES.SAME : CONSTRAINT_TYPES.DIFFERENT
        });
      }
    }
  }
  
  // Vertical constraints
  for (let r = 0; r < boardSize - 1; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === EMPTY || board[r+1][c] === EMPTY) {
        potentialConstraints.push({
          row1: r, col1: c,
          row2: r+1, col2: c,
          type: solution[r][c] === solution[r+1][c] ? 
            CONSTRAINT_TYPES.SAME : CONSTRAINT_TYPES.DIFFERENT
        });
      }
    }
  }
  
  // Shuffle potential constraints
  for (let i = potentialConstraints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [potentialConstraints[i], potentialConstraints[j]] = 
      [potentialConstraints[j], potentialConstraints[i]];
  }
  
  // Select constraints, checking for conflicts as we go
  for (const potential of potentialConstraints) {
    if (constraints.length >= maxConstraints) break;
    
    // Add this constraint
    constraints.push(potential);
    
    // Check if adding this constraint creates a conflict or makes puzzle unsolvable
    const currentBoard = JSON.parse(JSON.stringify(board));
    if (!isValidConstraintAddition(currentBoard, constraints, solution, boardSize)) {
      // Remove it if it causes issues
      constraints.pop();
    }
  }
  
  return constraints;
};

// Check if a constraint addition is valid and doesn't create conflicts
const isValidConstraintAddition = (board, constraints, solution, boardSize) => {
  // Try to make deductions based on constraints
  let progress = true;
  let iterations = 0;
  const maxIterations = boardSize * boardSize;
  
  while (progress && iterations < maxIterations) {
    progress = false;
    iterations++;
    
    // Apply constraints to make deductions
    for (const constraint of constraints) {
      const { row1, col1, row2, col2, type } = constraint;
      
      // If one cell is filled and one is empty, we can deduce the empty one
      if (board[row1][col1] !== EMPTY && board[row2][col2] === EMPTY) {
        const targetValue = type === CONSTRAINT_TYPES.SAME ? 
          board[row1][col1] : (board[row1][col1] === SUN ? MOON : SUN);
          
        board[row2][col2] = targetValue;
        progress = true;
        
        // Check if this deduction matches the solution
        if (board[row2][col2] !== solution[row2][col2]) {
          return false; // Constraint leads to wrong deduction
        }
      }
      else if (board[row2][col2] !== EMPTY && board[row1][col1] === EMPTY) {
        const targetValue = type === CONSTRAINT_TYPES.SAME ? 
          board[row2][col2] : (board[row2][col2] === SUN ? MOON : SUN);
          
        board[row1][col1] = targetValue;
        progress = true;
        
        // Check if this deduction matches the solution
        if (board[row1][col1] !== solution[row1][col1]) {
          return false; // Constraint leads to wrong deduction
        }
      }
    }
    
    // Check for adjacency violations
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (board[r][c] !== EMPTY && hasAdjacentViolation(board, r, c, boardSize)) {
          return false; // Adjacency violation
        }
      }
    }
  }
  
  return true;
};

// Verify that the puzzle is solvable
const verifySolvability = (board, constraints, solution, boardSize) => {
  // Deep copy the board to work with
  const workingBoard = JSON.parse(JSON.stringify(board));
  
  // Try to solve the puzzle using constraints
  let progress = true;
  let iterations = 0;
  const maxIterations = boardSize * boardSize * 2; // Allow more iterations for complex boards
  
  // Keep making deductions until we can't anymore
  while (progress && iterations < maxIterations) {
    progress = false;
    iterations++;
    
    // Apply constraints to fill in cells
    for (const constraint of constraints) {
      const { row1, col1, row2, col2, type } = constraint;
      
      // If one cell is filled and one is empty, deduce the other
      if (workingBoard[row1][col1] !== EMPTY && workingBoard[row2][col2] === EMPTY) {
        const targetValue = type === CONSTRAINT_TYPES.SAME ? 
          workingBoard[row1][col1] : (workingBoard[row1][col1] === SUN ? MOON : SUN);
          
        workingBoard[row2][col2] = targetValue;
        progress = true;
      }
      else if (workingBoard[row2][col2] !== EMPTY && workingBoard[row1][col1] === EMPTY) {
        const targetValue = type === CONSTRAINT_TYPES.SAME ? 
          workingBoard[row2][col2] : (workingBoard[row2][col2] === SUN ? MOON : SUN);
          
        workingBoard[row1][col1] = targetValue;
        progress = true;
      }
    }
    
    // Apply row and column balance rules
    for (let r = 0; r < boardSize; r++) {
      const rowCells = workingBoard[r];
      const emptyCells = [];
      let suns = 0;
      let moons = 0;
      
      for (let c = 0; c < boardSize; c++) {
        if (rowCells[c] === EMPTY) {
          emptyCells.push(c);
        } else if (rowCells[c] === SUN) {
          suns++;
        } else if (rowCells[c] === MOON) {
          moons++;
        }
      }
      
      // If we can deduce the remaining cells in this row
      if (emptyCells.length > 0 && 
          (suns === boardSize / 2 || moons === boardSize / 2)) {
        const targetValue = suns === boardSize / 2 ? MOON : SUN;
        
        for (const col of emptyCells) {
          workingBoard[r][col] = targetValue;
          progress = true;
        }
      }
    }
    
    // Same for columns
    for (let c = 0; c < boardSize; c++) {
      const emptyCells = [];
      let suns = 0;
      let moons = 0;
      
      for (let r = 0; r < boardSize; r++) {
        if (workingBoard[r][c] === EMPTY) {
          emptyCells.push(r);
        } else if (workingBoard[r][c] === SUN) {
          suns++;
        } else if (workingBoard[r][c] === MOON) {
          moons++;
        }
      }
      
      // If we can deduce the remaining cells in this column
      if (emptyCells.length > 0 && 
          (suns === boardSize / 2 || moons === boardSize / 2)) {
        const targetValue = suns === boardSize / 2 ? MOON : SUN;
        
        for (const row of emptyCells) {
          workingBoard[row][c] = targetValue;
          progress = true;
        }
      }
    }
    
    // Check for adjacency rule applications
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (workingBoard[r][c] === EMPTY) {
          // Check if this cell must be a particular value to avoid 3-in-a-row
          
          // Check horizontal adjacency (left)
          if (c >= 2 && 
              workingBoard[r][c-1] !== EMPTY && 
              workingBoard[r][c-2] !== EMPTY &&
              workingBoard[r][c-1] === workingBoard[r][c-2]) {
            // Must be the opposite to avoid 3-in-a-row
            workingBoard[r][c] = workingBoard[r][c-1] === SUN ? MOON : SUN;
            progress = true;
          }
          
          // Check horizontal adjacency (right)
          else if (c <= boardSize - 3 && 
                  workingBoard[r][c+1] !== EMPTY && 
                  workingBoard[r][c+2] !== EMPTY &&
                  workingBoard[r][c+1] === workingBoard[r][c+2]) {
            // Must be the opposite to avoid 3-in-a-row
            workingBoard[r][c] = workingBoard[r][c+1] === SUN ? MOON : SUN;
            progress = true;
          }
          
          // Check horizontal adjacency (middle)
          else if (c >= 1 && c <= boardSize - 2 && 
                  workingBoard[r][c-1] !== EMPTY && 
                  workingBoard[r][c+1] !== EMPTY &&
                  workingBoard[r][c-1] === workingBoard[r][c+1]) {
            // Must be the opposite to avoid 3-in-a-row
            workingBoard[r][c] = workingBoard[r][c-1] === SUN ? MOON : SUN;
            progress = true;
          }
          
          // Check vertical adjacency (up)
          else if (r >= 2 && 
                  workingBoard[r-1][c] !== EMPTY && 
                  workingBoard[r-2][c] !== EMPTY &&
                  workingBoard[r-1][c] === workingBoard[r-2][c]) {
            // Must be the opposite to avoid 3-in-a-row
            workingBoard[r][c] = workingBoard[r-1][c] === SUN ? MOON : SUN;
            progress = true;
          }
          
          // Check vertical adjacency (down)
          else if (r <= boardSize - 3 && 
                  workingBoard[r+1][c] !== EMPTY && 
                  workingBoard[r+2][c] !== EMPTY &&
                  workingBoard[r+1][c] === workingBoard[r+2][c]) {
            // Must be the opposite to avoid 3-in-a-row
            workingBoard[r][c] = workingBoard[r+1][c] === SUN ? MOON : SUN;
            progress = true;
          }
          
          // Check vertical adjacency (middle)
          else if (r >= 1 && r <= boardSize - 2 && 
                  workingBoard[r-1][c] !== EMPTY && 
                  workingBoard[r+1][c] !== EMPTY &&
                  workingBoard[r-1][c] === workingBoard[r+1][c]) {
            // Must be the opposite to avoid 3-in-a-row
            workingBoard[r][c] = workingBoard[r-1][c] === SUN ? MOON : SUN;
            progress = true;
          }
        }
      }
    }
  }
  
  // Check if any deduced values contradict the solution
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (workingBoard[r][c] !== EMPTY && 
          workingBoard[r][c] !== solution[r][c]) {
        return false; // Contradiction with solution
      }
    }
  }
  
  // Check if the partially filled board has any rule violations
  const { errors } = validateBoard(workingBoard, boardSize, constraints);
  if (errors.length > 0) {
    // There are violations in the deduced board
    return false;
  }
  
  return true;
};

// Generate a fallback puzzle for cases where normal generation fails
const generateFallbackPuzzle = (boardSize, difficulty) => {
  console.log("Using fallback puzzle generation");
  
  // Create a simple pattern that works for all even sizes
  const solution = Array(boardSize).fill().map(() => Array(boardSize).fill(EMPTY));
  
  // Fill with a checkerboard pattern to start
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      solution[r][c] = (r + c) % 2 === 0 ? SUN : MOON;
    }
  }
  
  // For sizes larger than 2, make sure rows and columns are unique
  if (boardSize > 2) {
    // Modify some cells to create unique patterns
    for (let r = 0; r < boardSize; r += 2) {
      if (r + 1 < boardSize) {
        // Swap two cells in every other row to create variety
        const col1 = r % 4;
        const col2 = (r + 2) % boardSize;
        
        const temp = solution[r][col1];
        solution[r][col1] = solution[r][col2];
        solution[r][col2] = temp;
      }
    }
  }
  
  // Verify solution validity
  const { errors } = validateBoard(solution, boardSize, []);
  if (errors.length > 0) {
    console.error("Fallback solution has errors:", errors);
    // Try an even simpler approach for small boards
    return generateSimplePuzzle(boardSize, difficulty);
  }
  
  // Create a copy for the board
  const board = JSON.parse(JSON.stringify(solution));
  
  // Remove cells based on difficulty
  const cellsToKeep = Math.floor(
    boardSize * boardSize * DIFFICULTY[difficulty].filledCellPercentage * 0.8 // Reduce for fallback
  );
  
  // Select cells to keep
  const prefilled = selectCellsToKeep(board, cellsToKeep, boardSize);
  
  // Add minimal constraints
  const constraints = [];
  
  // Add a few basic constraints (less than normal)
  const maxConstraints = Math.floor(boardSize);
  
  for (let i = 0; i < maxConstraints; i++) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * (boardSize - 1));
    
    if (board[row][col] === EMPTY || board[row][col+1] === EMPTY) {
      constraints.push({
        row1: row, col1: col,
        row2: row, col2: col+1,
        type: solution[row][col] === solution[row][col+1] ? 
          CONSTRAINT_TYPES.SAME : CONSTRAINT_TYPES.DIFFERENT
      });
    }
  }
  
  return {
    board,
    prefilled,
    constraints
  };
};

// Super simple puzzle generation for small boards
const generateSimplePuzzle = (boardSize, difficulty) => {
  console.log("Using super simple puzzle generation");

  let solution;

  // Use predefined patterns for small boards
  if (boardSize === 2) {
    solution = [
      [SUN, MOON],
      [MOON, SUN],
    ];
  } else if (boardSize === 4) {
    solution = [
      [SUN, MOON, SUN, MOON],
      [MOON, SUN, MOON, SUN],
      [SUN, MOON, MOON, SUN],
      [MOON, SUN, SUN, MOON],
    ];
  } else if (boardSize === 6) {
    solution = [
      [SUN, MOON, SUN, MOON, SUN, MOON],
      [MOON, SUN, MOON, SUN, MOON, SUN],
      [SUN, MOON, SUN, MOON, SUN, MOON],
      [MOON, SUN, MOON, SUN, MOON, SUN],
      [SUN, MOON, SUN, MOON, MOON, SUN],
      [MOON, SUN, MOON, SUN, SUN, MOON],
    ];
  } else {
    // For larger boards, use an alternating pattern
    solution = Array(boardSize)
      .fill()
      .map(() => Array(boardSize).fill(EMPTY));
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        solution[r][c] = (r + c) % 2 === 0 ? SUN : MOON;
      }
    }

    // Swap some values in the last rows to make patterns unique
    if (boardSize >= 8) {
      solution[boardSize - 1][0] =
        solution[boardSize - 1][0] === SUN ? MOON : SUN;
      solution[boardSize - 1][1] =
        solution[boardSize - 1][1] === SUN ? MOON : SUN;
      solution[boardSize - 2][0] =
        solution[boardSize - 2][0] === SUN ? MOON : SUN;
    }
  }

  // Create a copy for the puzzle board
  const board = JSON.parse(JSON.stringify(solution));

  // Keep about half the cells filled
  const cellsToKeep = Math.floor(boardSize * boardSize * 0.4);

  // Select cells to empty
  const emptyPositions = [];
  for (let i = 0; i < boardSize * boardSize - cellsToKeep; i++) {
    let row, col;
    let validPosition = false;

    // Try to find positions that don't make the puzzle too easy
    while (!validPosition) {
      row = Math.floor(Math.random() * boardSize);
      col = Math.floor(Math.random() * boardSize);

      // Avoid emptying cells we've already emptied
      if (board[row][col] !== EMPTY) {
        validPosition = true;
      }
    }

    board[row][col] = EMPTY;
    emptyPositions.push({ row, col });
  }

  // Record prefilled cells
  const prefilled = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== EMPTY) {
        prefilled.push({ row: r, col: c });
      }
    }
  }

  // Add minimal constraints
  const constraints = [];
  const constraintCount = Math.floor(boardSize);

  // Add a few constraints that match the solution
  for (let i = 0; i < constraintCount; i++) {
    // Alternate between horizontal and vertical constraints
    const isHorizontal = i % 2 === 0;

    if (isHorizontal) {
      // Add horizontal constraint
      for (let attempts = 0; attempts < boardSize * 2; attempts++) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * (boardSize - 1));

        // Only add if at least one cell is empty
        if (board[row][col] === EMPTY || board[row][col + 1] === EMPTY) {
          const type =
            solution[row][col] === solution[row][col + 1]
              ? CONSTRAINT_TYPES.SAME
              : CONSTRAINT_TYPES.DIFFERENT;

          // Check that we don't already have a constraint here
          const exists = constraints.some(
            (c) =>
              (c.row1 === row &&
                c.col1 === col &&
                c.row2 === row &&
                c.col2 === col + 1) ||
              (c.row1 === row &&
                c.col1 === col + 1 &&
                c.row2 === row &&
                c.col2 === col)
          );

          if (!exists) {
            constraints.push({
              row1: row,
              col1: col,
              row2: row,
              col2: col + 1,
              type,
            });
            break;
          }
        }
      }
    } else {
      // Add vertical constraint
      for (let attempts = 0; attempts < boardSize * 2; attempts++) {
        const row = Math.floor(Math.random() * (boardSize - 1));
        const col = Math.floor(Math.random() * boardSize);

        // Only add if at least one cell is empty
        if (board[row][col] === EMPTY || board[row + 1][col] === EMPTY) {
          const type =
            solution[row][col] === solution[row + 1][col]
              ? CONSTRAINT_TYPES.SAME
              : CONSTRAINT_TYPES.DIFFERENT;

          // Check that we don't already have a constraint here
          const exists = constraints.some(
            (c) =>
              (c.row1 === row &&
                c.col1 === col &&
                c.row2 === row + 1 &&
                c.col2 === col) ||
              (c.row1 === row + 1 &&
                c.col1 === col &&
                c.row2 === row &&
                c.col2 === col)
          );

          if (!exists) {
            constraints.push({
              row1: row,
              col1: col,
              row2: row + 1,
              col2: col,
              type,
            });
            break;
          }
        }
      }
    }
  }

  return {
    board,
    prefilled,
    constraints,
  };
};

// Helper to check if two rows are equal
const rowsAreEqual = (row1, row2) => {
  return row1.every((cell, i) => cell === row2[i]);
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

  // Check for adjacent violations (more than 2 in a row) - always check this regardless of fill state
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

  // Check constraints (= and X) - only for filled cells
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