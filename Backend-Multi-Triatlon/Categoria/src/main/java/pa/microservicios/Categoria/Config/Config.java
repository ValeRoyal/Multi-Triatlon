/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pa.microservicios.Categoria.Config;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 *
 * @author Asus
 */
@Configuration
public class Config {

    @Value(value = "${webclient.url.carrera}")//EXTRAIDO DE:
    //https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/value-annotations.html
    
    private String urlCarrera;//extrae del application properties y lo guarda en esta variable global

    /**
     * Bean de configuracion del model mapper
     *
     * @return
     */
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    /**
     * Bean de configuracion para el Cliente de comunicacion entre apis en este
     * caso WebClient como este cliente solo se comunica con carrera usamos WebClient mas no el WebClient.Builder
     *
     * @return
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(urlCarrera)//url del proyecto de Carrera, viene del properties Open Closed Principle
                .build();
    }

}
