package main

import (
	"fmt"
	"os"
)

var gridSize = 9

func main() {
	if len(os.Args) != 10 {
		fmt.Println("Error: You must provide exactly 9 rows as arguments.")
		os.Exit(1)
	}

	var sudokuBoard [9][9]rune

	for i := range gridSize {
		inputSelected := os.Args[i+1]
		if len(inputSelected) != gridSize {
			fmt.Printf("Error: Row %d must have exactly 9 characters.\n", i+1)
			os.Exit(1)
		}

		for j := range gridSize {
			char := rune(inputSelected[j])
			isValidInput := char == '.' || (char >= '1' && char <= '9')
			if !isValidInput {
				fmt.Printf("Error: Invalid character '%c' detected in row %d, column %d. Only digits 1-9 and '.' are allowed.\n", char, i+1, j+1)
				os.Exit(1)
			}
			sudokuBoard[i][j] = char
		}
	}

	if !isBoardInitiallyValid(sudokuBoard) {
		fmt.Println("Error: Initial board configuration is invalid (violates Sudoku rules).")
		os.Exit(1)
	}

	boardCopy := sudokuBoard
	if solveSudoku(&boardCopy) {
		printBoard(boardCopy)
	} else {
		fmt.Println("Error: No solution found for the given Sudoku puzzle.")
		os.Exit(1)
	}
}

func isBoardInitiallyValid(board [9][9]rune) bool {
	for r := range gridSize {
		for c := range gridSize {
			if board[r][c] != '.' {
				num := board[r][c]
				board[r][c] = '.'
				if !isValidCell(r, c, num, board) {
					board[r][c] = num
					return false
				}
				board[r][c] = num
			}
		}
	}
	return true
}

func solveSudoku(board *[9][9]rune) bool {
	for i := range gridSize {
		for j := range gridSize {
			if board[i][j] == '.' {
				for num := '1'; num <= '9'; num++ {
					if isValidCell(i, j, num, *board) {
						board[i][j] = num
						if solveSudoku(board) {
							return true
						}
						board[i][j] = '.'
					}
				}
				return false
			}
		}
	}
	return true
}

func isValidCell(row int, col int, num rune, board [9][9]rune) bool {
	// Check row
	for c := range gridSize {
		if board[row][c] == num {
			return false
		}
	}

	// Check column
	for r := range gridSize {
		if board[r][col] == num {
			return false
		}
	}

	// Check 3x3 subgrid
	startRow := (row / 3) * 3
	startCol := (col / 3) * 3
	for r := startRow; r < startRow+3; r++ {
		for c := startCol; c < startCol+3; c++ {
			if board[r][c] == num {
				return false
			}
		}
	}

	return true
}

func printBoard(board [9][9]rune) {
	for i := range gridSize {
		for j := range gridSize {
			fmt.Printf("%c", board[i][j])
			if j < gridSize-1 {
				fmt.Print(" ")
			}
		}
		fmt.Println()
	}
}
