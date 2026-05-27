/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Repository;

import java.util.List;
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
    /**
     * Actualiza el nombre del triatleta
     *
     * @param id
     * @param nuevoNombre
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional //necesario para operaciones de escritura
    /*Query personalizada tipo UPDATE 
    Primero el nombre de la entidad que lleva el @Entity se le asigna un nombre t como si fuera objeto
    se hace SET al parametro a cambiar y se le pone ":" a la variable.
    Luego un WHERE para buscar en la tabla el id 
     */
    @Query("UPDATE TriatletaDTO t SET t.nombre = :nuevoNombre WHERE t.id = :id")
    int actualizarNombre(@Param("id") Long id, @Param("nuevoNombre") String nuevoNombre);

    /**
     * Actualiza la identificacion del triatleta
     *
     * @param id
     * @param nuevaIdentificacion
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional
    @Query("UPDATE TriatletaDTO t SET t.identificacion = :nuevaIdentificacion WHERE t.id = :id")
    int actualizarIdentificacion(@Param("id") Long id, @Param("nuevaIdentificacion") String nuevaIdentificacion);

    /**
     * Actualiza la categoria por edad del triatleta por edad
     *
     * @param id
     * @param nuevaCategoria
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional
    @Query("UPDATE TriatletaDTO t SET t.categoriaEdad = :nuevaCategoria WHERE t.id = :id")
    int actualizarCategoria(@Param("id") Long id, @Param("nuevaCategoria") String nuevaCategoria);

    /**
     * Actualiza el genero del triatleta por edad o genero
     *
     * @param id
     * @param nuevoGenero
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional
    @Query("UPDATE TriatletaDTO t SET t.genero = :nuevoGenero WHERE t.id = :id")
    int actualizarGenero(@Param("id") Long id, @Param("nuevoGenero") String nuevoGenero);

    /**
     * Encuentra un triatleta por su identificacion, recordar que esta es única
     *
     * @param identificacion
     * @return Un optional para manejar los null
     */
    Optional<TriatletaDTO> findByIdentificacion(String identificacion);

    /**
     * Encuentra todos los triatletas por genero (masculino o femenino)
     * @param genero
     * @return Lista de triatletas por genero
     */
    List<TriatletaDTO> findByGenero(String genero);

    /**
     * Encuentra todos los triatletas por categoria segun su edad
     * @param categoriaEdad
     * @return Lista de triatletas por categoria segun edad
     */
    List<TriatletaDTO> findByCategoriaEdad(String categoriaEdad);

    /**
     * Encuentra todos los triatletas por su especialidad
     * @param especialidad
     * @return Lista de triatletas por su especialidad
     */
    List<TriatletaDTO> findByEspecialidad(String especialidad);

    /**
     * Encuentra todos los triatletas por modalidad cross
     * @param modalidadCross
     * @return Lista de triatletas que hacen modalidad cross
     */
    List<TriatletaDTO> findByModalidadCross(Boolean modalidadCross);
}
