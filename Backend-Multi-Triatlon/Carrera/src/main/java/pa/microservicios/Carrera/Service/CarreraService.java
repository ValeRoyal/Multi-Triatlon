/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pa.microservicios.Carrera.Model.CarreraDTO;
import pa.microservicios.Carrera.Model.CarreraResponse;
import pa.microservicios.Carrera.Repository.CarreraRepository;

/**
 *
 * @author Asus
 */
@Service
public class CarreraService {

    @Autowired
    private CarreraRepository carreraRepository;

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private WebClient webClient;

    /**
     * Crea una carrera
     * @param carreraDTO
     * @return CarreraResponse ya mapeada
     */
    public CarreraResponse crearCarrera(CarreraDTO carreraDTO) {
        if (carreraRepository.findByNombreCarrera(carreraDTO.getNombreCarrera()).isPresent()) {
            throw new RuntimeException("Ya existe una carrera con este nombre");
        }
        CarreraDTO guardada = carreraRepository.save(carreraDTO);

        return mapper.map(guardada, CarreraResponse.class);
    }

    /**
     * Actualiza la ubicacion de una carrera por su id delegando a
     * repository
     *
     * @param id
     * @param nuevaUbicacion 
     */
    public void updateUbicacion(Long id, String nuevaUbicacion) {
        int filas = carreraRepository.actualizarUbicacion(id, nuevaUbicacion);//siempre deberia retornar un 1
        if (filas == 0) {
            throw new RuntimeException("No existe carrera con id: " + id);//valida si no se afecto ninguna fila
        }
    }

    /**
     * Actualiza la fecha de ejecucion de una carrera por su id delegando a
     * repository
     *
     * @param id
     * @param nuevaFechaEjecucion
     */
    public void updateFechaEjecucion(Long id, LocalDateTime nuevaFechaEjecucion) {
        int filas = carreraRepository.actualizarFechaEjecucion(id, nuevaFechaEjecucion);
        if (filas == 0) {
            throw new RuntimeException("No existe carrera con id: " + id);
        }
    }

    /**
     * Consulta una carrera por su id
     *
     * @param id
     * @return CarreraResponse (ya mapeado)
     */
    public CarreraResponse getCarreraById(Long id) {
        Optional<CarreraDTO> optionalCarrera = carreraRepository.findById(id);
        CarreraDTO dto = optionalCarrera.get();
        return mapper.map(dto, CarreraResponse.class);
    }

    /**
     * Borra una carrera
     *
     * @param id
     */
    public void deleteCarrera(Long id) {
        if (!carreraRepository.existsById(id)) {
            throw new RuntimeException("No existe carrera con id: " + id); //valida si no existe una carrera con ese id
        }
        carreraRepository.deleteById(id);//delega a repository para borrar la carrera por su id
    }
}
