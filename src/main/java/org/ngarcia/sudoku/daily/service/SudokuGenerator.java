package org.ngarcia.sudoku.daily.service;

import org.ngarcia.sudoku.daily.model.Sudoku;
import org.springframework.stereotype.Component;
import java.util.Random;

@Component
public class SudokuGenerator {
    private static final int SIZE = 9;
    private static final int EMPTY = 0;

    // Niveles de dificultad (celdas vacías)
    private static final int EASY_CELLS_TO_REMOVE = 40;   // ~49% vacías
    private static final int MEDIUM_CELLS_TO_REMOVE = 50; // ~62% vacías
    private static final int HARD_CELLS_TO_REMOVE = 60;   // ~74% vacías

    public Sudoku generateDailySudoku() {
        int[][] solution = generateSolution(new int[SIZE][SIZE], 0);

        return new Sudoku(
                generatePuzzle(copyArray(solution), EASY_CELLS_TO_REMOVE),
                generatePuzzle(copyArray(solution), MEDIUM_CELLS_TO_REMOVE),
                generatePuzzle(copyArray(solution), HARD_CELLS_TO_REMOVE),
                solution,
                java.time.LocalDate.now().toString()
        );
    }

    private int[][] generateSolution(int[][] board, int index) {
        if (index == 81) return board;

        int row = index / 9;
        int col = index % 9;

        if (board[row][col] != 0) return generateSolution(board, index + 1);

        Integer[] numbers = {1,2,3,4,5,6,7,8,9};
        shuffleArray(numbers);

        for (int num : numbers) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (generateSolution(board, index + 1) != null) {
                    return board;
                }
                board[row][col] = 0;
            }
        }
        return null;
    }

    private int[][] generatePuzzle(int[][] solution, int cellsToRemove) {
        Random random = new Random();
        int removed = 0;

        while (removed < cellsToRemove) {
            int row = random.nextInt(9);
            int col = random.nextInt(9);

            if (solution[row][col] != 0) {
                solution[row][col] = 0;
                removed++;
            }
        }

        return solution;
    }

    private boolean isValid(int[][] board, int row, int col, int num) {
        // Verificar fila y columna
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == num || board[i][col] == num) {
                return false;
            }
        }

        // Verificar subcuadrícula 3x3
        int boxRow = row - row % 3;
        int boxCol = col - col % 3;
        for (int i = boxRow; i < boxRow + 3; i++) {
            for (int j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] == num) {
                    return false;
                }
            }
        }

        return true;
    }

    private void shuffleArray(Integer[] array) {
        Random random = new Random();
        for (int i = array.length - 1; i > 0; i--) {
            int index = random.nextInt(i + 1);
            int temp = array[index];
            array[index] = array[i];
            array[i] = temp;
        }
    }

    private int[][] copyArray(int[][] original) {
        int[][] copy = new int[original.length][];
        for (int i = 0; i < original.length; i++) {
            copy[i] = original[i].clone();
        }
        return copy;
    }
}
