/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
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
}
