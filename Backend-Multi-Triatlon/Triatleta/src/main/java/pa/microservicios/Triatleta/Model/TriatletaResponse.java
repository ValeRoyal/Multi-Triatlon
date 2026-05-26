/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Model;

import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Asus
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
public class TriatletaResponse {
    Long id;
    String nombre;
    LocalDate fechaNacimiento;
    String identificacion;
    String correo;
    String genero;
    Boolean activo;
    
    String urlFoto;
    String categoria;
    Boolean modalidadCross;
    String especialidad;
    
    CarreraResponse carrera;
}
