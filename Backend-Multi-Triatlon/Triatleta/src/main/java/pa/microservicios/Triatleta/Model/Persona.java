/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Model;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Asus Clase padre para garantizar la flexibilidad del software como
 * puede ser una futura entidad
 */
@Data //Getters y Setters
@FieldDefaults(level = AccessLevel.PRIVATE) //Todos los atributos de nivel de acceso privado
@MappedSuperclass //Permite heredad campos persistentes en entidades hijas
@NoArgsConstructor
public class Persona {

    @Id //Llave primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Llave primaria 
    Long id;

    @NotBlank //No puede ser vacia
    //Nombre de la columna, no puede ser nula, no es unica, de tamaño 50 VarChar
    @Column(name = "nombre", nullable = false, unique = false, length = 50)
    String nombre;

    @NotNull //No puede ser nulo, en este caso no aplica el @NotBlank porque este es un valor numerico entero
    @Past//Una persona no puede nacer mañana
    @Column(name = "fecha_nacimiento", nullable = false, unique = false)
    LocalDate fechaNacimiento;

    @NotBlank
    @Column(name = "identificacion", nullable = false, unique = true, length = 50)
    String identificacion;

    @NotBlank
    @Email //Le decimos a Spring que será una direccion de correo
    @Column(name = "correo", nullable = false, unique = true, length = 200)
    String correo;

    @NotBlank
    @Column(name = "genero", nullable = false, unique = false)
    String genero;

    @NotNull
    @Column(name = "activo", nullable = false)
    Boolean activo;

    /**
     * Constructor para la clase Persona, Este sin id.
     *
     * @param nombre
     * @param fechaNacimiento
     * @param identificacion
     * @param correo
     * @param genero
     * @param activo
     */
    public Persona(String nombre, LocalDate fechaNacimiento, String identificacion, String correo, String genero, Boolean activo) {
        this.nombre = nombre;
        this.fechaNacimiento = fechaNacimiento;
        this.identificacion = identificacion;
        this.correo = correo;
        this.genero = genero;
        this.activo = activo;
    }

}
