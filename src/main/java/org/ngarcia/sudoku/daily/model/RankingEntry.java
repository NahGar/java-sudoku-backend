package org.ngarcia.sudoku.daily.model;

public class RankingEntry {
   private String nombre;
   private int tiempoSegundos;

   public RankingEntry() {}

   public RankingEntry(String nombre, int tiempoSegundos) {
      this.nombre = nombre;
      this.tiempoSegundos = tiempoSegundos;
   }

   public String getNombre() {
      return nombre;
   }

   public void setNombre(String nombre) {
      this.nombre = nombre;
   }

   public int getTiempoSegundos() {
      return tiempoSegundos;
   }

   public void setTiempoSegundos(int tiempoSegundos) {
      this.tiempoSegundos = tiempoSegundos;
   }
}
