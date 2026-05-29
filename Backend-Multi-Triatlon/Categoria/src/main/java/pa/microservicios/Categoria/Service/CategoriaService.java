/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Categoria.Service;

import java.util.List;
import java.util.Optional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
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
    
    
    public CategoriaResponse crearCategoria(CategoriaDTO categoriaDTO){
        if(categoriaRepository.findByNombreCategoria(categoriaDTO.getNombreCategoria()).isPresent()){
            throw new RuntimeException("Ya existe una categoria con el nombre: " + categoriaDTO.getNombreCategoria());
        }
        CategoriaDTO guardada = categoriaRepository.save(categoriaDTO);
        
        return mapper.map(guardada, CategoriaResponse.class);
    }
    
    public void updateDescripcion(Long id, String nuevaUbicacion){
        int filas = categoriaRepository.updateDescripcion(id, nuevaUbicacion);
        if(filas == 0){
            throw new RuntimeException("No existe categoria con id: "+ id);
        }
    }
    
    public void updateRecomendacion(Long id, String nuevaRecomendacion){
        int filas = categoriaRepository.updateRecomendacion(id, nuevaRecomendacion);
        if(filas == 0){
            throw new RuntimeException("No existe categoria con id: "+ id);
        }
    }
    
    public CategoriaResponse getCategoriaById(Long id){
        Optional<CategoriaDTO> optionalCategoria = categoriaRepository.findById(id);
        CategoriaDTO dto = optionalCategoria.get();
        return mapper.map(dto, CategoriaResponse.class);
    }
    
    public List<CategoriaResponse> getAllCategoriasById(){
        List<CategoriaDTO>  dtos = categoriaRepository.findAll();
        List<CategoriaResponse> responses = null;
        return null;
    }
}
