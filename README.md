# 🐾 AdoptMe! — Plataforma Dinámica de Adopción de Mascotas

## 👥 Integrantes del Grupo 44.1
* **Alejandro Celis Hernández Delgado**
* **Esther Viera Rivero**
* **Néstor Jesús Henríquez Medina**

---

## 📝 Descripción del Proyecto
AdoptMe! es una solución tecnológica diseñada para transformar y profesionalizar el proceso de adopción de perros y gatos. Nuestra plataforma nace de la necesidad de conectar de forma eficiente a protectoras con familias responsables, eliminando barreras burocráticas y centralizando la gestión en una experiencia digital transparente y segura.

El objetivo principal es garantizar que cada animal obtenga una segunda oportunidad en un hogar donde sea amado. Para ello, ofrecemos fichas técnicas exhaustivas (edad, carácter, raza, peso, tipo de pelo) y un sistema interactivo de gestión de citas presenciales.

---

## 🚀 Evolución: Del Prototipo a la Aplicación Dinámica (Sprint 2)
En esta fase, el proyecto ha dado el salto de un diseño estático a una **Arquitectura SPA (Single Page Application)** funcional.

### 1. Gestión de Datos y Carga Dinámica
* **Base de Datos JSON:** Implementación de un archivo `db.json` que centraliza la persistencia de datos (animales, usuarios, historias, FAQs).
* **Consumo Asíncrono:** Uso de la API Fetch para la obtención de recursos en tiempo real, permitiendo que la web se actualice sin recargar el navegador.
* **Motor de Templates:** Sistema modular que inyecta componentes HTML (`template_header.html`, `template_home.html`, etc.) según la navegación del usuario.

### 2. Responsive Web Design (RWD) Profesional
Hemos implementado una estrategia de adaptabilidad total basada en:
* **Tipografía y Espaciado Fluido:** Uso de la función `clamp()` de CSS para que los textos y márgenes escalen matemáticamente entre el tamaño mínimo (móvil) y el máximo (escritorio).
* **Layouts Híbridos:** Combinación de **CSS Grid** para estructuras complejas y **Flexbox** para componentes alineados.
* **Breakpoints Estratégicos:** Optimizaciones específicas para Móvil (<576px), Tablet (600px-900px) y Desktop (>1000px).

---

## 🔐 Roles, Permisos y Usuarios de Prueba
La plataforma adapta su interfaz y funcionalidades según el perfil autenticado:

### **Administrador (Gestión de Protectora)**
* **Capacidades:** Control total del catálogo (Alta/Baja), visualización de métricas de visitas por animal y gestión de la agenda.
* **Acceso:** `admin@adoptme.es` | **Password:** `Basket&22`

### **Usuario Registrado (Adoptante)**
* **Capacidades:** Acceso a la agenda interactiva para reserva de citas y gestión de sus propias reservas.
* **Acceso:** `usuario@adoptme.es` | **Password:** `Elmáscrema&45`

### **Visitante (Explorador)**
* **Capacidades:** Consulta del catálogo y lectura de contenido legal/informativo. Requiere registro para interactuar.

---

## 🛠️ Requisitos Técnicos e Implementación
### Validación de Formularios (Lado Cliente - HTML5)
Para garantizar la integridad de los datos, hemos implementado validaciones nativas en el formulario de acceso y registro:
* **Email:** Uso de `type="email"` con validación de estructura `@` y dominio.
* **Teléfono:** Atributo `pattern="[6789][0-9]{8}"` para asegurar números válidos en España.
* **Seguridad:** Requisito de longitud mínima de 8 caracteres (`minlength="8"`) con patrones de complejidad.
* **Campos Obligatorios:** Atributo `required` en todas las entradas críticas.

### Componentes de la Interfaz
| Página | Funcionalidad Clave | Estado Responsive |
| :--- | :--- | :--- |
| **Inicio** | Carrusel infinito con lógica de clones en JS. | Centrado fluido y altura adaptativa. |
| **Mascotas** | Filtro dinámico multidimensional (Raza, Pelo, Carácter). | Sidebar colapsable en móvil / Sticky en PC. |
| **Perfil** | Galería de imágenes y visualización de datos técnicos. | Layout apilado en móvil / Horizontal en PC. |
| **Citas** | Calendario interactivo con gestión de slots. | Grid elástico de días y horas. |

---

## 📂 Organización del Repositorio
* **`/html/templates/`**: Piezas modulares de la interfaz.
* **`/css/`**: Estilos CSS organizados por componentes y páginas.
* **`/js/index.js`**: El "cerebro" de la aplicación (Router, Fetch, Lógica de negocio).
* **`/data/db.json`**: Persistencia de datos local.
* **`/mockups/`**: Documentación visual del diseño adaptativo.

---
*© 2026 AdoptMe!!. Todos los derechos reservados.*