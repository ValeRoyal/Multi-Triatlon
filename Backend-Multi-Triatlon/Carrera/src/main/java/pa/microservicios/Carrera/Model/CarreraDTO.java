/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Asus
 */
@Data
@Entity
@NoArgsConstructor
@Table(name = "carreras")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarreraDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotBlank
    @Column(name = "nombre_carrera", nullable = false, length = 100)
    String nombreCarrera;
    
    @NotBlank
    @Column(name = "ubicacion", nullable = false, length = 100)
    String ubicacion;
    
    @NotBlank
    @Column(name = "fecha_ejecucion", nullable = false, length = 100)
    LocalDateTime fechaEjecucion;
    
    @NotBlank
    @Column(name = "nivel_dificultad", nullable = false, length = 40)
    String nivelDificultad;
    
    @NotBlank
    @Column(name = "para_quien", nullable = false, length = 300)
    String paraQuien;
    
    @NotNull
    @Column(name = "categoria_id", nullable = false)
    Long categoriaId;

    public CarreraDTO(String nombreCarrera, String ubicacion, LocalDateTime fechaEjecucion, String nivelDificultad, String paraQuien, Long categoriaId) {
        this.nombreCarrera = nombreCarrera;
        this.ubicacion = ubicacion;
        this.fechaEjecucion = fechaEjecucion;
        this.nivelDificultad = nivelDificultad;
        this.paraQuien = paraQuien;
        this.categoriaId = categoriaId;
    }

}
