/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pa.microservicios.Carrera.Model.CarreraDTO;
import pa.microservicios.Carrera.Model.CarreraResponse;
import pa.microservicios.Carrera.Model.CategoriaResponse;
import pa.microservicios.Carrera.Model.TriatletaResponse;
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
    private WebClient.Builder webClientBuilder;

    @Value("${webclient.url.triatleta}") //EXTRAIDO DE:
    //https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/value-annotations.html

    private String urlTriatleta; //extrae del application properties y lo guarda en esta variable global

    @Value("${webclient.url.categoria}") //EXTRAIDO DE:
    //https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/value-annotations.html

    private String urlCategoria; //extrae del application properties y lo guarda en esta variable global

    /**
     * Crea una carrera
     *
     * @param carreraDTO
     * @return CarreraResponse ya mapeada
     */
    public CarreraResponse crearCarrera(CarreraDTO carreraDTO) {
        if (carreraRepository.findByNombreCarrera(carreraDTO.getNombreCarrera()).isPresent()) {
            throw new RuntimeException("Ya existe una carrera con este nombre");
        }
        CategoriaResponse categoria = validarCategoriaExistente(carreraDTO.getCategoriaId());
        CarreraDTO guardada = carreraRepository.save(carreraDTO);

        CarreraResponse response = mapper.map(guardada, CarreraResponse.class);
        response.setCategoriaId(categoria.getId());
        return response;
    }

    /**
     * Valida que la categoria asociada a una carrera exista en el microservicio
     * Categoria antes de guardar la carrera.
     *
     * @param categoriaId id externo de la categoria
     * @return datos de la categoria consultada
     */
    private CategoriaResponse validarCategoriaExistente(Long categoriaId) {
        if (categoriaId == null) {
            throw new RuntimeException("La carrera debe tener una categoria asociada");
        }

        try {
            CategoriaResponse categoria = webClientBuilder.build()
                    .get()
                    .uri(urlCategoria + "/{id}", categoriaId)
                    .retrieve()
                    .bodyToMono(CategoriaResponse.class)
                    .block();

            if (categoria == null) {
                throw new RuntimeException("No existe categoria con id: " + categoriaId);
            }

            return categoria;
        } catch (WebClientResponseException e) {
            throw new RuntimeException("No existe categoria con id: " + categoriaId);
        }
    }

    /**
     * Actualiza la ubicacion de una carrera por su id delegando a repository
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
        CarreraDTO dto = carreraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe carrera con id: " + id));
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

    /**
     * metodo usado para consultar todas las carreras asociadas a una categoria,
     * lo llama la api de categorias
     *
     * @param categoriaId
     * @return Lista de CarrerasResponse
     */
    public List<CarreraResponse> getAllCarrerasByCategoria(Long categoriaId) {
        List<CarreraResponse> responses = new ArrayList<>();
        List<CarreraDTO> dtos = carreraRepository.findByCategoriaId(categoriaId);
        for (CarreraDTO carreraDTO : dtos) {
            CarreraResponse response = mapper.map(carreraDTO, CarreraResponse.class);
            responses.add(response);
        }
        return responses;
    }

    /**
     * Metodo para consultar la categoria asociada a una carrera
     *
     * @param carreraId
     * @return El contenido de la categoria consultada a la api de categorias
     */
    public CategoriaResponse consultarCategoria(Long carreraId) {
        //buscamos la carrera a la que se le va a consultar la categoria
        CarreraResponse carreraExtraida = getCarreraById(carreraId);
        //extraemos el id que tiene como referencia externa a su categoria
        Long idCategoriaAConsultar = carreraExtraida.getCategoriaId();
        //extraemos la respuesta llamando a la api categoria
        CategoriaResponse respuesta = webClientBuilder.build()//usamos el .build para construir nuestra url
                .get()//http get
                .uri(urlCategoria + "/{id}", idCategoriaAConsultar)//url, es suficientemente inteligente para entender que
                //lo que esta entre llaves es un parametro y despues de la coma le mandamos este parametro
                .retrieve()//nos permite declarar como queremos extraer la respuesta
                .bodyToMono(CategoriaResponse.class)//convertir el JSON de respuesta a nuestro response
                .block();//bloqueante para esperar la respuesta de manera sincrona
        return respuesta;
    }

    /**
     * Consulta todos los triatletas con todos sus datos inscritos en una
     * carrera
     *
     * @param idCarrera
     * @return Lista de triatletas responses
     */
    public List<TriatletaResponse> consultarTriatletas(Long idCarrera) {
        getCarreraById(idCarrera);//validacion a ver si existe

        List<TriatletaResponse> consultados = webClientBuilder.build()//usamos el build para construir una nueva uri
                .get()//http get
                .uri(urlTriatleta + "/carrera/{id}", idCarrera)//url con el parametro y el endpoint
                .retrieve()//nos permite declarar como extraer el response
                .bodyToFlux(TriatletaResponse.class)//de arreglo JSON a lista Java
                .collectList()//convierte el flux en un mono que contiene una list
                .block();//bloqueante para que sea sincrono

        return consultados;
    }

    /**
     * Elimina un triatleta de una carrera llamando a la API de triatletas. La
     * carrera no se borra y el triatleta tampoco, solo se quita la referencia
     * externa que une al triatleta con la carrera.
     *
     * @param carreraId id de la carrera usada para validar que exista
     * @param idTriatleta id del triatleta que se va a quitar de la carrera
     */
    public void eliminarTriatletaDeCarrera(Long carreraId, Long idTriatleta) {
        getCarreraById(carreraId);//para validar
        webClientBuilder.build()
                .patch()
                .uri(urlTriatleta + "/{idTriatleta}/eliminar-de-carrera", idTriatleta)
                .retrieve()
                .bodyToMono(Void.class)//le decimos que no espere ningun cuerpo de respuesta
                .block();
    }
}
