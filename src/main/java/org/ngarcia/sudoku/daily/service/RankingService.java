package org.ngarcia.sudoku.daily.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.ngarcia.sudoku.daily.model.RankingEntry;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.util.*;

@Service
public class RankingService {
   private final String basePath = "rankings/";

   public List<RankingEntry> getRanking(String dificultad, LocalDate fecha) throws Exception {
      File file = getFile(dificultad, fecha);
      if (!file.exists()) {
         List<RankingEntry> inicial = Arrays.asList(
                 new RankingEntry("Ana", 300),
                 new RankingEntry("Luis", 320),
                 new RankingEntry("Sofía", 340),
                 new RankingEntry("Carlos", 360),
                 new RankingEntry("Elena", 380),
                 new RankingEntry("Pedro", 400),
                 new RankingEntry("Lucía", 420),
                 new RankingEntry("Miguel", 440),
                 new RankingEntry("Sara", 460),
                 new RankingEntry("David", 480)
         );
         saveRanking(dificultad, fecha, inicial);
         return inicial;
      }
      ObjectMapper mapper = new ObjectMapper();
      return Arrays.asList(mapper.readValue(file, RankingEntry[].class));
   }

   public void saveRanking(String dificultad, LocalDate fecha, List<RankingEntry> ranking) throws Exception {
      File file = getFile(dificultad, fecha);
      file.getParentFile().mkdirs();
      ObjectMapper mapper = new ObjectMapper();
      mapper.writeValue(file, ranking);
   }

   public void addToRanking(String dificultad, LocalDate fecha, RankingEntry nuevo) throws Exception {
      List<RankingEntry> ranking = getRanking(dificultad, fecha);
      ranking.add(nuevo);
      ranking.sort(Comparator.comparingInt(RankingEntry::getTiempoSegundos));
      if (ranking.size() > 10) ranking = ranking.subList(0, 10);
      saveRanking(dificultad, fecha, ranking);
   }

   private File getFile(String dificultad, LocalDate fecha) {
      String fileName = basePath + fecha + "_" + dificultad + ".json";
      return new File(fileName);
   }
}