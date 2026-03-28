# Nombre del proyecto

### AdoptMe! — Prototipo Web (Adopción de Mascotas)

# Integrantes del grupo 44.1:
* Alejandro Celis Hernández Delgado
* Esther Viera Rivero
* Néstor Jesús Henríquez Medina

Este repositorio contiene un **prototipo estático** --de momento-- del sitio web **AdoptMe!**, un refugio de adopción donde el usuario puede **explorar mascotas** (perros y gatos) y **solicitar una cita presencial** para conocerlas y poder adoptarlas, así como entregar en adopción.

## Descripción del proyecto:

AdoptMe es una plataforma web diseñada para transformar el proceso de adopción de perros y gatos en una experiencia sencilla, transparente y segura.

Nuestra web centraliza la información de mascotas en espera de un hogar, ofreciendo fichas detalladas (edad, carácter, raza, peso y tipo de pelo) y un sistema de gestión de visitas y trámites muy cómoda.​

El objetivo principal es que cada peludito obtenga un nuevo hogar donde sea amado. Para lograrlo, toda nuestra información está habilitada en nuestra página y para reservar citas de una forma más directa mediante nuestra agenda de citas.

## Listado de Requisitos:

### Tipos de Usuarios y Permisos:
* **Administrador (Protectora):** Control total de la plataforma. Gestión del catálogo (alta, baja y modificación de mascotas), administración de la agenda de citas, moderación de reseñas y gestión de solicitudes de adopción.
* **Usuario Registrado (Adoptante):** Acceso a funciones interactivas como la reserva de citas mediante calendario, guardado de mascotas en "favoritos", seguimiento de sus solicitudes de adopción y publicación de historias de éxito.
* **Usuario No Registrado (Visitante):** Navegación libre por el catálogo de mascotas, consulta de información sobre el refugio (FAQs, Quiénes somos) y acceso al formulario de registro para iniciar trámites.

### Funcionalidades:

#### 1. Catálogo y Filtros Avanzados:
Para asegurar un emparejamiento perfecto entre el animal y la familia, el sistema permite filtrar por:
* **Edad:** Categorización por etapas (Cachorro, Joven, Adulto, Senior).
* **Especie y Raza:** Listados desplegables dinámicos para perros y gatos.
* **Peso:** Filtrado por rangos de kilogramos para adaptarse al espacio del hogar.
* **Comportamiento:** Escala de nivel de actividad y sociabilidad (1–5 estrellas).
* **Tipo de pelo:** Clasificación técnica (corto, largo, rizado, sin pelo).

#### 2. Ficha del "Peludito":
Cada animal cuenta con una página detallada que incluye:
* **Galería Visual:** Imágenes de alta calidad del animal.
* **Estado en Tiempo Real:** Indicadores visuales de "Disponible", "Reservado" o "Adoptado".
* **Información Técnica:** Detalles de salud, carácter y necesidades especiales.

#### 3. Herramientas de Ayuda y Comunidad:
* **Reporte de Rescate (HU-15):** Formulario para reportar casos de animales abandonados o maltratados, permitiendo adjuntar ubicación y descripción del estado.
* **Consulta de Chip (HU-17/18):** Sistema de mediación que permite verificar si un animal encontrado tiene dueño sin exponer datos privados de terceros.
* **Módulo de Reseñas:** Sección de transparencia donde los usuarios comparten su experiencia y fotos de sus nuevas mascotas.

#### 4. Gestión de Citas:
* **Agenda Interactiva:** Sistema de reserva de visitas presenciales para conocer a los animales, integrado con un panel de gestión para la protectora.

### Requisitos No Funcionales:
* **Rendimiento:** Optimización de carga (menos de 2 segundos) mediante el uso de imágenes comprimidas y código modular.
* **Usabilidad:** Interfaz limpia con botones grandes y navegación intuitiva para minimizar la curva de aprendizaje del usuario.

### Implementación Técnica:
* **Arquitectura Modular:** Uso de **templates reutilizables** (Header, Footer, Card, Main) para evitar la duplicidad de código.
* **Mapeo de Navegación:** Correspondencia exacta entre los Mockups de Figma y los templates HTML/JS desarrollados.
* **Control de Versiones:** Uso de **Git** para la gestión del código fuente y colaboración del equipo.

## Archivo del pdf de los mockups y storyboard:
### Mockups: 
#### Los mockups están ubicados dentro del proyecto en la carpeta mockups(~/mockups), los nombres son los siguientes:
* abouts_us.png
* adoption_list.png
* contact_us.png
* faq.png
* home.png
* legal.png
* login.png
* pet_profile.png
* schedule.png
* stories.png

### Storyboard:
#### El storyboard está ubicado dentro del proyecto en la carpeta storyboard(~/storyboard).
## Listado de páginas html del proyecto:
#### Las páginas html están ubicadas dentro de la carpeta html (~/html), y sus relaciones son las siguientes: 
* abouts_us.html &rarr; abouts_us.png 
* adoption_list.html &rarr; adoption_list.png
* contact_us.html &rarr; contact_us.png
* faq.html &rarr; faq.png
* home.html &rarr; home.png
* legal.html &rarr; legal.png
* login.html &rarr; login.png
* pet_profile.html &rarr; pet_profile.png
* schedule.html &rarr; schedule.png
* stories.html &rarr; stories.png

## Listado de archivos templates:
#### Los templates están ubicados en la carpeta templates, dentro de la carpeta html (~/html/templates). Los nombres son los siguientes:
* template_about_us.html
* template_adoption_item.html
* template_adoption_list.html
* template_card.html
*  template_contact_us.html
*  template_faq.html
*  template_footer.html
*  template_header.html
*  template_home.html
*  template_legal.html
*  template_login.html
*  template_pet.html
*  template_schedule.html
*  template_stories.html

## Nombre y ubicacion de los mockups para móvil y tablet 

## Página de inicio 
La página de inicio de la aplicación web es `index.html`, que se encuentra en: /html/templates/index.html.

 Es el punto de entrada principal del proyecto **"AdoptMe!!"**. Al cargar el archivo,  carga automáticamente la vista desde `template_home.html`.

Desde este archivo central se gestiona:
* La carga dinámica del encabezado (`template_header.html`) y el pie de página (`template_footer.html`).
* La navegación entre las distintas secciones (Mascotas, Nosotros, Login, etc.).
* La persistencia de la sesión del usuario a través de `localStorage`.
## Aspectos responsive implementados 

## Carga de templates y contenido JSON

| Página / Sección | Template Inyectado | Datos desde `db.json` | Función encargada |
| :--- | :--- | :--- | :--- |
| **Cabecera** | `template_header.html` | Seccion `header` | `renderHeader` |
| **Pie de página** | `template_footer.html` | Sección `footer` | `renderFooter` |
| **Inicio** | `template_home.html` | Sección `home` | `renderHome` |
| **Mascotas** | `template_adoption_list.html` | Sección `animals` | `renderAdoptionList` |
| **Perfil Mascota** | `template_pet_profile.html` | Sección `animals` | `renderPetProfile` |
| **Nosotros** | `template_about_us.html` | Sección `about_us` | `renderAboutUs` |
| **Historias** | `template_stories.html` | Sección `stories` | `renderStories` |
| **FAQ** | `template_faq.html` | Sección `faq` | `renderFaq` |
| **Legal** | `template_legal.html` | Sección `legal` | `renderLegal` |
| **Contacto** | `template_contact_us.html` | Sección `contact_us` | `renderContactUs` |
| **Calendario** | `template_schedule.html` | Sección `schedule` | `renderSchedule` |
| **Acceso** | `template_login.html` | Sección `users` | `initLogin` |

### Detalles de la implementación técnica:

* **Carga de datos JSON:** Se utiliza la función asíncrona `fetchDB()` para recuperar el archivo `../data/db.json`. Este archivo centraliza toda la información, desde los enlaces de redes sociales hasta la base de datos de animales y usuarios.
* **Carga de templates:** La función `loadTemplate()` utiliza `fetch` para obtener el código HTML de los archivos en `../html/templates/`. Una vez obtenida la plantilla, se inserta en el DOM y se procede a su renderizado con los datos del JSON.
* **Ubicación del contenido:** Los datos se encuentran en un servidor local simulado a través del archivo `db.json`.


## Validaciones HTML implementadas, de los formularios
Para el correcto funcionamiento de la aplicación, se han implementado validaciones nativas en el formulario de acceso y registro , y por otro lado támbien en el de añadir mascotas:

### Formulario de Acceso y Registro (`template_login.html`)
* **Nombre de usuario:** Definido como obligatorio mediante el atributo `required`.
* **Correo electrónico:** Utiliza `type="email"` para validar el formato de dirección y el atributo `required` para evitar campos vacíos.
* **Teléfono:** Implementa `type="tel"` y una expresión regular con `pattern="[6789][0-9]{8}"`, que obliga a introducir 9 dígitos comenzando por 6, 7, 8 o 9.
* **Contraseña:** Marcada como obligatoria (`required`) con una restricción de longitud mínima de 8 caracteres mediante `minlength="8"`, title que actúa como guía visual informando los requisitos de mayúsculas, números y símbolos.

### Formulario de Administración (`template_adoption_list.html`)
* **Campos Obligatorios:** Los campos de **Nombre**, **Género**, **Raza**, **Peso**, **Tipo de pelo** y **Carácter** cuentan con el atributo `required` para impedir el envío de formularios incompletos.
* **Edad:** Se utiliza `type="number"` junto con los atributos `min="0"` y `max="30"`, limitando el rango a una edad lógica para los animales del refugio.
* **Gestión de Imágenes:** El input de archivos emplea `accept="image/*"` para filtrar y permitir únicamente formatos de imagen, además del atributo `multiple` para habilitar la carga de una galería completa de fotos.
* **Descripción:** El área de texto (`textarea`) es obligatoria mediante el atributo `required`, garantizando que cada mascota cuente con una descripción detallada para los adoptantes.


## Usuario y contraseña de prueba
* **Usuario:**  `[ernestina@adoptme.es]` 
* **Contraseña:** `[Ernestina]`


## Otros Aspectos a Considerar
* **Tecnologías:** HTML5, CSS3 y JavaScript.
* **Modularidad:** Uso de componentes reutilizables para optimizar el mantenimiento del código.
* **Diseño Estatico:** En esta fase (Sprint 1), nuestro prototipo no implementa ninguna funcionalidad dinámica, por lo que se limita a la visualización de las diversas páginas que conforman el sitio web en el navegador de internet. Así mismo, el diseño no está pensado para ser adaptable al dispositivo desde el que se quiera visualizar (no es responsive), aunque en sucesivas versiones se llevará a cabo su adaptabilidad a diversos dispositivos.
* **Control de Versiones:** Uso de Git para la coordinación del equipo y gestión de ramas.
