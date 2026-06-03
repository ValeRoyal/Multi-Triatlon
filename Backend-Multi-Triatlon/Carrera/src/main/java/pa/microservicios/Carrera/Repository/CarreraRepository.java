/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Repository;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pa.microservicios.Carrera.Model.CarreraDTO;

/**
 *
 * @author Asus
 */
@Repository
public interface CarreraRepository extends JpaRepository<CarreraDTO, Long> {

    /**
     * Actualiza la ubicacion de la carrera
     *
     * @param id
     * @param nuevaUbicacion
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional
    @Query("UPDATE CarreraDTO c SET c.ubicacion = :nuevaUbicacion WHERE c.id = :id")
    int actualizarUbicacion(@Param("id") Long id, @Param("nuevaUbicacion") String nuevaUbicacion);

    /**
     * Actualiza la fecha de la carrera
     *
     * @param id
     * @param nuevaFechaEjecucion 
     * @return entero para conocer el numero de filas actualizadas
     */
    @Modifying
    @Transactional
    @Query("UPDATE CarreraDTO c SET c.fechaEjecucion = :nuevaFechaEjecucion WHERE c.id = :id")
    int actualizarFechaEjecucion(@Param("id") Long id, @Param("nuevaFechaEjecucion") LocalDateTime nuevaFechaEjecucion);
    
    /**
     * Busca una carrera con su nombre, lo cree para validar si una carrera ya existe
     * @param nombreCarrera
     * @return la carrera por su nombre
     */
    Optional<CarreraDTO> findByNombreCarrera(String nombreCarrera);
    
    /**
     * Encuentra todas las carreras que compartan el id de su categoria
     * @param categoriaId 
     * @return  Lista de dtos
     */
    List<CarreraDTO> findByCategoriaId(Long categoriaId);
    
}
