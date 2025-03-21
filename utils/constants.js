// utils/constants.js
export const EMPTY = 0;
export const SUN = 1;
export const MOON = 2;

export const DIFFICULTY = {
  EASY: {
    label: "Easy",
    filledCellPercentage: 0.3,
  },
  MEDIUM: {
    label: "Medium",
    filledCellPercentage: 0.2,
  },
  HARD: {
    label: "Hard",
    filledCellPercentage: 0.1,
  },
};

export const BOARD_SIZES = [
  { value: 4, label: "4x4" },
  { value: 6, label: "6x6" },
  { value: 8, label: "8x8" },
];

export const CONSTRAINT_TYPES = {
  SAME: "same",
  DIFFERENT: "different",
};

export const ERROR_TYPES = {
  ROW_BALANCE: "row-balance",
  COL_BALANCE: "col-balance",
  ROW_DUPLICATE: "row-duplicate",
  COL_DUPLICATE: "col-duplicate",
  ADJACENT: "adjacent",
  CONSTRAINT_SAME: "constraint-same",
  CONSTRAINT_DIFFERENT: "constraint-different",
};