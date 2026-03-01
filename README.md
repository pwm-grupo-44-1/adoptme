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


## Otros Aspectos a Considerar
* **Tecnologías:** HTML5, CSS3 y JavaScript.
* **Modularidad:** Uso de componentes reutilizables para optimizar el mantenimiento del código.
* **Diseño Desktop:** En esta fase (Sprint 1), el prototipo está **optimizado exclusivamente para visualización en escritorio** (No responsive).
* **Control de Versiones:** Uso de Git para la coordinación del equipo y gestión de ramas.
