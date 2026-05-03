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

El proyecto adopta una arquitectura basada en Componentes Standalone (introducidos en Angular 14+), organizando el código en dominios de responsabilidad claros:

```text
angular-version/
  public/                 # Recursos estáticos e imágenes
  src/
    app/
      models/             # Interfaces de dominio (Animal, User, Booking, etc.)
      pages/              # Vistas principales enrutables (Home, AdoptionList, etc.)
      services/           # Lógica de negocio y conexión a Firestore (Auth, Data, Animals)
      shared/             # Componentes UI reutilizables (Filtros, Tarjetas, Calendarios)
      app.config.ts       # Configuración global y provisión de Firebase
      app.routes.ts       # Definición de la navegación (Router)
```

### Componentes Clave y su Funcionalidad:
* **`AdoptionList` & `CardAnimal`:** Consumen los datos reactivos del catálogo y permiten explorar a las mascotas aplicando filtros multidimensionales (raza, pelo, carácter, peso).
* **`PetSchedule` (Agenda):** Interfaz compleja de calendario mensual y diario. Gestiona la lógica de reservas asegurando límites por día, horarios hábiles (ej: L-V de 10h a 18h) y persistencia en la base de datos.
* **`PetProfile` (Ficha técnica):** Muestra el detalle exhaustivo del animal e incrementa dinámicamente un contador de visitas usando Firebase.
* **`Login`:** Gestiona el acceso y registro mediante Formularios Reactivos (`ReactiveForms`), incluyendo la validación del formato de emails y la robustez de las contraseñas.

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
5. **Gestión (Admin):** Entrando con credenciales de administrador, el usuario ve el panel de "Alta de Mascota" en el catálogo, pudiendo insertar nuevos animales directamente a Firestore para que aparezcan en tiempo real.

---

## 🚀 Evolución y Gestión Ágil

El proyecto ha sido gestionado siguiendo metodologías ágiles en Trello.
La evolución tecnológica abarca tres fases:
1. **Prototipo Estático:** HTML/CSS (Sprint 1).
2. **SPA Vanilla:** Integración de JS, Fetch y persistencia JSON local (Sprint 2).
3. **Arquitectura Angular & Firebase:** Refactorización total a componentes reactivos con persistencia real en la nube (Sprint 3).

*(Puedes consultar las capturas del progreso en la carpeta `/trello/` del repositorio).*

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
