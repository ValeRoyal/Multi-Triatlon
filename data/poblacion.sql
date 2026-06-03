USE multitriatlonpacategoria;

INSERT INTO categorias (id, descripcion, nombre_categoria, recomendacion, tipo_categoria) VALUES
(1,  'Distancia más corta: 400m natación + 10km ciclismo + 2.5km carrera a pie.',
     'Súper Sprint',
     'Ideal para principiantes, jóvenes y eventos rápidos de velocidad. Sin experiencia previa requerida.',
     'Distancia'),

(2,  'Distancia corta: 750m natación + 20km ciclismo + 5km carrera a pie.',
     'Sprint',
     'Muy popular y accesible para casi cualquier nivel físico. Recomendada como primera carrera oficial.',
     'Distancia'),

(3,  'Distancia olímpica estándar: 1.5km natación + 40km ciclismo + 10km carrera a pie.',
     'Olímpica',
     'Es la distancia oficial en los Juegos Olímpicos. Exige un equilibrio técnico alto en las tres disciplinas.',
     'Distancia'),

(4,  'Media distancia (Ironman 70.3): 1.9km natación + 90km ciclismo + 21.1km carrera a pie.',
     'Media Distancia',
     'Requiere alta resistencia aeróbica y control estricto de la nutrición durante la carrera.',
     'Distancia'),

(5,  'Larga distancia (Ironman): 3.8km natación + 180km ciclismo + 42.2km carrera a pie.',
     'Larga Distancia',
     'La prueba definitiva de resistencia. Exige gran planificación nutricional, mental y meses de preparación.',
     'Distancia'),

(6,  'Ultraman: 10km natación + 415km ciclismo + 85km carrera a pie, distribuidos en 3 días.',
     'Ultraman',
     'Solo para atletas de élite con años de experiencia. Requiere equipo de apoyo y planificación logística exhaustiva.',
     'Distancia'),

(7,  'Categoría escolar: niños de 7 años. Distancias mínimas adaptadas a la edad.',
     'Pre-benjamín',
     'Supervisión constante de adultos y entrenadores. Actividad de carácter recreativo.',
     'Edad'),

(8,  'Categoría escolar: niños de 8 a 9 años con distancias recreativas.',
     'Benjamín',
     'Fomentar la participación y el disfrute del deporte por encima del resultado.',
     'Edad'),

(9,  'Categoría escolar: niños de 10 a 11 años.',
     'Alevín',
     'Introducir técnica básica en natación y ciclismo. Priorizar la seguridad en ruta.',
     'Edad'),

(10, 'Categoría escolar: jóvenes de 12 a 13 años.',
     'Infantil',
     'Comenzar a trabajar la continuidad entre disciplinas y las transiciones T1 y T2.',
     'Edad'),

(11, 'Categoría juvenil: deportistas de 14 a 15 años. Compiten en distancia Sprint.',
     'Cadete',
     'Distancia máxima permitida: Sprint. Acompañamiento médico y nutricional recomendado.',
     'Edad'),

(12, 'Categoría juvenil: deportistas de 16 a 17 años.',
     'Juvenil',
     'Pueden competir en distancias Sprint. Iniciar plan de entrenamiento periodizado.',
     'Edad'),

(13, 'Categoría juvenil: deportistas de 18 a 19 años. Compiten en Sprint y Olímpica.',
     'Júnior',
     'Distancias permitidas: Sprint y Estándar/Olímpica. Chequeo médico anual obligatorio.',
     'Edad'),

(14, 'Categoría de desarrollo: atletas de 20 a 23 años.',
     'Sub-23',
     'Etapa de consolidación técnica y táctica. Ideal para competir en circuitos regionales.',
     'Edad'),

(15, 'Categoría absoluta masculina y femenina: atletas de 24 a 39 años en plena capacidad competitiva.',
     'Absoluta',
     'Categoría principal de competencia. Se recomienda periodización anual y seguimiento de rendimiento.',
     'Edad'),

(16, 'Categoría veteranos: atletas de 40 a 49 años.',
     'Veterano 1',
     'Realizar chequeo cardiovascular obligatorio antes de cada temporada. Hidratación reforzada.',
     'Edad'),

(17, 'Categoría veteranos: atletas de 50 a 59 años.',
     'Veterano 2',
     'Ajustar la intensidad de entrenamiento según indicación médica. Calentamiento extendido de 20 minutos.',
     'Edad'),

(18, 'Categoría veteranos: atletas de 60 años en adelante.',
     'Veterano 3',
     'Priorizar la salud sobre el rendimiento. Participación con aval médico vigente y obligatorio.',
     'Edad'),

(19, 'Triatlón cross: natación en aguas abiertas + ciclismo de montaña (MTB) + trail running.',
     'Cross',
     'Combina tres entornos naturales exigentes. Requiere dominio técnico del MTB y trail. Formato estándar: 1km natación + BTT + 6km trail.',
     'Modalidad'),

(20, 'Triatlón de invierno: carrera a pie + ciclismo (o mountain bike) + esquí de fondo.',
     'Invierno',
     'Requiere equipamiento específico para nieve. No apto para climas tropicales sin infraestructura adecuada.',
     'Modalidad'),

(21, 'Paratriatlón: modalidad adaptada para atletas con discapacidades físicas o visuales.',
     'Paratriatlón',
     'Se divide en subclases funcionales según la limitación del atleta (handbike, guía, etc.). Consultar reglamento ITU.',
     'Modalidad');


USE multitriatlonpacarrera;

INSERT INTO carreras (id, categoria_id, fecha_ejecucion, nivel_dificultad, nombre_carrera, para_quien, ubicacion) VALUES
(1, 1, '2025-03-15 08:00:00.000000', 'Principiante',
 'Triatlon Súper Sprint Bogotá 2025',
 'Principiantes, jóvenes y atletas escolares que deseen su primera experiencia en triatlón.',
 'Embalse del Muña, Sibaté, Cundinamarca'),

(2, 2, '2025-04-20 07:00:00.000000', 'Principiante',
 'Triatlon Sprint Medellín 2025',
 'Atletas de cualquier nivel que busquen una carrera rápida y accesible en distancia corta.',
 'Embalse Piedras Blancas, Medellín, Antioquia'),

(3, 2, '2025-06-08 08:00:00.000000', 'Principiante',
 'Triatlon Sprint Júnior Tunja 2025',
 'Jóvenes de 18 a 19 años (categoría Júnior) en su distancia reglamentaria Sprint.',
 'Complejo Acuático, Tunja, Boyacá'),

(4, 3, '2025-05-10 06:30:00.000000', 'Intermedio',
 'Triatlon Olímpico Cartagena 2025',
 'Atletas con experiencia en distancia Sprint que buscan el reto de la distancia oficial olímpica.',
 'Playa de Bocagrande, Cartagena, Bolívar'),

(5, 3, '2025-10-29 07:00:00.000000', 'Intermedio',
 'Triatlon Olímpico Cali 2025',
 'Atletas de nivel intermedio que buscan una carrera en ambiente festivo y de distancia estándar.',
 'Lago Calima, Darién, Valle del Cauca'),

(6, 4, '2025-05-31 05:30:00.000000', 'Alto',
 'Half Ironman Bucaramanga 2025',
 'Atletas con alta resistencia aeróbica y control nutricional. Mínimo 1 año de experiencia en triatlón.',
 'Embalse Tona, Bucaramanga, Santander'),

(7, 5, '2025-07-06 05:00:00.000000', 'Muy Alto',
 'Ironman Manizales 2025',
 'Triatletas experimentados que buscan batir su marca personal en una prueba de máxima exigencia.',
 'Lago Esmeralda, Manizales, Caldas'),

(8, 19, '2025-08-02 06:00:00.000000', 'Alto',
 'Triatlon Cross Pasto 2025',
 'Atletas con dominio de MTB y trail running que prefieren el terreno de montaña sobre la carretera.',
 'Laguna de la Cocha, Pasto, Nariño');


USE multitriatlonpatriatleta;

INSERT INTO triatleta (id, activo, correo, fecha_nacimiento, genero, identificacion, nombre, carrera_id, categoria_edad, especialidad, modalidad_cross, url_foto) VALUES
(1,  b'1', 'carlos.restrepo@gmail.com',    '1990-04-12', 'Masculino',  '1020345678', 'Carlos Restrepo',    4, 'Absoluta',   'Olímpica',        b'0', 'https://randomuser.me/api/portraits/men/1.jpg'),
(2,  b'1', 'laura.jimenez@hotmail.com',    '1995-08-23', 'Femenino',   '1030456789', 'Laura Jiménez',      2, 'Absoluta',   'Sprint',          b'0', 'https://randomuser.me/api/portraits/women/2.jpg'),
(3,  b'1', 'andres.morales@yahoo.com',     '1983-01-07', 'Masculino',  '79456123',   'Andrés Morales',     7, 'Veterano 1', 'Larga Distancia', b'0', 'https://randomuser.me/api/portraits/men/3.jpg'),
(4,  b'1', 'sofia.vargas@gmail.com',       '2006-11-15', 'Femenino',   '1116789012', 'Sofía Vargas',       3, 'Cadete',     'Sprint',          b'0', 'https://randomuser.me/api/portraits/women/4.jpg'),
(5,  b'1', 'miguel.torres@gmail.com',      '1965-03-30', 'Masculino',  '19234567',   'Miguel Torres',      NULL, 'Veterano 3', 'Sprint',        b'0', 'https://randomuser.me/api/portraits/men/5.jpg'),
(6,  b'1', 'valentina.rios@outlook.com',   '1998-07-19', 'Femenino',   '1045678901', 'Valentina Ríos',     8, 'Absoluta',   'Sprint',          b'1', 'https://randomuser.me/api/portraits/women/6.jpg'),
(7,  b'1', 'juan.castillo@gmail.com',      '1978-12-02', 'Masculino',  '80345678',   'Juan Castillo',      6, 'Veterano 1', 'Media Distancia', b'0', 'https://randomuser.me/api/portraits/men/7.jpg'),
(8,  b'1', 'daniela.mendez@gmail.com',     '1993-05-25', 'Femenino',   '1055678901', 'Daniela Méndez',     5, 'Absoluta',   'Olímpica',        b'0', 'https://randomuser.me/api/portraits/women/8.jpg'),
(9,  b'1', 'santiago.lopez@yahoo.com',     '2007-09-08', 'Masculino',  '1117890123', 'Santiago López',     3, 'Juvenil',    'Sprint',          b'0', 'https://randomuser.me/api/portraits/men/9.jpg'),
(10, b'1', 'natalia.herrera@gmail.com',    '1975-06-14', 'Femenino',   '52678901',   'Natalia Herrera',    NULL, 'Veterano 1', 'Olímpica',      b'1', 'https://randomuser.me/api/portraits/women/10.jpg'),
(11, b'1', 'pablo.garcia@gmail.com',       '2002-02-17', 'Masculino',  '1025678901', 'Pablo García',       4, 'Sub-23',     'Olímpica',        b'0', 'https://randomuser.me/api/portraits/men/11.jpg'),
(12, b'1', 'camila.diaz@hotmail.com',      '2004-10-28', 'Femenino',   '43789012',   'Camila Díaz',        2, 'Júnior',     'Sprint',          b'0', 'https://randomuser.me/api/portraits/women/12.jpg'),
(13, b'0', 'esteban.ruiz@gmail.com',       '1991-04-03', 'Masculino',  '1118901234', 'Esteban Ruiz',       NULL, 'Absoluta',  'Sprint',         b'1', 'https://randomuser.me/api/portraits/men/13.jpg'),
(14, b'1', 'isabela.sanchez@outlook.com',  '1955-08-11', 'Femenino',   '41234567',   'Isabela Sánchez',    NULL, 'Veterano 3', 'Súper Sprint',  b'0', 'https://randomuser.me/api/portraits/women/14.jpg'),
(15, b'1', 'nicolas.perez@gmail.com',      '2005-12-22', 'Masculino',  '1035678902', 'Nicolás Pérez',      1, 'Cadete',     'Súper Sprint',    b'0', 'https://randomuser.me/api/portraits/men/15.jpg');