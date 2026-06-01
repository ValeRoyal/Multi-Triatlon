/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Triatleta.Controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pa.microservicios.Triatleta.Model.TriatletaDTO;
import pa.microservicios.Triatleta.Model.TriatletaResponse;
import pa.microservicios.Triatleta.Service.TriatletaService;

/**
 *
 * @author Asus
 */
@RestController
@RequestMapping("/api/triatletas")
public class TriatletaRestController {

    @Autowired
    private TriatletaService triatletaService;

    /**
     * Define y expone el endpoint tipo POST para insertar un triatleta
     *
     * @param triatletaDTO
     * @return HTTP 200 (exito) HTTP 400 si falla
     */
    @RequestMapping(value = "/crear", method = RequestMethod.POST) //define el endpoint y el verbo http
    public ResponseEntity<?> createTriatleta(@Valid @RequestBody TriatletaDTO triatletaDTO) { //toma el JSON del body para convertirlo a objeto java
        //y lo valida con Validation
        try {
            TriatletaResponse creado = triatletaService.createTriatletaDTO(triatletaDTO); //llama al servicio para guardar el triatleta
            return ResponseEntity.ok(creado); //retorna HTTP 200 OK con el objeto creado
        } catch (RuntimeException e) { //captura el error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); //retorna 400 si algo falla
        }
    }

    /**
     * Define y expone el endpoint tipo GET para consultar un triatleta por su
     * identificacion
     *
     * @param identificacion
     * @return HTTP 200 si lo encuentra, HTTP 400 si falla
     */
    @RequestMapping(value = "/identificacion/{identificacion}", method = RequestMethod.GET)//define el endpoint y el verbo http
    public ResponseEntity<?> getTriatletaByIdentificacion(@PathVariable("identificacion") String identificacion) {//toma el id como parametro de la url
        try {
            TriatletaResponse consultado = triatletaService.getTriatletaByIdentificacion(identificacion);//delega al service para que le de el triatleta consultado
            return ResponseEntity.ok(consultado);//200OK
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); //retorna 400 si algo falla
        }
    }

    /**
     * Define y expone el endpoint tipo GET para consultar triatletas por su
     * genero
     *
     * @param genero
     * @return HTTP 200 con la lista de triatletas consultados
     */
    @RequestMapping(value = "/genero", method = RequestMethod.GET)
    public ResponseEntity<List<TriatletaResponse>> getTriatletasByGenero(@RequestParam String genero) {
        List<TriatletaResponse> triatletasPorGenero = triatletaService.getTriatletasByGenero(genero);
        return ResponseEntity.ok(triatletasPorGenero);
    }

    /**
     * Expone y define el endpoint para consultar todos los triatletas por
     * categoria
     *
     * @param categoriaEdad
     * @return HTTP 200 ok
     */
    @RequestMapping(value = "/categoria-edad", method = RequestMethod.GET)
    public ResponseEntity<List<TriatletaResponse>> getTriatletasByCategoria(@RequestParam String categoriaEdad) { //viene en la url despues del ?categoriaEdad=...
        List<TriatletaResponse> triatletasPorCategoria = triatletaService.getTriatletasByCategoria(categoriaEdad);//delega a service
        return ResponseEntity.ok(triatletasPorCategoria); //retorna un HTTP 200 ok
    }

    /**
     * Expone y define el endpoint tipo GET para consultar todos los triatletas
     * por su especialidad
     *
     * @param especialidad
     * @return HTTP 200 ok
     */
    @RequestMapping(value = "/especialidad", method = RequestMethod.GET)
    public ResponseEntity<List<TriatletaResponse>> getTriatletasByEspecialidad(@RequestParam String especialidad) { //viene en la url despues del ?especialidad=...
        List<TriatletaResponse> triatletasPorEspecialidad = triatletaService.getTriatletasByEspecialidad(especialidad);//delega a service
        return ResponseEntity.ok(triatletasPorEspecialidad); //retorna un HTTP 200 ok
    }

    /**
     * Expone y define el endpoint tipo GET para consultar todos los
     * triatletas por si hacen o no modalidad cross.
     *
     * @param modalidadCross
     * @return HTTP 200 ok
     */
    @RequestMapping(value = "/modalidad-cross", method = RequestMethod.GET)
    public ResponseEntity<List<TriatletaResponse>> getTriatletasByModalidadCross(@RequestParam Boolean modalidadCross) {  //viene en la url despues del ?modalidadCross=
        List<TriatletaResponse> triatletasPorCross = triatletaService.getTriatletasByModalidadCross(modalidadCross);//delega a service
        return ResponseEntity.ok(triatletasPorCross); //retorna un HTTP 200 ok
    }

    /**
     * Expone y define el endpoint tipo PUT para actualizar totalmente un
     * triatleta por su id
     *
     * @param id
     * @param triatletaDTO
     * @return HTTP 200 (exito) HTTP 404 si no existe
     */
    @RequestMapping(value = "/actualizar/{id}", method = RequestMethod.PUT)
    public ResponseEntity<?> updateCompleto(@PathVariable("id") Long id, @RequestBody TriatletaDTO triatletaDTO) {//el parametro id viene de la url. 
        //toma el JSON del body para convertirlo a objeto java
        try {
            TriatletaResponse actualizado = triatletaService.updateCompleto(id, triatletaDTO); //actualiza el triatleta delegando al service
            return ResponseEntity.ok(actualizado); //retorna HTTP 200 ok si todo sale bien
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //retorna HTTP 404 si no existe
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para actualizar el nombre de un
     * triatleta por su id
     *
     * @param id
     * @param body
     * @return HTTP 200 (exito) HTTP 404 si falla
     */
    @RequestMapping(value = "/{id}/nombre", method = RequestMethod.PATCH)//PATCH porque solo es un campo, no todo el objeto
    public ResponseEntity<?> updateNombre(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {//toma el id de la URL
        //toma el JSON del body @RequestBody
        try {
            triatletaService.updateNombre(id, body.get("nombre")); //llama al service y extrae el nombre del Map<>
            return ResponseEntity.ok("Nombre actualizado"); //200 ok 
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404 si no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para actualizar la identificacion
     * de un triatleta por su id
     *
     * @param id
     * @param body
     * @return 200 ok si todo sale bien, 404 si no lo encontro
     */
    @RequestMapping(value = "/{id}/identificacion", method = RequestMethod.PATCH) //PATCH porque solo modificamos un campo, no todo el objeto
    public ResponseEntity<?> updateIdentificacion(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {//extrae el id de la URL
        //toma el JSON del body con la etiqueta @RequestBody
        try {
            triatletaService.updateIdentificacion(id, body.get("identificacion"));//llama al service y extrae la identificacion del Map<>
            return ResponseEntity.ok("Identificacion actualizada"); //200 ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404 si no lo encuentra
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para actualizar el campo categoria
     * por edad del triatleta
     *
     * @param id
     * @param body
     * @return 200 si todo salio bien, 404 si no lo encontro
     */
    @RequestMapping(value = "/{id}/categoria-edad", method = RequestMethod.PATCH)//PATCH porque solo modificamos un campo, no todo el objeto
    public ResponseEntity<?> updateCategoria(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {//Extrae el id de la URL, 
        //toma el JSON del body, luego lo guarda en el map
        try {
            triatletaService.updateCategoria(id, body.get("categoriaEdad")); //delega a service para actualizar la categoria por edad extraida del Map<>
            return ResponseEntity.ok("Categoria actualizada"); //200 ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404, no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para actualizar el campo genero
     * del triatleta
     *
     * @param id
     * @param body
     * @return 200 si todo salio bien, 404 si no lo encontro
     */
    @RequestMapping(value = "/{id}/genero", method = RequestMethod.PATCH)
    public ResponseEntity<?> updateGenero(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        //toma el JSON del body, luego lo guarda en el Map<>
        try {
            triatletaService.updateGenero(id, body.get("genero")); //delega a service para actualizar el genero extraido del Map<>
            return ResponseEntity.ok("Genero actualizado"); //200 ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404, no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo DELETE para borrar un triatleta
     *
     * @param id
     * @return 404 si no lo encontro, 200 si todo funciono
     */
    @RequestMapping(value = "/eliminar/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteTriatleta(@PathVariable("id") Long id) {//extrae el id de la URL
        try {
            triatletaService.deleteTriatletaDTO(id); //delega al service para que lo borre por su id
            return ResponseEntity.ok("Triatleta Eliminado"); //200 ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());//404 si no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para registrar un triatleta en una
     * carrera especifica.
     *
     * @param idTriatleta
     * @param idCarrera
     * @return HTTP 200 si se registra, HTTP 400 si falla
     */
    @RequestMapping(value = "/{idTriatleta}/registrar-en-carrera/{idCarrera}", method = RequestMethod.PATCH)
    public ResponseEntity<?> registrarEnCarrera(@PathVariable("idTriatleta") Long idTriatleta, @PathVariable("idCarrera") Long idCarrera) {
        try {
            TriatletaResponse registradoEnCarrera = triatletaService.registrarEnCarrera(idTriatleta, idCarrera);
            return ResponseEntity.ok(registradoEnCarrera);
        } catch (RuntimeException e) {
            // Si la carrera no existe o falla el servicio, retornamos el error (400 Bad Request)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Define y expone el endpoint que consulta la carrera a la que esta
     * inscrito un triatleta.
     *
     * @param id
     * @return ResponseEntity
     */
    @RequestMapping(value = "/{id}/carrera", method = RequestMethod.GET)
    public ResponseEntity<?> consultarCarrera(@PathVariable("id") Long id) {
        try {
            TriatletaResponse consultar = triatletaService.consultarCarrera(id);
            return ResponseEntity.ok(consultar);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Define y expone el endpoint usado por el servicio carrera para consultar
     * todos los triatletas que esten inscritos en una carrera
     *
     * @param id
     * @return Response entity con una lista de responses
     */
    @RequestMapping(value = "/carrera/{id}", method = RequestMethod.GET)
    public ResponseEntity<List<TriatletaResponse>> getTriatletasByCarrera(@PathVariable("id") Long id) {
        List<TriatletaResponse> triatletasPorCarrera = triatletaService.getTriatletasByCarrera(id);//consulta todos los triatletas por su carrera delegando a service
        return ResponseEntity.ok(triatletasPorCarrera);//200ok
    }

    /**
     * Expone y define el endpoint tipo PATCH para quitar la carrera asociada a
     * un triatleta. Lo usa la API de carreras cuando elimina un triatleta de
     * una carrera especifica.
     *
     * @param idTriatleta id del triatleta que se va a quitar de la carrera
     * @return HTTP 200 si todo salio bien, HTTP 400 si falla
     */
    @RequestMapping(value = "/{idTriatleta}/eliminar-de-carrera", method = RequestMethod.PATCH)
    public ResponseEntity<?> eliminarDeCarrera(@PathVariable("idTriatleta") Long idTriatleta) {
        try {
            triatletaService.eliminarDeCarrera(idTriatleta);//delega a service para quitar la referencia externa
            return ResponseEntity.ok("El triatleta ha sido eliminado de la carrera.");//200 ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());//400 si falla
        }
    }
}
