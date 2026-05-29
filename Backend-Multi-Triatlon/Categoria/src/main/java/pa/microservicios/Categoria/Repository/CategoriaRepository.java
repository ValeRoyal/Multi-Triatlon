/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Categoria.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import pa.microservicios.Categoria.Model.CategoriaDTO;

/**
 *
 * @author Asus
 */
@Repository
public interface CategoriaRepository extends JpaRepository<CategoriaDTO, Long> {

    /**
     * Query personalizada para actualizar la descripcion de una Categoria
     *
     * @param id
     * @param nuevaDescripcion 
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional    //necesario para operaciones de escritura
    /*Query personalizada tipo UPDATE
    Primero el nombre de la entidad que lleva el @Entity se le asigna un nombre como si fuera objeto
    se hace SET al parametro a cambiar y se le pone ":" a la variable.
    Luego un WHERE para buscar en la tabla el id 
     */
    @Query("UPDATE CategoriaDTO cat SET cat.descripcion = :nuevaDescripcion WHERE cat.id = :id")
    int updateDescripcion(@Param("id") Long id, @Param("nuevaDescripcion") String nuevaDescripcion);
    
    /**
     * Query personalizada para actualizar la recomendacion de una Categoria
     * @param id
     * @param nuevaRecomendacion
     * @return int para saber el numero de filas afectadas
     */
    @Modifying
    @Transactional
    @Query("UPDATE CategoriaDTO cat SET cat.recomendacion :nuevaRecomendacion WHERE cat.id = :id")
    int updateRecomendacion(@Param("id") Long id, @Param("nuevaRecomendacion") String nuevaRecomendacion);

    Optional<CategoriaDTO> findByNombreCategoria(String nombreCategoria);
}
