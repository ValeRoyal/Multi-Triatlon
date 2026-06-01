/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Model;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Asus
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarreraResponse {
    Long id;
    String nombreCarrera;
    String ubicacion;
    LocalDateTime fechaEjecucion;
    String nivelDificultad;
    String paraQuien;
    
    Long categoriaId;
    CategoriaResponse categoria;//esta aqui porque el requerimiento pide consultar los datos de la carrera
    
}
