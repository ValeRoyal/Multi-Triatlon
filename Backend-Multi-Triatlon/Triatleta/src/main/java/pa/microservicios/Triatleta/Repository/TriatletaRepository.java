/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import pa.microservicios.Triatleta.Model.TriatletaDTO;

/**
 *
 * @author Asus
 */
@Repository
public interface TriatletaRepository extends JpaRepository<TriatletaDTO, Long> {

    //==========MODIFICACION PARCIAL  DEL TRIATLETA===========================
    @Modifying
    @Transactional //necesario para operaciones de escritura
    /*Query personalizada tipo UPDATE 
    Primero el nombre de la entidad que lleva el @Entity se le asigna un nombre t como si fuera objeto
    se hace SET al parametro a cambiar y se le pone ":" a la variable.
    Luego un WHERE para buscar en la tabla el id 
     */
    @Query("UPDATE TriatletaDTO t SET t.nombre = :nuevoNombre WHERE t.id = :id")
    //Retorna un int para saber el numero de filas afectadas, 1 si lo encontro y se hizo, 0 si no econtro
    //si es mas de uno hay que preocuparse 
    int actualizarNombre(@Param("id") Long id, @Param("nuevoNombre") String nuevoNombre);

    @Modifying
    @Transactional
    @Query("UPDATE TriatletaDTO t SET t.identificacion = :nuevaIdentificacion WHERE t.id = :id")
    int actualizarIdentificacion(@Param("id") Long id, @Param("nuevaIdentificacion") String nuevaIdentificacion);

    @Modifying
    @Transactional
    @Query("UPDATE TriatletaDTO t SET t.categoria = :nuevaCategoria WHERE t.id = :id")
    int actualizarCategoria(@Param("id") Long id, @Param("nuevaCategoria") String nuevaCategoria);

    //POR IDENTIFICACION OPTIONAL PARA LAS EXCEPCIONES
    Optional<TriatletaDTO> findByIdentificacion(String identificacion);
}
