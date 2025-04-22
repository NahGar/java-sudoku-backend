package org.ngarcia.sudoku.daily.model;

public class SudokuLevel {
    private int[][] board;
    private String date;
    private String difficulty;

    public SudokuLevel(int[][] board, String date, String difficulty) {
        this.board = board;
        this.date = date;
        this.difficulty = difficulty;
    }

    // Getters
    public int[][] getBoard() { return board; }
    public String getDate() { return date; }
    public String getDifficulty() { return difficulty; }
}