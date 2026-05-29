/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Categoria.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Asus
 */
@Entity
@Table(name = "categorias")
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoriaDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotBlank
    @Column(name = "nombre_categoria", nullable = false, unique = true, length = 50)
    String nombreCategoria;

    @NotBlank
    @Column(name = "tipo_categoria", nullable = false, length = 100)
    String tipoCategoria;

    @NotBlank
    @Column(name = "descripcion", nullable = false, length = 300)
    String descripcion;

    @NotBlank
    @Column(name = "recomendacion", nullable = false, length = 300)
    String recomendacion;

    public CategoriaDTO(String nombreCategoria, String tipoCategoria, String descripcion, String recomendacion) {
        this.nombreCategoria = nombreCategoria;
        this.tipoCategoria = tipoCategoria;
        this.descripcion = descripcion;
        this.recomendacion = recomendacion;
    }

}
