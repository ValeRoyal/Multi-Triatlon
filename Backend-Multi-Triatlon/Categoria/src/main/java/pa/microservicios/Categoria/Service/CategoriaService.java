/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Categoria.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pa.microservicios.Categoria.Model.CarreraResponse;
import pa.microservicios.Categoria.Model.CategoriaDTO;
import pa.microservicios.Categoria.Model.CategoriaResponse;
import pa.microservicios.Categoria.Repository.CategoriaRepository;

/**
 *
 * @author Asus
 */
@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private WebClient webClient;

    /**
     * Crea una categoria
     *
     * @param categoriaDTO
     * @return CategoriaResponse
     */
    public CategoriaResponse crearCategoria(CategoriaDTO categoriaDTO) {
        //valida si ya existe una categoria con ese nombre
        if (categoriaRepository.findByNombreCategoria(categoriaDTO.getNombreCategoria()).isPresent()) {
            throw new RuntimeException("Ya existe una categoria con el nombre: " + categoriaDTO.getNombreCategoria());
        }
        //guarda la categoria en la BD y en una variable local para poder usarla para mapear
        CategoriaDTO guardada = categoriaRepository.save(categoriaDTO);
        //mapea la categoriaDTO a una categoriaresponse
        return mapper.map(guardada, CategoriaResponse.class);
    }

    /**
     * Consulta una categoria por su id
     *
     * @param id
     * @return CategoriaResponse
     */
    public CategoriaResponse getCategoriaById(Long id) {
        //delegamos a repository para que busque la categoria por id, usamos optional para manejar el null
        Optional<CategoriaDTO> optionalCategoria = categoriaRepository.findById(id);
        CategoriaDTO dto = optionalCategoria.get();//devuelve el valor del optional si existe, si no, la excepcion NoSuchElementException
        return mapper.map(dto, CategoriaResponse.class);//mapeamos de dto a response
    }

    /**
     * Consulta todas las categorias disponibles
     *
     * @return Lista de CategoriaResponse
     */
    public List<CategoriaResponse> getAllCategorias() {
        //Extraigo las categorias
        List<CategoriaDTO> dtos = categoriaRepository.findAll();
        //inicializo mi nuevo arraylist de responses
        List<CategoriaResponse> responses = new ArrayList<>();
        //por cada objeto de tipo categoriadto en la lista dtos
        for (CategoriaDTO categoriaDTO : dtos) {
            //mapear cada objeto categoria dto a mi clase response
            CategoriaResponse response = mapper.map(categoriaDTO, CategoriaResponse.class);
            //meter este objeto mapeado en mi arraylist de responses
            responses.add(response);
        }
        return responses;
    }

    /**
     * Actualiza la descripcion de una categoria
     *
     * @param id
     * @param nuevaDescripcion
     */
    public void updateDescripcion(Long id, String nuevaDescripcion) {
        //actualiza la descripcion, ademas guardamos las filas porque nos sirve para validar
        int filas = categoriaRepository.updateDescripcion(id, nuevaDescripcion);
        if (filas == 0) {//si no afecto a ninguna fila
            throw new RuntimeException("No existe categoria con id: " + id);
        }
    }

    /**
     * Actualiza la Recomendacion de una categorias
     *
     * @param id
     * @param nuevaRecomendacion
     */
    public void updateRecomendacion(Long id, String nuevaRecomendacion) {
        //actualiza la recomendacion, ademas guardamos las filas porque nos sirve para validar
        int filas = categoriaRepository.updateRecomendacion(id, nuevaRecomendacion);
        if (filas == 0) {//si no afecto a ninguna fila
            throw new RuntimeException("No existe categoria con id: " + id);
        }
    }

    /**
     * Borra una categoria por su id
     *
     * @param id
     */
    public void deleteCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {//si no existe una categoria con ese id
            throw new RuntimeException("No existe categoria con id: " + id);
        }
        categoriaRepository.deleteById(id);//delega a repository    
    }

    //recibir id de la categoria a consultar con sus carreras asociadas
    public CategoriaResponse getCarreras(Long categoriaId) {
        //uso mi metodo ya creado en el service para buscar la categoria por su id
        CategoriaResponse response = getCategoriaById(categoriaId);
        //creo una lista de carreras response para consumir el endpoint del proyecto carrera
        List<CarreraResponse> carreras = webClient.get()//bean ya configurado, usamos su metodo get
                .uri("/carreras-por-categoria/{categoriaId}", categoriaId)//colocamos el resto de la url, junto con su parametro
                .retrieve()//extraemos los objetos este metodo reterieve() nos permite declarar como extraeremos la respuesta
                .bodyToFlux(CarreraResponse.class)//convertir el JSON de respuesta en un flujo de objetos CarreraResponse
                .collectList()//recolectamos los objetos
                .block();//bloqueante para esperar la respuesta de forma sincrona
        response.setCarreras(carreras);
        return response;
    }

}
