
// src/app/page.tsx

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { AlertCircle, CheckCircle, ExternalLink, Loader2, Trash2, X } from "lucide-react"; // Using lucide-react icons

const GRID_SIZE = 9;

// Types for tracking cell errors
type CellPosition = {
  row: number;
  col: number;
};

type ValidationError = {
  type: 'row' | 'column' | 'box';
  value: string;
  positions: CellPosition[];
};
// Helper functions to validate Sudoku rules

// Check if a Sudoku board violates any rules
const validateSudokuRules = (board: string[][]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check rows
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowErrors = findDuplicatesInRow(board, row);
    errors.push(...rowErrors);
  }
  
  // Check columns
  for (let col = 0; col < GRID_SIZE; col++) {
    const colErrors = findDuplicatesInColumn(board, col);
    errors.push(...colErrors);
  }
  
  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxErrors = findDuplicatesInBox(board, boxRow, boxCol);
      errors.push(...boxErrors);
    }
  }
  
  return errors;
};

// Find duplicates in a row
const findDuplicatesInRow = (board: string[][], row: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seen: Record<string, CellPosition[]> = {};
  
  for (let col = 0; col < GRID_SIZE; col++) {
    const value = board[row][col];
    if (value !== '.') {
      if (!seen[value]) {
        seen[value] = [];
      }
      seen[value].push({ row, col });
    }
  }
  
  // Check for duplicates
  for (const [value, positions] of Object.entries(seen)) {
    if (positions.length > 1) {
      errors.push({
        type: 'row',
        value,
        positions
      });
    }
  }
  
  return errors;
};

// Find duplicates in a column
const findDuplicatesInColumn = (board: string[][], col: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seen: Record<string, CellPosition[]> = {};
  
  for (let row = 0; row < GRID_SIZE; row++) {
    const value = board[row][col];
    if (value !== '.') {
      if (!seen[value]) {
        seen[value] = [];
      }
      seen[value].push({ row, col });
    }
  }
  
  // Check for duplicates
  for (const [value, positions] of Object.entries(seen)) {
    if (positions.length > 1) {
      errors.push({
        type: 'column',
        value,
        positions
      });
    }
  }
  
  return errors;
};

// Find duplicates in a 3x3 box
const findDuplicatesInBox = (board: string[][], boxRow: number, boxCol: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seen: Record<string, CellPosition[]> = {};
  
  const startRow = boxRow * 3;
  const startCol = boxCol * 3;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const row = startRow + r;
      const col = startCol + c;
      const value = board[row][col];
      
      if (value !== '.') {
        if (!seen[value]) {
          seen[value] = [];
        }
        seen[value].push({ row, col });
      }
    }
  }
  
  // Check for duplicates
  for (const [value, positions] of Object.entries(seen)) {
    if (positions.length > 1) {
      errors.push({
        type: 'box',
        value,
        positions
      });
    }
  }
  
  return errors;
};

// Helper function to get error description
const getErrorDescription = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  const descriptions = errors.map(error => {
    const locationDesc = error.type === 'row' 
      ? `row ${error.positions[0].row + 1}` 
      : error.type === 'column' 
        ? `column ${error.positions[0].col + 1}` 
        : `box at ${Math.floor(error.positions[0].row / 3) + 1},${Math.floor(error.positions[0].col / 3) + 1}`;
    
    return `Duplicate ${error.value} in ${locationDesc}`;
  });
  
  return descriptions.join('; ');
};

// Helper function to get cell classes based on state
const getCellClasses = (isInput: boolean, isInitial: boolean, isError: boolean) => {
  let base = "w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-medium transition-colors duration-150 ";
  let border = "border border-gray-300";
  let interaction = "";
  let text = "";
  let background = "";

  if (isInput) {
    interaction = "hover:bg-blue-50 focus:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10 ";
    text = "text-blue-700 ";
    background = "bg-white ";
  } else {
    // Solved board cells
    interaction = "cursor-default ";
    text = isInitial ? "text-gray-900 font-semibold " : "text-gray-700 "; // Make initial numbers slightly bolder
    background = "bg-gray-50 ";
  }

  if (isError) {
    background = "bg-red-50 ";
    text = "text-red-700 ";
    border = "border border-red-300 ring-1 ring-red-500 ";
  }

  return base + border + interaction + text + background;
};

// Utility function to check if a Sudoku board string is valid
function validateBoardString(boardStr: string): { isValid: boolean; conflicts: string[] } {
  // Parse board string to 2D array
  const rows = boardStr.trim().split('\n').map(row => row.trim());
  // Create 2D array from the string representation
  const board = rows.map(row => Array.from(row));
  
  // Helper function to find duplicates in an array
  const findDuplicates = (arr: string[]): string[] => {
    const seen: Record<string, number> = {};
    const duplicates: string[] = [];
    
    for (const item of arr) {
      if (item !== '.' && item !== ' ') {
        if (seen[item]) {
          duplicates.push(item);
        } else {
          seen[item] = 1;
        }
      }
    }
    
    return duplicates;
  };
  
  const conflicts: string[] = [];
  
  // Check rows
  rows.forEach((row, rowIndex) => {
    const duplicates = findDuplicates(Array.from(row));
    if (duplicates.length > 0) {
      conflicts.push(`Row ${rowIndex + 1} has duplicate values: ${duplicates.join(', ')}`);
    }
  });
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const column = rows.map(row => row[col]);
    const duplicates = findDuplicates(column);
    if (duplicates.length > 0) {
      conflicts.push(`Column ${col + 1} has duplicate values: ${duplicates.join(', ')}`);
    }
  }
  
  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          box.push(rows[row][col]);
        }
      }
      const duplicates = findDuplicates(box);
      if (duplicates.length > 0) {
        conflicts.push(`Box at position ${boxRow + 1},${boxCol + 1} has duplicate values: ${duplicates.join(', ')}`);
      }
    }
  }
  
  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

export default function Home() {
  const [initialBoard, setInitialBoard] = useState<string[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("."))
  );
  const [board, setBoard] = useState<string[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("."))
  );
  const [solvedBoard, setSolvedBoard] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );

  // Focus first empty cell on load
  useEffect(() => {
    focusNextEmptyCell(0, -1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const focusNextEmptyCell = (startRow: number, startCol: number) => {
    let currentCol = startCol + 1;
    for (let r = startRow; r < GRID_SIZE; r++) {
      for (let c = currentCol; c < GRID_SIZE; c++) {
        if (board[r][c] === ".") {
          inputRefs.current[r]?.[c]?.focus();
          inputRefs.current[r]?.[c]?.select();
          return;
        }
      }
      currentCol = 0; // Reset column index for the next row
    }
    // If no empty cell found after the starting point, wrap around
    for (let r = 0; r <= startRow; r++) {
        for (let c = 0; c < (r === startRow ? startCol + 1 : GRID_SIZE); c++) {
            if (board[r][c] === ".") {
                inputRefs.current[r]?.[c]?.focus();
                inputRefs.current[r]?.[c]?.select();
                return;
            }
        }
    }
  };
  const handleInputChange = (row: number, col: number, value: string) => {
    const sanitizedValue = value.match(/^[1-9]$/) ? value : ".";
    const newBoard = board.map((r, rowIndex) =>
      r.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return sanitizedValue;
        }
        return cell;
      })
    );
    
    // Validate the board after each input
    const errors = validateSudokuRules(newBoard);
    setValidationErrors(errors);
    
    setBoard(newBoard);
    // Also update initial board state when user inputs
    setInitialBoard(newBoard);
    setSolvedBoard(null);
    
    // Clear error message if the board is valid or show validation error
    if (errors.length > 0) {
      setError(getErrorDescription(errors));
    } else {
      setError(null);
    }
    
    setSuccessMessage(null);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    let nextRow = row;
    let nextCol = col;
    let shouldFocus = true;

    switch (e.key) {
      case "ArrowUp":
        nextRow = row > 0 ? row - 1 : GRID_SIZE - 1;
        e.preventDefault();
        break;
      case "ArrowDown":
        nextRow = row < GRID_SIZE - 1 ? row + 1 : 0;
        e.preventDefault();
        break;
      case "ArrowLeft":
        nextCol = col > 0 ? col - 1 : GRID_SIZE - 1;
        if (col === 0) nextRow = row > 0 ? row - 1 : GRID_SIZE - 1;
        e.preventDefault();
        break;
      case "ArrowRight":
        nextCol = col < GRID_SIZE - 1 ? col + 1 : 0;
        if (col === GRID_SIZE - 1) nextRow = row < GRID_SIZE - 1 ? row + 1 : 0;
        e.preventDefault();
        break;
      case "Backspace":
      case "Delete":
        e.preventDefault();
        if (board[row][col] !== ".") {
          handleInputChange(row, col, ""); // Clear current cell
          // Keep focus on the current cell
          nextRow = row;
          nextCol = col;
        } else {
          // If already empty, move left
          nextCol = col > 0 ? col - 1 : GRID_SIZE - 1;
          if (col === 0) nextRow = row > 0 ? row - 1 : GRID_SIZE - 1;
        }
        break;
      case "Enter": // Solve on Enter key
        e.preventDefault();
        handleSolve();
        shouldFocus = false;
        break;
      default:
        // If typing a number, move right after input
        if (/^[1-9]$/.test(e.key)) {
          // Allow the input change to happen via onChange
          // Schedule focus change slightly after input processing
          setTimeout(() => {
            focusNextEmptyCell(row, col);
          }, 0);
          shouldFocus = false; // Focus handled by timeout
        } else if (!/^[a-zA-Z]$/.test(e.key)) {
          // Allow navigation keys, backspace, delete, enter, but prevent other characters
          e.preventDefault();
          shouldFocus = false;
        }
        // Allow other keys (like Tab) to function normally
        return;
    }

    if (shouldFocus) {
      inputRefs.current[nextRow]?.[nextCol]?.focus();
      inputRefs.current[nextRow]?.[nextCol]?.select();
    }
  };
  const handleClear = () => {
    const emptyBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("."));
    setBoard(emptyBoard);
    setInitialBoard(emptyBoard);
    setSolvedBoard(null);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors([]);
    inputRefs.current[0]?.[0]?.focus();
  };
  const handleSolve = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSolvedBoard(null);

    // Store the board state at the time of solving
    const boardToSolve = board.map(row => [...row]);
    setInitialBoard(boardToSolve); // Keep track of the initial puzzle state
    
    // Validate the board before sending to the solver
    const errors = validateSudokuRules(boardToSolve);
    if (errors.length > 0) {
      setIsLoading(false);
      setError(getErrorDescription(errors));
      return;
    }

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ board: boardToSolve }), // Send the board state at time of click
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to solve the puzzle (Status: ${response.status})`
        );
      }

      setSolvedBoard(data.solvedBoard);
      setSuccessMessage("Puzzle solved successfully!");

    } catch (err) {
      console.error("Error solving sudoku:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setSolvedBoard(null); // Ensure solved board is cleared on error
    } finally {
      setIsLoading(false);
    }
  };

  const renderBoard = (
    boardData: string[][],
    isInput: boolean,
    initialData?: string[][]
  ) => {
    return (
      <div className="grid grid-cols-9 gap-0 border-2 border-gray-400 rounded-md overflow-hidden shadow-md w-fit mx-auto aspect-square">
        {boardData.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isThickRight =
              (colIndex + 1) % 3 === 0 && colIndex < GRID_SIZE - 1;
            const isThickBottom =
              (rowIndex + 1) % 3 === 0 && rowIndex < GRID_SIZE - 1;
            const borderClasses = `
              ${isThickRight ? "border-r-2 border-r-gray-400" : ""}
              ${isThickBottom ? "border-b-2 border-b-gray-400" : ""}
            `;
            const isInitialNumber = !isInput && initialData?.[rowIndex]?.[colIndex] !== ".";

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                ref={(el) => {
                  if (inputRefs.current[rowIndex])
                    inputRefs.current[rowIndex][colIndex] = el;
                }}
                type="text" // Use text for better control over input
                inputMode="numeric"
                pattern="[1-9]"
                maxLength={1}
                value={cell === "." ? "" : cell}
                onChange={(e) =>
                  isInput && handleInputChange(rowIndex, colIndex, e.target.value)
                }
                onKeyDown={(e) =>
                  isInput && handleKeyDown(e, rowIndex, colIndex)
                }
                readOnly={!isInput}
                className={`relative ${getCellClasses(isInput, !!isInitialNumber, validationErrors.some(error => 
                  error.positions.some(pos => pos.row === rowIndex && pos.col === colIndex)
                ))} ${borderClasses}`}
                aria-label={`Cell R${rowIndex + 1}C${colIndex + 1}`}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-100 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md sm:max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold mb-5 sm:mb-6 text-center text-gray-800">
          Sudoku Solver
        </h1>

        <p className="mb-5 text-center text-gray-600 text-sm sm:text-base">
          Enter a puzzle (1-9), leave cells blank, and click Solve.
        </p>

        {/* Input Board */} 
        {renderBoard(board, true)}

        {/* Action Buttons */} 
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            onClick={handleSolve}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : null}
            {isLoading ? "Solving..." : "Solve Puzzle"}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Board
          </button>
        </div>

        {/* Error Message */} 
        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">Error: {error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Message */} 
        {successMessage && !error && (
             <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                 <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-500 hover:text-green-700">
                    <X className="h-4 w-4" />
                </button>
            </div>
        )}

        {/* Solved Board */} 
        {solvedBoard && (
          <div className="mt-8 sm:mt-10 border-t pt-6 border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800">
              Solved Puzzle:
            </h2>
            {renderBoard(solvedBoard, false, initialBoard)}

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <a
                href={"https://sudoku.com/"} // Static link for now
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 shadow-sm hover:shadow-md"
              >
                Verify on sudoku.com
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>

            <p className="mt-4 text-center text-xs sm:text-sm text-gray-600">
              Manually enter the original puzzle and the solved numbers on sudoku.com to verify.
            </p>
          </div>
        )}

        {/* Footer Note */} 
        <p className="mt-8 text-xs text-gray-500 text-center">
          Powered by a Go-based Sudoku solver.
        </p>
      </div>
    </main>
  );
}
