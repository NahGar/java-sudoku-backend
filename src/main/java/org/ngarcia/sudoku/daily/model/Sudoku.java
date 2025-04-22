package org.ngarcia.sudoku.daily.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Sudoku {
    private int[][] easyBoard;
    private int[][] mediumBoard;
    private int[][] hardBoard;
    private int[][] solution;
    private String date;

    // Constructor sin argumentos (necesario para Jackson)
    public Sudoku() {
    }

    // Constructor completo con anotaciones @JsonProperty
    @JsonCreator
    public Sudoku(@JsonProperty("easyBoard") int[][] easyBoard,
                  @JsonProperty("mediumBoard") int[][] mediumBoard,
                  @JsonProperty("hardBoard") int[][] hardBoard,
                  @JsonProperty("solution") int[][] solution,
                  @JsonProperty("date") String date) {
        this.easyBoard = easyBoard;
        this.mediumBoard = mediumBoard;
        this.hardBoard = hardBoard;
        this.solution = solution;
        this.date = date;
    }

    // Getters y setters para todos los campos
    public int[][] getEasyBoard() {
        return easyBoard;
    }

    public void setEasyBoard(int[][] easyBoard) {
        this.easyBoard = easyBoard;
    }

    public int[][] getMediumBoard() {
        return mediumBoard;
    }

    public void setMediumBoard(int[][] mediumBoard) {
        this.mediumBoard = mediumBoard;
    }

    public int[][] getHardBoard() {
        return hardBoard;
    }

    public void setHardBoard(int[][] hardBoard) {
        this.hardBoard = hardBoard;
    }

    public int[][] getSolution() {
        return solution;
    }

    public void setSolution(int[][] solution) {
        this.solution = solution;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}