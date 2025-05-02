# Sudoku Solver Verifier - Audit Documentation

## 1. Project Overview

This project aims to create a web application that serves as a verification tool for a Sudoku solver program written in Go. The primary goal is to allow a user (specifically for an audit presentation at 01 Talent Academy) to input a Sudoku puzzle, have it solved by the provided Go solver, and then easily verify the correctness of the generated solution against an external source like sudoku.com.

The application consists of a frontend user interface built with Next.js and a backend component that utilizes the user-provided Go Sudoku solver.

## 2. Go Sudoku Solver (`main.go`)

The core logic for solving Sudoku puzzles resides in the `solver.go` program provided by the student. Key aspects of this solver include:

*   **Algorithm**: It employs a standard backtracking algorithm to find a valid solution for a given 9x9 Sudoku grid.
*   **Input**: The program expects the Sudoku puzzle to be provided as 9 separate command-line arguments, where each argument is a string representing a row. Empty cells are represented by the character "." (dot), and filled cells contain digits from "1" to "9".
*   **Validation**: The Go program includes validation to check if the input arguments are correctly formatted (9 rows, 9 characters each, valid characters) and if the initial board configuration adheres to Sudoku rules (no duplicate numbers in rows, columns, or 3x3 subgrids).
*   **Output**: If a solution is found, the program prints the solved 9x9 grid to standard output, with numbers in each row separated by spaces and rows separated by newlines. If no solution is found or the initial board is invalid, it prints an error message to standard output and exits with a non-zero status code.

## Deployment
https://source-code-docker.vercel.app/

