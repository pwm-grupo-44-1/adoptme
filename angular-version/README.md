# 🐾 AdoptMe! — Plataforma Dinámica de Adopción de Mascotas (Versión Angular)

## 👥 Integrantes del Grupo 44.1
* **Alejandro Celis Hernández Delgado**
* **Esther Viera Rivero**
* **Néstor Jesús Henríquez Medina**

---

## 📝 Descripción del Proyecto
AdoptMe! es una solución tecnológica diseñada para transformar y profesionalizar el proceso de adopción de perros y gatos. Nuestra plataforma nace de la necesidad de conectar de forma eficiente a protectoras con familias responsables, eliminando barreras burocráticas y centralizando la gestión en una experiencia digital transparente y segura.

---

## 🏗️ Estructura del Código (Angular)

El proyecto adopta una arquitectura basada en Componentes Standalone, organizando el código en dominios de responsabilidad diferenciados:

- `AppComponent` (`src/app/app.ts`): componente raiz de la aplicacion. Monta la cabecera, el area de rutas mediante `RouterOutlet` y el pie de pagina.
- Componentes de pagina (`src/app/pages`): representan vistas completas accesibles por rutas.
- Componentes compartidos (`src/app/shared`): piezas reutilizables usadas por varias paginas o por flujos concretos como listado de adopcion y reserva de citas.

## Rutas principales

Las rutas estan definidas en `src/app/app.routes.ts`:

| Ruta 				| Componente 	| Funcionalidad |
| --- 				| --- 			| --- 			|
| `/` 				| `Home` 		| Pagina inicial con contenido destacado y carrusel de imagenes. |
| `/adoption-list` 	| `AdoptionList`| Listado de mascotas disponibles para adopcion, con filtros y panel de administracion si el usuario es admin. |
| `/pet-profile` 	| `PetProfile` 	| Ficha detallada de una mascota seleccionada por query param `id`. |
| `/pet-schedule` 	| `PetSchedule` | Agenda de visitas y reservas de citas para conocer mascotas. |
| `/stories` 		| `Stories` 	| Historias o casos de adopcion cargados desde datos locales. |
| `/contact-us` 	| `ContactUs` 	| Informacion de contacto, motivos de contacto y mapa embebido. |
| `/about-us` 		| `AboutUs` 	| Presentacion del equipo. |
| `/login` 			| `Login` 		| Inicio de sesion y registro de usuarios. |
| `/faq` 			| `Faq` 		| Preguntas frecuentes en formato desplegable. |
| `/legal` 			| `Legal` 		| Informacion legal en formato desplegable. |
| `**` 				| redireccion 	| Redirige cualquier ruta desconocida a `/`. |

## Componentes de layout

### `AppComponent`

- Selector: `app-root`
- Archivo: `src/app/app.ts`
- Usa: `HeaderComponent`, `FooterComponent`, `RouterOutlet`
- Funcion: define la estructura base de la aplicacion. La plantilla contiene la cabecera global, el contenido de la ruta activa y el footer.

### `HeaderComponent`

- Selector: `app-header`
- Archivo: `src/app/pages/header/header.ts`
- Usa: `DataService`, `AuthService`, `Router`, `RouterLink`
- Funcion: muestra la marca, logo, enlaces principales, redes sociales y menu responsive.
- Gestiona el estado de sesion:
  - Muestra opciones segun si hay usuario autenticado.
  - Muestra herramientas de administracion si el usuario activo tiene `type === 'admin'`.
  - Permite cerrar sesion.
- Funciones admin incluidas:
  - Modal de gestion de citas pendientes.
  - Confirmacion y rechazo de citas.
  - Apertura de Gmail con mensajes predefinidos para confirmar o rechazar citas.
  - Modal de gestion de usuarios.
  - Edicion de nombre, email, telefono y tipo de usuario.
  - Baneo y desbaneo de usuarios.
  - Acceso al listado para gestion de mascotas.

### `FooterComponent`

- Selector: `app-footer`
- Archivo: `src/app/pages/footer/footer.ts`
- Usa: `DataService`, `RouterLink`
- Funcion: muestra enlaces secundarios y texto legal/copyright. Reorganiza los enlaces del footer en columnas izquierda, centro y derecha, destacando el enlace de agenda si existe.

## Componentes de pagina

### `Home`

- Selector: `app-home`
- Archivo: `src/app/pages/home/home.ts`
- Datos: `DataService.getHomeData()`
- Funcion: carga el contenido de portada y separa el texto en parrafos.
- Incluye un carrusel con:
  - Navegacion anterior/siguiente.
  - Indicadores de posicion.
  - Transicion circular usando imagenes duplicadas al inicio y al final.
  - Avance automatico cada 4 segundos.
  - Limpieza del temporizador en `ngOnDestroy`.

### `AdoptionList`

- Selector: `app-adoption-list`
- Archivo: `src/app/pages/adoption-list/adoption-list.ts`
- Usa: `AdminPanel`, `Filter`, `CardAnimal`, `DataService`, `AuthService`
- Funcion: muestra la lista de mascotas disponibles para adopcion.
- Mantiene dos listas reactivas:
  - `listaCompleta`: todas las mascotas recibidas.
  - `listaFiltrada`: resultado tras aplicar filtros y ordenacion.
- Permite filtrar por:
  - Genero.
  - Raza.
  - Rango de edad.
  - Rango de peso.
  - Tipo de pelo.
  - Caracter.
- Permite ordenar por edad o peso, ascendente o descendente.
- Si el usuario es admin, muestra el panel para agregar mascotas.

### `PetProfile`

- Selector: `app-pet-profile`
- Archivo: `src/app/pages/pet-profile/pet-profile.ts`
- Datos: mascotas desde `DataService.mascotas$`
- Funcion: muestra el detalle de una mascota a partir del query param `id`.
- Comportamiento:
  - Incrementa el contador de visitas/clicks de la mascota.
  - Redirige a `/adoption-list` si la mascota no existe despues de cargar los datos.
  - Permite navegar por el carrusel de imagenes de la mascota.
  - Permite volver al listado.
  - Permite ir a `/pet-schedule` conservando el `id` de la mascota para preseleccionarla en la reserva.

### `PetSchedule`

- Selector: `app-pet-schedule`
- Archivo: `src/app/pages/pet-schedule/pet-schedule.ts`
- Usa: `MonthCalendar`, `AvailableSlots`, `UpcomingBookings`, `DataService`, `AuthService`, `ActivatedRoute`
- Funcion: gestiona la reserva de citas para visitar mascotas.
- Control de acceso:
  - Solo permite acceder a usuarios con tipo `admin` o `user`.
- Agenda:
  - Genera calendario mensual.
  - No permite volver a meses anteriores al actual.
  - Deshabilita dias sin huecos libres.
  - Domingos sin disponibilidad (según configuración actual; modificable).
  - Lunes a viernes: citas de 10:00 a 18:00 (según configuración actual; modificable).
  - Sabados: citas de 09:00 a 13:00 (según configuración actual; modificable).
  - Bloquea huecos pasados.
  - Considera ocupado un hueco si existe una cita confirmada para la misma fecha y hora.
- Reserva:
  - Preselecciona mascota desde query param `id`.
  - Valida fecha y hora seleccionadas.
  - Crea una cita con estado `pending`.
  - Guarda la cita en Firestore mediante `DataService.addBooking`.
  - Muestra mensaje de confirmacion pendiente por correo.
- Citas proximas:
  - Los usuarios ven sus propias citas futuras.
  - Los administradores ven todas las citas futuras.
  - Permite cancelar citas.

### `Login`

- Selector: `app-login`
- Archivo: `src/app/pages/login/login.ts`
- Usa: `ReactiveFormsModule`, `AuthService`, `DataService`, `Router`
- Funcion: gestiona autenticacion local basada en usuarios de Firestore.
- Modos:
  - Inicio de sesion.
  - Registro.
- Validaciones:
  - Email obligatorio y valido.
  - Password obligatorio.
  - En registro, password minimo de 8 caracteres, una mayuscula, un numero y un simbolo.
  - Confirmacion de password.
  - Telefono con patron de 9 cifras empezando por 6, 7, 8 o 9.
  - Email duplicado.
  - Usuario baneado.
- Al iniciar sesion correctamente redirige a `/pet-schedule`.

### `Stories`

- Selector: `app-stories`
- Archivo: `src/app/pages/stories/stories.ts`
- Datos: `DataService.getStories()`
- Funcion: carga y muestra historias de adopcion.

### `AboutUs`

- Selector: `app-about-us`
- Archivo: `src/app/pages/about-us/about-us.ts`
- Datos: `DataService.getAboutUs()`
- Funcion: carga y muestra miembros del equipo.

### `ContactUs`

- Selector: `app-contact-us`
- Archivo: `src/app/pages/contact-us/contact-us.ts`
- Datos: `DataService.getContactUs()`
- Funcion: muestra informacion de contacto, motivos de contacto y mapa.
- Usa `DomSanitizer` para convertir la URL del mapa en `SafeResourceUrl` antes de usarla en el iframe.

### `Faq`

- Selector: `app-faq`
- Archivo: `src/app/pages/faq/faq.ts`
- Usa: `ItemCollapse`
- Datos: `DataService.getFaq()`
- Funcion: muestra preguntas frecuentes como elementos desplegables.

### `Legal`

- Selector: `app-legal`
- Archivo: `src/app/pages/legal/legal.ts`
- Usa: `ItemCollapse`
- Datos: `DataService.getLegal()`
- Funcion: muestra secciones legales como elementos desplegables.

## Componentes compartidos

### `AdminPanel`

- Selector: `app-admin-panel`
- Archivo: `src/app/shared/admin-panel/admin-panel.ts`
- Usado por: `AdoptionList`
- Funcion: formulario de administracion para crear nuevas mascotas.
- Usa `ReactiveFormsModule` con validadores obligatorios para:
  - Nombre.
  - Raza.
  - Genero.
  - Descripcion.
  - Edad.
  - Caracter.
  - Peso.
  - Tipo de pelo.
  - Imagenes.
- Permite abrir/cerrar el panel.
- Simula la seleccion de archivo asignando una imagen placeholder.
- Crea un objeto `Animal` y lo envia a `DataService.agregarMascota`.

### `Filter`

- Selector: `app-filter`
- Archivo: `src/app/shared/filter/filter.ts`
- Usado por: `AdoptionList`
- Funcion: panel de filtros y ordenacion para mascotas.
- Carga opciones dinamicas desde `DataService.mascotas$`:
  - Razas.
  - Tipos de pelo.
  - Caracteres.
- Emite `filtrosCambiados` con los criterios seleccionados.
- Permite limpiar filtros y ordenacion.

### `CardAnimal`

- Selector: `app-card-animal`
- Archivo: `src/app/shared/card-animal/card-animal.ts`
- Usado por: `AdoptionList`
- Inputs:
  - `mascota`: animal a representar.
  - `esAdmin`: activa acciones administrativas.
- Funcion: tarjeta visual de mascota.
- Permite navegar al perfil de la mascota.
- Si `esAdmin` es verdadero, permite abrir modal de confirmacion y eliminar la mascota mediante `DataService.eliminarMascota`.

### `MonthCalendar`

- Selector: `app-month-calendar`
- Archivo: `src/app/shared/month-calendar/month-calendar.ts`
- Usado por: `PetSchedule`
- Funcion: pinta el calendario mensual.
- Inputs:
  - Titulo del mes.
  - Dias de la semana.
  - Dias calculados del calendario.
  - Estado para permitir o no volver al mes anterior.
- Outputs:
  - `monthChange`: emite `-1` o `1` al cambiar de mes.
  - `dateSelected`: emite la fecha ISO seleccionada.
- Internamente renderiza cada dia con `DayCalendar`.

### `DayCalendar`

- Selector: `app-day-calendar`
- Archivo: `src/app/shared/day-calendar/day-calendar.ts`
- Usado por: `MonthCalendar`
- Funcion: representa una celda de dia del calendario.
- Muestra:
  - Numero de dia.
  - Cantidad de huecos libres.
  - Estado seleccionado.
  - Estado hoy.
  - Estado deshabilitado.
- Emite `daySelected` con la fecha ISO cuando el usuario selecciona un dia disponible.

### `AvailableSlots`

- Selector: `app-available-slots`
- Archivo: `src/app/shared/available-slots/available-slots.ts`
- Usado por: `PetSchedule`
- Funcion: muestra los horarios disponibles para la fecha seleccionada.
- Inputs:
  - Fecha seleccionada.
  - Etiqueta legible de fecha.
  - Hora seleccionada.
  - Lista de huecos con estado.
- Estados de hueco:
  - Disponible.
  - Reservado.
  - No disponible por estar expirado.
- Emite `slotSelected` cuando se selecciona una hora disponible.

### `UpcomingBookings`

- Selector: `app-upcoming-bookings`
- Archivo: `src/app/shared/upcoming-bookings/upcoming-bookings.ts`
- Usado por: `PetSchedule`
- Funcion: lista las proximas citas del usuario o del administrador.
- Muestra:
  - Fecha.
  - Hora y mascota.
  - Datos de contacto.
  - Estado: confirmada, rechazada o pendiente.
- Usa `CancelBookingButton` para emitir cancelaciones.

### `CancelBookingButton`

- Selector: `app-cancel-booking-button`
- Archivo: `src/app/shared/cancel-booking-button/cancel-booking-button.ts`
- Usado por: `UpcomingBookings`
- Funcion: boton reutilizable para cancelar una reserva.
- Emite `clicked` cuando se pulsa.

### `ScheduleFormField`

- Selector: `app-schedule-form-field`
- Archivo: `src/app/shared/schedule-form-field/schedule-form-field.ts`
- Funcion: campo de formulario reutilizable para la agenda.
- Inputs:
  - Label.
  - Nombre.
  - Tipo.
  - Valor.
  - Placeholder.
  - Required.
  - Pattern.
  - Inputmode.
  - Autocomplete.
  - Estado y texto de error.
- Output:
  - `valueChange`, con el valor escrito por el usuario.
- Nota: el componente existe, pero actualmente no aparece usado en las plantillas detectadas.

### `ItemCollapse`

- Selector: `app-item-collapse`
- Archivo: `src/app/shared/item-collapse/item-collapse.ts`
- Usado por: `Faq`, `Legal`
- Funcion: contenedor desplegable reutilizable.
- Recibe un `title` obligatorio mediante input basado en signals.
- Mantiene estado interno `isOpen`.
- Permite abrir y cerrar el contenido proyectado.

### `ItemStory`

- Selector: `app-item-story`
- Archivo: `src/app/shared/item-story/item-story.ts`
- Funcion: componente preparado para representar una historia individual.
- Nota: el componente existe con plantilla y estilos propios, pero actualmente no aparece usado en las plantillas detectadas.

## Relaciones principales entre componentes

- `AppComponent`
  - `HeaderComponent`
  - `RouterOutlet`
  - `FooterComponent`
- `AdoptionList`
  - `AdminPanel`
  - `Filter`
  - `CardAnimal`
- `PetSchedule`
  - `MonthCalendar`
    - `DayCalendar`
  - `AvailableSlots`
  - `UpcomingBookings`
    - `CancelBookingButton`
- `Faq`
  - `ItemCollapse`
- `Legal`
  - `ItemCollapse`

## Servicios relevantes para los componentes

Aunque no son componentes, varios componentes dependen de estos servicios:

- `DataService` (`src/app/services/data.ts`): centraliza el acceso a datos locales y Firestore. Expone datos de home, header, footer, FAQ, legal, contacto, historias, usuarios, mascotas y citas.
- `AuthService` (`src/app/services/auth.ts`): mantiene el usuario activo en un signal y en `localStorage`.
- `AnimalsService` (`src/app/services/animals.ts`): encapsula operaciones de mascotas en Firebase.
- `LocalJsonService` (`src/app/services/local-json.ts`): carga el contenido estatico desde `public/db.json`.
---

## 🗄️ Estructura de Datos en Firebase (Firestore)

El proyecto utiliza Cloud Firestore (una base de datos NoSQL) para garantizar persistencia y sincronización en tiempo real. 

### Colecciones Principales:

1. **`animals` (Mascotas):**
   * *Estructura:* `id` (generado por Firestore), `name`, `breed`, `age`, `weight`, `gender`, `hair`, `character`, `clicks` (contador de visitas), `description`, `images` (array de rutas).
   * *Uso:* Alimenta dinámicamente el catálogo de adopción.

2. **`users` (Usuarios):**
   * *Estructura:* `id` (generado), `name`, `email`, `password`, `phone`, `type` (ej. "user" o "admin"), `banned` (booleano para control de acceso).
   * *Uso:* Autenticación y gestión de roles.

3. **`bookings` (Citas):**
   * *Estructura:* `id`, `animalId`, `animalName`, `date` (formato YYYY-MM-DD), `time` (HH:MM), `userId`, `userName`, `status`.
   * *Uso:* Centraliza el calendario de adopciones, impidiendo solapamientos.

4. **`mail` (Sistema de Correos):**
   * *Estructura:* `to` (array de correos), `message` (objeto con `subject` y `html`).
   * *Uso:* Activado automáticamente al registrar usuarios para enviar un correo de bienvenida usando EmailJS (o la extensión Trigger Email en Firebase).

---

## 🧭 Tour por la Página Web

La aplicación ofrece un flujo de usuario intuitivo:

1. **Exploración (Visitante):** El usuario entra a la `Home`, explora el carrusel y navega a la sección de "Mascotas". Aquí puede usar el panel de filtros izquierdo para buscar, por ejemplo, "Perros, Pelo Corto, Carácter Activo".
2. **Visualización de Ficha:** Al hacer clic en un animal (ej. "Brody"), accede a su perfil (`PetProfile`), viendo la galería de imágenes y detalles técnicos. El contador de visitas se incrementa automáticamente.
3. **Registro/Login:** Si el usuario decide agendar una cita, el sistema le solicitará acceso. En la página de `Login`, puede registrarse (validación reactiva). Al hacerlo, se guarda en Firestore y (según configuración) se le envía un correo de bienvenida.
4. **Reserva de Cita (Flujo Principal):**
   * **Entrada de Datos:** El usuario navega a la agenda, selecciona el mes, luego el día y finalmente una hora disponible.
   * **Visualización:** Una vez confirmada, la cita aparece bloqueada en el calendario para otros usuarios y visible en el panel del administrador.
5. **Gestión (Admin):** Entrando con credenciales de administrador, el usuario admin puede ver en la sección de mascotas el panel de "Alta de Mascota" en el catálogo, pudiendo insertar nuevos animales directamente a Firestore para que aparezcan en tiempo real. Así mismo, si se hace click sobre el icono de la silueta, se muestra un pequeño panel de gestión de citas, de usuarios y de mascotas (redirige al panel de mascotas).

---

## 🚀 Evolución y Gestión Ágil

El proyecto ha sido gestionado siguiendo metodologías ágiles en Trello.
La evolución tecnológica abarca tres fases:
1. **Prototipo Estático:** HTML/CSS (**Sprint 1**).
2. **SPA Vanilla:** Integración de JS, Fetch y persistencia JSON local (**Sprint 2**).
3. **Arquitectura Angular & Firebase:** Refactorización total a componentes reactivos con persistencia real en la nube (**Sprint 3**).

*(Puede consultar las capturas del progreso en la carpeta `/trello/` del repositorio).*

---
## 🔐 Usuarios de prueba
* ### Admin
   - user:  admin@adoptme.es
   - passw: Basket&22

* ### Usuarios No Admin
   - user:  ernestina@adoptme.com
   - passw: Ernestina&2026

   - user: adoptante1@adoptme.com
   - passw: Adopta1&mascota
   
   - user: usuario@adoptme.es  (Usuario baneado de ejemplo)
   - passw: Elmáscrema&45
---

## 🛠️ Entorno de Desarrollo (Angular CLI)

### Levantar el proyecto
Para probar la aplicación localmente:

```bash
# 1. Acceder a la carpeta
cd angular-version

# 2. Instalar dependencias
npm install

# 3. Levantar servidor local (http://localhost:4200)
npm start
```

---
*© 2026 AdoptMe!!. Todos los derechos reservados.*
