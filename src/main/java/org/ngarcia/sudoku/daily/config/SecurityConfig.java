package org.ngarcia.sudoku.daily.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

//@org.springframework.context.annotation.Configuration
public class SecurityConfig {
   /*
   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
      http
              .cors() // Habilita CORS antes de la seguridad
              .and()
              .csrf().disable()
              .authorizeRequests()
              .anyRequest().authenticated()
              .and()
              .httpBasic();
      return http.build();
   }
   */
}