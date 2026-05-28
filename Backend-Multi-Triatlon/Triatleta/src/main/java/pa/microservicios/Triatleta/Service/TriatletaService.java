/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pa.microservicios.Triatleta.Model.TriatletaDTO;
import pa.microservicios.Triatleta.Model.TriatletaResponse;
import pa.microservicios.Triatleta.Repository.TriatletaRepository;

/**
 *
 * @author Asus
 */
@Service
public class TriatletaService {

    @Autowired
    private TriatletaRepository triatletaRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ModelMapper mapper;
    
    @Autowired
    private WebClient webClient;

    //EXTRAIDO DE: https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/value-annotations.html
    @Value("${correo.asunto}")//extrae del application properties y lo guarda en esta variable global
    private String asuntoRegistro;

    @Value("${correo.mensaje}")//extrae del applicaton properties y lo guarda en esta variable global
    private String mensajeRegistro;

    /**
     * Metodo para mapear listas de objetos TriatletasDTO's a TriatletasResponse
     * @param dtos
     * @return  Lista de Responses 
     */
    public List<TriatletaResponse> mapperAResponse(List<TriatletaDTO> dtos) {
        //Creo mi nueva lista de responses donde los voy a guardar
        List<TriatletaResponse> responses = new ArrayList<>();
        //Por cada Objeto de tipo TriatletaDTO en la lista dtos
        for (TriatletaDTO triatletaDTO : dtos) {
            //mappear cada objeto de tipo TriatletDTO a la clase TrialtetaResponse y guardarlo en mi variable respones
            TriatletaResponse response = mapper.map(triatletaDTO, TriatletaResponse.class);
            //Guardo los responses en mi lista de responses
            responses.add(response);
        }
        return responses;
    }

    //================OPERACIONES CRUD=========================
    //=============OPERACION CREATE========================
    /**
     * Crea un Triatleta delegando al triatletaRepository
     *
     * @param triatletaDTO
     * @return
     */
    public TriatletaResponse createTriatletaDTO(TriatletaDTO triatletaDTO) {
        //Como la identificacion la definimos como unica, sirve para validar si ya hay un usuario con esta identificacion
        if (triatletaRepository.findByIdentificacion(triatletaDTO.getIdentificacion()).isPresent()) {
            //el service hace la validacion y lanza la excepcion, ya el controller se encarga de propagarla
            throw new RuntimeException("Ya existe un triatleta con identificacion: " + triatletaDTO.getIdentificacion());
        }

        TriatletaDTO guardado = triatletaRepository.save(triatletaDTO);

//        try {
//            String contenido = mensajeRegistro.replace("{nombre}", guardado.getNombre()); //remplazar la variable nombre por el nombre del triatleta creado
//            enviarCorreoConfirmacion(guardado, asuntoRegistro, contenido); //usamos el metodo
//        } catch (Exception e) {
//            throw new RuntimeException("No fue posible enviar correo");
//        }

        return mapper.map(guardado, TriatletaResponse.class);
    }

    //=============OPERACIONES READ========================
    /**
     * Consulta Triatleta por Identificacion
     *
     * @param identificacion La identificacion del triatleta a buscar
     * @return Optional con el triatleta si existe
     */
    public TriatletaResponse getTriatletaByIdentificacion(String identificacion) {
        Optional<TriatletaDTO> optionalTriatleta = triatletaRepository.findByIdentificacion(identificacion);//delega a repository
        TriatletaDTO dto = optionalTriatleta.get();
        return mapper.map(dto, TriatletaResponse.class);
    }

    /**
     * Consulta todos los tritatletas por su genero
     *
     * @param genero Genero de los/las triatletas a consultar
     * @return Grupo de triatletas consultado por genero Femenino/Masculino
     */
    public List<TriatletaResponse> getTriatletasByGenero(String genero) {
        //Obtiene la lista de todos los DTO's de triatletas por genero
        List<TriatletaDTO> triatletasByGenero = triatletaRepository.findByGenero(genero);//delega a repository
        return mapperAResponse(triatletasByGenero);
    }

    /**
     * Consulta todos los triatletas por su categoria
     *
     * @param categoriaEdad Categoria especifica de los triatletas a consultar
     * @return Grupo de triatletas consultado por su categoria
     */
    public List<TriatletaResponse> getTriatletasByCategoria(String categoriaEdad) {
        //Obtiene la lista de todos los DTO's de triatletas
        List<TriatletaDTO> triatletasByCategoria = triatletaRepository.findByCategoriaEdad(categoriaEdad);//delega a repository
        return mapperAResponse(triatletasByCategoria);
    }

    /**
     * Consulta todos los triatletas por su especialidad
     *
     * @param especialidad Especialidad de los triatletas a consultar
     * @return Grupo de triatletas consultado por especialidad
     */
    public List<TriatletaResponse> getTriatletasByEspecialidad(String especialidad) {
        //Obtiene la lista de todos los DTO's de triatletas
        List<TriatletaDTO> triatletasByEspecialidad = triatletaRepository.findByEspecialidad(especialidad);//delega a repository
        return mapperAResponse(triatletasByEspecialidad);
    }

    /**
     * Consulta todos los triatletas que hacen o no hacen Modalidad Cross
     *
     * @param modalidadCross Hace cross? si o no
     * @return Grupo de triatletas consultado si hace o no hace Modalidad Cross
     */
    public List<TriatletaResponse> getTriatletasByModalidadCross(Boolean modalidadCross) {
        //Obtiene la lista de todos los DTO's de triatletas
        List<TriatletaDTO> triatletasByModalidadCross = triatletaRepository.findByModalidadCross(modalidadCross);//delega a repository
        return mapperAResponse(triatletasByModalidadCross);
    }

    //=============OPERACIONES UPDATE========================
    public TriatletaResponse updateCompleto(Long id, TriatletaDTO triatletaDTO) {
        if (!triatletaRepository.existsById(id)) {
            throw new RuntimeException("No existe triatleta con id: " + id);
        }
        triatletaDTO.setId(id); // asegura que actualiza el correcto
        TriatletaDTO guardado = triatletaRepository.save(triatletaDTO);//delega a repository
        return mapper.map(guardado, TriatletaResponse.class);
    }

    /**
     * Actualiza el nombre de un triatleta delegando a repository
     *
     * @param id
     * @param nuevoNombre
     */
    public void updateNombre(Long id, String nuevoNombre) {
        int filas = triatletaRepository.actualizarNombre(id, nuevoNombre);//delega a repository
        if (filas == 0) {
            throw new RuntimeException("No existe triatleta con id: " + id);
        }
    }

    /**
     * Actualiza la identificacion de un triatleta por su id delegando a
     * repository
     *
     * @param id
     * @param nuevaIdentificacion
     */
    public void updateIdentificacion(Long id, String nuevaIdentificacion) {
        int filas = triatletaRepository.actualizarIdentificacion(id, nuevaIdentificacion);//delega a repository
        if (filas == 0) {
            throw new RuntimeException("No existe triatleta con id: " + id);
        }
    }

    /**
     * Actualiza la categoria de un triatleta por su id delegando a repository
     *
     * @param id
     * @param nuevaCategoria
     */
    public void updateCategoria(Long id, String nuevaCategoria) {
        int filas = triatletaRepository.actualizarCategoria(id, nuevaCategoria);//delega a repository
        if (filas == 0) {
            throw new RuntimeException("No existe triatleta con id: " + id);
        }
    }
    
    /**
     * Actualiza el genero de un triatleta por su id delegando a repository
     *
     * @param id
     * @param nuevoGenero 
     */
    public void updateGenero(Long id, String nuevoGenero) {
        int filas = triatletaRepository.actualizarGenero(id, nuevoGenero);//delega a repository
        if (filas == 0) {
            throw new RuntimeException("No existe triatleta con id: " + id);
        }
    }

    //=============OPERACION DELETE ========================
    /**
     * Borra por id un triatleta
     *
     * @param id
     */
    public void deleteTriatletaDTO(Long id) {
        if (!triatletaRepository.existsById(id)) {
            throw new RuntimeException("No existe triatleta con id: " + id);
        }
        triatletaRepository.deleteById(id);//delega a repository
    }

    //====================CORREO DE REGISTRO===============
    public void enviarCorreoConfirmacion(TriatletaDTO triatletaDTO, String asunto, String contenido) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(triatletaDTO.getCorreo());
        mensaje.setSubject(asunto);
        mensaje.setText(contenido);
        mailSender.send(mensaje);
    }

}
