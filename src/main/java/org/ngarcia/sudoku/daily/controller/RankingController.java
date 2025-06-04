package org.ngarcia.sudoku.daily.controller;

import org.ngarcia.sudoku.daily.model.RankingEntry;
import org.ngarcia.sudoku.daily.service.RankingService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ranking")
@CrossOrigin(origins = {"http://localhost:8081","https://www.peaksw.com"})
public class RankingController {

   private final RankingService rankingService;

   public RankingController(RankingService rankingService) {
      this.rankingService = rankingService;
   }

   @GetMapping("/{dificultad}")
   public List<RankingEntry> getRanking(@PathVariable String dificultad) throws Exception {
      LocalDate fecha = LocalDate.now(); // Obtiene la fecha actual
      return rankingService.getRanking(dificultad, fecha);
   }
}
