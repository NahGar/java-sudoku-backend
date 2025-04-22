package org.ngarcia.sudoku.daily.controller;

import org.ngarcia.sudoku.daily.model.Sudoku;
import org.ngarcia.sudoku.daily.model.SudokuLevel;
import org.ngarcia.sudoku.daily.service.SudokuService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sudoku")
public class SudokuController {
    private final SudokuService sudokuService;

    public SudokuController(SudokuService sudokuService) {
        this.sudokuService = sudokuService;
    }

    @GetMapping("/daily")
    public Object getDailySudoku(@RequestParam(required = false) String difficulty) {
        try {
            Sudoku dailySudoku = sudokuService.getDailySudoku();

            if (difficulty != null) {
                int[][] board;
                switch(difficulty.toLowerCase()) {
                    case "easy":
                        board = dailySudoku.getEasyBoard();
                        break;
                    case "medium":
                        board = dailySudoku.getMediumBoard();
                        break;
                    case "hard":
                        board = dailySudoku.getHardBoard();
                        break;
                    default:
                        throw new IllegalArgumentException("Dificultad no válida");
                }
                return new SudokuLevel(board, dailySudoku.getDate(), difficulty);
            }

            return dailySudoku;
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el sudoku diario", e);
        }
    }
}