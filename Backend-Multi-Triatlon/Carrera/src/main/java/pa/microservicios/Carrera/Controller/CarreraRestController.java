/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Controller;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import pa.microservicios.Carrera.Model.CarreraDTO;
import pa.microservicios.Carrera.Model.CarreraResponse;
import pa.microservicios.Carrera.Service.CarreraService;

/**
 *
 * @author Asus
 */
@RestController
@RequestMapping("/api-carrera")
public class CarreraRestController {

    @Autowired
    private CarreraService carreraService;

    /**
     * Define y expone el endpoint tipo POST para insertar una carrera
     *
     * @param carreraDTO
     * @return CarreraResponse
     */
    @RequestMapping(value = "/crear", method = RequestMethod.POST)//define endpoint y verbo http
    public ResponseEntity<?> crearCarrera(@Valid @RequestBody CarreraDTO carreraDTO) {//toma el json del body para convertirlo a objeto java
        //lo valida con Validation
        try {
            CarreraResponse creado = carreraService.crearCarrera(carreraDTO);//llamando a service para que realice las validaciones y la insercion
            return ResponseEntity.ok(creado);//200 OK 
        } catch (RuntimeException e) {//captura la excepcion
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());//400 si falla 
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para actualizar la ubicacion de
     * una carrera por su id
     *
     * @param id
     * @param body
     * @return HTTP 200 (exito) HTTP 404 si falla
     */
    @RequestMapping(value = "/{id}/ubicacion", method = RequestMethod.PATCH)//PATCH porque solo es un campo, no todo el objeto
    public ResponseEntity<?> updateUbicacion(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {//toma el id de la URL
        //toma el JSON del body @RequestBody y lo guarda en el Map<>
        try {
            carreraService.updateUbicacion(id, body.get("ubicacion")); //llama al service y extrae el nombre del Map<>
            return ResponseEntity.ok("Ubicacion actualizada"); //200 ok 
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404 si no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo PATCH para actualizar fecha de ejecucion
     * de una carrera por su id
     *
     * @param id
     * @param body
     * @return HTTP 200 (exito) HTTP 404 si falla
     */
    @RequestMapping(value = "/{id}/fecha-ejecucion", method = RequestMethod.PATCH)//PATCH porque solo es un campo, no todo el objeto
    public ResponseEntity<?> updateFechaEjecucion(@PathVariable("id") Long id, @RequestBody Map<String, LocalDateTime> body) {//toma el id de la URL
        //toma el JSON del body @RequestBody y lo guarda en el Map<>
        try {
            carreraService.updateFechaEjecucion(id, body.get("fechaEjecucion")); //llama al service y extrae el nombre del Map<>
            return ResponseEntity.ok("Fecha de Ejecucion actualizada"); //200 ok 
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404 si no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo GET para consultar una carrera por su id
     *
     * @param id
     * @return HTTP 200 si todo ok, o 404 si no lo encontro
     */
    @RequestMapping(value = "/consultar-id/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getCarreraById(@PathVariable("id") Long id) {
        try {
            CarreraResponse consultado = carreraService.getCarreraById(id);
            return ResponseEntity.ok(consultado);//200 OK
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404 si no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo DELETE para borrar una carrera
     *
     * @param id
     * @return 404 si no lo encontro, 200 si todo funciono
     */
    @RequestMapping(value = "/eliminar/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteCarrera(@PathVariable("id") Long id) {//extrae el id de la URL
        try {
            carreraService.deleteCarrera(id); //delega al service para que lo borre por su id
            return ResponseEntity.ok("Carrera Eliminada"); //200 ok
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());//404 si no lo encontro
        }
    }
}
