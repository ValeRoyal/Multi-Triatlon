/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Model;

import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Asus
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
public class TriatletaResponse {
    
    Long id;
    String nombre;
    LocalDate fechaNacimiento;
    String identificacion;
    String correo;
    String genero;
    Boolean activo;

    String urlFoto;
    String categoriaEdad;
    Boolean modalidadCross;
    String especialidad;
    
    //datos de la carrera que vienen de otro microservicio se guarda el id de esta carrera como referencia externa
    Long carreraId;
    //aqui debe haber esta asociacion porque el requerimiento pide explicitamente que se debe traer la informacion de la carrera
    //junto con todos los datos del triatleta
    CarreraResponse carrera;
}
