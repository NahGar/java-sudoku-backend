package org.ngarcia.sudoku.daily.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.ngarcia.sudoku.daily.model.Sudoku;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Component
public class SudokuStorage {
    private static final String SUDOKU_DIR = "sudokus/";

    public void saveSudoku(Sudoku sudoku) throws IOException {
        // Crear directorio si no existe
        Files.createDirectories(Paths.get(SUDOKU_DIR));

        // Guardar sudoku como JSON
        ObjectMapper mapper = new ObjectMapper();
        File file = new File(SUDOKU_DIR + "sudoku_" + sudoku.getDate() + ".json");
        mapper.writeValue(file, sudoku);
    }

    public Sudoku loadSudoku(String date) throws IOException {
        File file = new File(SUDOKU_DIR + "sudoku_" + date + ".json");
        if (file.exists()) {
            ObjectMapper mapper = new ObjectMapper();
            // Habilita la aceptación de propiedades no reconocidas
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            return mapper.readValue(file, Sudoku.class);
        }
        return null;
    }
}
