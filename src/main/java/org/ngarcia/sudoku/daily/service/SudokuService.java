package org.ngarcia.sudoku.daily.service;

import org.ngarcia.sudoku.daily.model.Sudoku;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;

@Service
public class SudokuService {
    private final SudokuGenerator generator;
    private final SudokuStorage storage;

    public SudokuService() {
        this.generator = new SudokuGenerator();
        this.storage = new SudokuStorage();
    }

    public Sudoku getDailySudoku() throws IOException {
        String today = LocalDate.now().toString();
        Sudoku sudoku = storage.loadSudoku(today);

        if (sudoku == null) {
            sudoku = generator.generateDailySudoku();
            storage.saveSudoku(sudoku);
        }

        return sudoku;
    }
}
