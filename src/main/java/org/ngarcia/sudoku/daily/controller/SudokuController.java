package org.ngarcia.sudoku.daily.controller;

import org.ngarcia.sudoku.daily.model.Sudoku;
import org.ngarcia.sudoku.daily.service.SudokuService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sudoku")
@CrossOrigin(origins = {"http://localhost:8081","https://www.peaksw.com"})
public class SudokuController {
    private final SudokuService sudokuService;
    private static final Logger logger = LoggerFactory.getLogger(SudokuController.class);

    public SudokuController(SudokuService sudokuService) {
        this.sudokuService = sudokuService;
    }

    @GetMapping("/daily")
    public ResponseEntity<?> getDailySudoku(@RequestParam(required = false) String difficulty) {
        try {
            Sudoku dailySudoku = sudokuService.getDailySudoku();

            if (difficulty != null) {
                int[][] board = switch(difficulty.toLowerCase()) {
                    case "easy" -> dailySudoku.getEasyBoard();
                    case "medium" -> dailySudoku.getMediumBoard();
                    case "hard" -> dailySudoku.getHardBoard();
                    default -> throw new IllegalArgumentException("Dificultad no válida");
                };

                return ResponseEntity.ok(Map.of(
                        "board", board,
                        "solution", dailySudoku.getSolution(),
                        "date", dailySudoku.getDate(),
                        "difficulty", difficulty
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "easy", dailySudoku.getEasyBoard(),
                    "medium", dailySudoku.getMediumBoard(),
                    "hard", dailySudoku.getHardBoard(),
                    "solution", dailySudoku.getSolution(),
                    "date", dailySudoku.getDate()
            ));

        } catch (IllegalArgumentException e) {
            logger.warn("Parámetro inválido recibido: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "valid_difficulties", List.of("easy", "medium", "hard")
            ));
        } catch (Exception e) {
            logger.error("Error al generar sudoku", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error interno al generar el sudoku",
                    "message", e.getMessage()
            ));
        }
    }
}