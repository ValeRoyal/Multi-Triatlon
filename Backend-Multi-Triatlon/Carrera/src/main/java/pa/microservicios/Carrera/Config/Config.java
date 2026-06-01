/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Carrera.Config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 *
 * @author Asus
 */
@Configuration
public class Config {

    /**
     * Bean de configuracion para el model mapper
     *
     * @return
     */
    @Bean
    public ModelMapper modelMapperBean() {
        return new ModelMapper();
    }

    /**
     * Bean de configuracion para el Cliente de comunicacion entre apis en este
     * caso WebClient
     *
     * @return
     */
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

}
