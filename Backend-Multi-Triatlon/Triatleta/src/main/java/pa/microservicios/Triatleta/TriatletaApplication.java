package pa.microservicios.Triatleta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class TriatletaApplication {

    public static void main(String[] args) {
        SpringApplication.run(TriatletaApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")//todos los endpoints
                        .allowedOrigins("http://localhost:8383")//url del front
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")//solo estos verebos
                        .allowedHeaders("*")//cualquier tipo de header
                        .maxAge(3600);//maximo tiempo de respuesta 3,6 segundos
            }
        };
    }

}
