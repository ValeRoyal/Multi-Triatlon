USE multitriatlonpacategoria;

INSERT INTO categorias (id, descripcion, nombre_categoria, recomendacion, tipo_categoria) VALUES
(1, 'Categoría para atletas menores de 18 años con recorridos cortos adaptados.', 'Junior', 'Se recomienda acompañamiento de un entrenador certificado y supervisión médica previa.', 'Edad'),
(2, 'Categoría estándar para adultos entre 18 y 39 años en plena capacidad competitiva.', 'Open', 'Mantener un plan de entrenamiento de al menos 3 meses antes del evento.', 'Edad'),
(3, 'Categoría para veteranos entre 40 y 49 años con distancias ajustadas.', 'Master A', 'Realizar chequeo cardiovascular obligatorio antes de participar.', 'Edad'),
(4, 'Categoría para atletas mayores de 50 años con recorridos de menor exigencia.', 'Master B', 'Se sugiere hidratación reforzada y calentamiento extendido de 20 minutos.', 'Edad'),
(5, 'Modalidad para equipos de tres personas donde cada integrante realiza una disciplina.', 'Relevos', 'Coordinar con anticipación la logística de transición entre disciplinas.', 'Modalidad'),
(6, 'Prueba de distancia corta ideal para principiantes: 750m natación, 20km ciclismo, 5km carrera.', 'Sprint', 'Ideal para primeras participaciones. Asegúrese de dominar las tres disciplinas.', 'Distancia'),
(7, 'Distancia olímpica estándar: 1.5km natación, 40km ciclismo, 10km carrera a pie.', 'Olímpico', 'Se requiere experiencia previa en al menos dos triatlones Sprint.', 'Distancia'),
(8, 'Media distancia: 1.9km natación, 90km ciclismo, 21km carrera. Alto nivel de exigencia.', 'Half Ironman', 'Planificación nutricional durante la prueba es indispensable.', 'Distancia');

USE multitriatlonpacarrera;

INSERT INTO carreras (id, categoria_id, fecha_ejecucion, nivel_dificultad, nombre_carrera, para_quien, ubicacion) VALUES
(1, 6, '2025-03-15 07:00:00.000000', 'Principiante', 'Triatlon Sprint Bogotá 2025', 'Atletas principiantes mayores de 16 años que deseen iniciar en el mundo del triatlón.', 'Embalse del Muña, Sibaté, Cundinamarca'),
(2, 7, '2025-04-20 06:30:00.000000', 'Intermedio', 'Triatlon Olímpico Medellín 2025', 'Deportistas con experiencia previa en triatlón que buscan un reto de distancia estándar.', 'Embalse Piedras Blancas, Medellín, Antioquia'),
(3, 8, '2025-05-10 05:00:00.000000', 'Alto', 'Half Ironman Cartagena 2025', 'Atletas de alto rendimiento con mínimo dos años de experiencia en triatlón.', 'Playa de Bocagrande, Cartagena, Bolívar'),
(4, 1, '2025-06-08 08:00:00.000000', 'Principiante', 'Triatlon Junior Tunja 2025', 'Jóvenes deportistas menores de 18 años que compiten en su categoría de edad.', 'Lago La Cocha, Tunja, Boyacá'),
(5, 5, '2025-07-19 07:30:00.000000', 'Intermedio', 'Gran Triatlon de Relevos Cali 2025', 'Equipos de tres personas donde cada integrante realiza una disciplina completa.', 'Lago Calima, Darién, Valle del Cauca'),
(6, 2, '2025-08-23 06:00:00.000000', 'Intermedio', 'Triatlon Open Bucaramanga 2025', 'Adultos entre 18 y 39 años en categoría abierta sin restricciones de nivel.', 'Río Chicamocha, Cañón del Chicamocha, Santander'),
(7, 3, '2025-09-14 07:00:00.000000', 'Intermedio', 'Triatlon Master A Manizales 2025', 'Competidores entre 40 y 49 años con experiencia demostrable en pruebas anteriores.', 'Lago Esmeralda, Manizales, Caldas'),
(8, 4, '2025-10-05 08:30:00.000000', 'Básico', 'Triatlon Master B Pasto 2025', 'Atletas mayores de 50 años con condición física adecuada y aval médico vigente.', 'Laguna de la Cocha, Pasto, Nariño');


USE multitriatlonpatriatleta;

INSERT INTO triatleta (id, activo, correo, fecha_nacimiento, genero, identificacion, nombre, carrera_id, categoria_edad, especialidad, modalidad_cross, url_foto) VALUES
(1,  b'1', 'carlos.restrepo@gmail.com',    '1990-04-12', 'Masculino',  '1020345678', 'Carlos Restrepo',    2, 'Open',     'Ciclismo',  b'0', 'https://randomuser.me/api/portraits/men/1.jpg'),
(2,  b'1', 'laura.jimenez@hotmail.com',    '1995-08-23', 'Femenino',   '1030456789', 'Laura Jiménez',      1, 'Open',     'Natación',  b'0', 'https://randomuser.me/api/portraits/women/2.jpg'),
(3,  b'1', 'andres.morales@yahoo.com',     '1985-01-07', 'Masculino',  '79456123',   'Andrés Morales',     3, 'Master A', 'Carrera',   b'1', 'https://randomuser.me/api/portraits/men/3.jpg'),
(4,  b'0', 'sofia.vargas@gmail.com',       '2006-11-15', 'Femenino',   '1116789012', 'Sofía Vargas',       4, 'Junior',   'Ciclismo',  b'0', 'https://randomuser.me/api/portraits/women/4.jpg'),
(5,  b'1', 'miguel.torres@gmail.com',      '1972-03-30', 'Masculino',  '19234567',   'Miguel Torres',      8, 'Master B', 'Natación',  b'0', 'https://randomuser.me/api/portraits/men/5.jpg'),
(6,  b'1', 'valentina.rios@outlook.com',   '1998-07-19', 'Femenino',   '1045678901', 'Valentina Ríos',     6, 'Open',     'Carrera',   b'1', 'https://randomuser.me/api/portraits/women/6.jpg'),
(7,  b'1', 'juan.castillo@gmail.com',      '1983-12-02', 'Masculino',  '80345678',   'Juan Castillo',      7, 'Master A', 'Ciclismo',  b'0', 'https://randomuser.me/api/portraits/men/7.jpg'),
(8,  b'1', 'daniela.mendez@gmail.com',     '1993-05-25', 'Femenino',   '1055678901', 'Daniela Méndez',     2, 'Open',     'Natación',  b'1', 'https://randomuser.me/api/portraits/women/8.jpg'),
(9,  b'0', 'santiago.lopez@yahoo.com',     '2007-09-08', 'Masculino',  '1117890123', 'Santiago López',     4, 'Junior',   'Carrera',   b'0', 'https://randomuser.me/api/portraits/men/9.jpg'),
(10, b'1', 'natalia.herrera@gmail.com',    '1978-06-14', 'Femenino',   '52678901',   'Natalia Herrera',    5, 'Master A', 'Ciclismo',  b'0', 'https://randomuser.me/api/portraits/women/10.jpg'),
(11, b'1', 'pablo.garcia@gmail.com',       '1991-02-17', 'Masculino',  '1025678901', 'Pablo García',       3, 'Open',     'Natación',  b'1', 'https://randomuser.me/api/portraits/men/11.jpg'),
(12, b'1', 'camila.diaz@hotmail.com',      '1988-10-28', 'Femenino',   '43789012',   'Camila Díaz',        7, 'Master A', 'Carrera',   b'0', 'https://randomuser.me/api/portraits/women/12.jpg'),
(13, b'1', 'esteban.ruiz@gmail.com',       '2005-04-03', 'Masculino',  '1118901234', 'Esteban Ruiz',       4, 'Junior',   'Natación',  b'0', 'https://randomuser.me/api/portraits/men/13.jpg'),
(14, b'1', 'isabela.sanchez@outlook.com',  '1970-08-11', 'Femenino',   '41234567',   'Isabela Sánchez',    8, 'Master B', 'Ciclismo',  b'1', 'https://randomuser.me/api/portraits/women/14.jpg'),
(15, b'1', 'nicolas.perez@gmail.com',      '1996-12-22', 'Masculino',  '1035678902', 'Nicolás Pérez',      6, 'Open',     'Carrera',   b'0', 'https://randomuser.me/api/portraits/men/15.jpg');