/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Categoria.Controller;

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
import org.springframework.web.bind.annotation.RestController;
import pa.microservicios.Categoria.Model.CategoriaDTO;
import pa.microservicios.Categoria.Model.CategoriaResponse;
import pa.microservicios.Categoria.Service.CategoriaService;

/**
 *
 * @author Asus
 */
@RestController
@RequestMapping("/api/categorias")
public class CategoriaRestController {

    @Autowired
    CategoriaService categoriaService;

    /**
     * Define y expone el endpoint tipo POST para insertar una categoria
     *
     * @param categoriaDTO
     * @return HTTP 200 (exito) HTTP 400 si falla
     */
    @RequestMapping(value = "/crear", method = RequestMethod.POST)
    public ResponseEntity<?> createCategoria(@Valid @RequestBody CategoriaDTO categoriaDTO) {
        try {
            CategoriaResponse creada = categoriaService.crearCategoria(categoriaDTO);//delega a service para guardar
            return ResponseEntity.ok(creada);//200ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); //retorna 400 si algo falla
        }
    }

    /**
     * Define y expone el endpoint de tipo GET para consultar una categoria por su id
     * @param id
     * @return 200 si todo salio bien, 404 si no lo encontro
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getCategoriaById(@PathVariable("id") Long id) {
        try {
            CategoriaResponse consultada = categoriaService.getCategoriaById(id);
            return ResponseEntity.ok(consultada);//200ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404, no lo encontro
        }
    }

    /**
     * Define y expone el endpoint de tipo GET para consultar todas las categorias disponibles
     * @return 200 si todo salio bien
     */
    @RequestMapping(value = "/todas", method = RequestMethod.GET)
    public ResponseEntity<List<CategoriaResponse>> getAllCategorias() {
        List<CategoriaResponse> categorias = categoriaService.getAllCategorias();
        return ResponseEntity.ok(categorias);//200ok
    }

    /**
     * Expoen y define el endpoint tipo PATCH para actualizar el campo descripcion
     * de la categoria
     *
     * @param id
     * @param body
     * @return 200 si todo salio bien, 404 si no lo encontro
     */
    @RequestMapping(value = "/{id}/descripcion", method = RequestMethod.PATCH)
    public ResponseEntity<?> updateDescripcion(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        //toma el id de la url y guarda el campo del json a mapear en un map
        //delega a service para actualizar la categoria mandandole como parametro lo que extraiga de el campo categoria del Map<>
        try {
            categoriaService.updateDescripcion(id, body.get("descripcion"));
            return ResponseEntity.ok("Descripcion actualizada");//200ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404, no lo encontro
        }
    }

    /**
     * Expoen y define el endpoint tipo PATCH para actualizar el campo recomendacion
     * de la categoria
     *
     * @param id
     * @param body
     * @return 200 si todo salio bien, 404 si no lo encontro
     */
    @RequestMapping(value = "/{id}/recomendacion", method = RequestMethod.PATCH)
    public ResponseEntity<?> updateRecomendacion(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        //toma el id de la url y guarda el campo del json a mapear en un map
        //delega a service para actualizar la categoria mandandole como parametro lo que extraiga de el campo categoria del Map<>
        try {
            categoriaService.updateRecomendacion(id, body.get("recomendacion"));
            return ResponseEntity.ok("Recomendacion actualizada");//200ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); //404, no lo encontro
        }
    }

    /**
     * Expone y define el endpoint tipo DELETE para borrar una categoria
     *
     * @param id
     * @return 404 si no lo encontro, 200 si todo funciono
     */
    @RequestMapping(value = "/eliminar/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteCategoria(@PathVariable("id") Long id) {//extrae id de la url
        try {
            categoriaService.deleteCategoria(id); //delega al service para que lo borre por su id
            return ResponseEntity.ok("Categoria Eliminada"); //200 ok
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());//404 si no lo encontro
        }
    }
    
    @RequestMapping(value = "/consultar-carreras-por-categoria/{categoriaId}", method = RequestMethod.GET)
    public ResponseEntity<CategoriaResponse> getCarreras(@PathVariable("categoriaId") Long categoriaId){
        CategoriaResponse response = categoriaService.getCarreras(categoriaId);
        return ResponseEntity.ok(response);
    }
}
