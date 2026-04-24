# README Angular

## Resumen

`angular-version` es la version Angular del proyecto AdoptMe!, una SPA orientada a mostrar mascotas en adopcion, consultar fichas, reservar citas y gestionar un login simple con persistencia local.

La revision de este documento se ha hecho sobre el estado real del codigo a fecha de `2026-04-24`.

## Stack tecnico

- Angular `20.3.x`
- Angular Fire `20.0.1`
- CSS 3
- HTML 5

## Estructura principal

Ruta base revisada: `adoptme/angular-version`

```text
angular-version/
  public/                 Recursos estaticos y db.json
  src/
    app/
      models/             Interfaces de dominio
      pages/              Paginas standalone
      services/           Acceso a datos, auth y localStorage
      shared/             Componentes reutilizables
      app.config.ts       Providers globales
      app.routes.ts       Rutas de la SPA
  angular.json            Configuracion de build, serve y test
  package.json            Scripts y dependencias
```

## Arquitectura

La aplicacion está construida con componentes standalone. El arranque se hace en `src/main.ts`, que hace `bootstrapApplication(AppComponent, appConfig)`.

`AppComponent` monta una estructura fija:

- `app-header`
- `router-outlet`
- `app-footer`

La configuracion global (`src/app/app.config.ts`) registra:

- router
- `HttpClient`
- inicializacion de Firebase
- provider de Firestore

Aunque Firebase se inicializa, la aplicacion revisada no usa Firestore en sus servicios de lectura/escritura del frontend. El flujo real de datos depende de `public/db.json` y `localStorage`.

## Rutas disponibles

Definidas en `src/app/app.routes.ts`.

- `/` -> `Home`
- `/adoption-list` -> `AdoptionList`
- `/pet-profile` -> `PetProfile`
- `/pet-schedule` -> `PetSchedule`
- `/stories` -> `Stories`
- `/contact-us` -> `ContactUs`
- `/about-us` -> `AboutUs`
- `/login` -> `Login`
- `/faq` -> `Faq`
- `/legal` -> `Legal`
- `**` -> redireccion a `/`

## Modulos funcionales

### Home

- Carga contenido desde `DataService.getHomeData()`.
- Muestra texto descriptivo y un carrusel de imagenes.

### Catalogo de adopcion

- `AdoptionList` consume `DataService.mascotas$`.
- Usa `Filter` para filtrar por genero, raza, edad, peso, pelo y caracter.
- Usa `CardAnimal` para navegar a ficha o eliminar mascota.
- Integra `AdminPanel` para alta manual de mascotas.

### Ficha de mascota

- `PetProfile` lee el `id` desde query params.
- Incrementa visitas con `DataService.incrementarVisitas(id)`.
- Permite navegar a la agenda con la mascota preseleccionada.

### Agenda de citas

- `PetSchedule` trabaja con calendario mensual, bloques horarios y formulario de reserva.
- Las reservas se guardan en `localStorage`.
- Limita las citas a 2 por dia.
- No permite domingos.
- Usa horario base:
  - lunes a viernes: `10:00` a `18:00`
  - sabados: `09:00` a `13:00`
- Si `db.json` aporta horarios, los mezcla con el horario por defecto.

### Login y registro

- `Login` usa formulario reactivo.
- El login combina usuarios del JSON con usuarios creados en `localStorage`.
- El estado de sesion lo gestiona `AuthService` con un `signal`.

### Paginas de contenido

`AboutUs`, `Stories`, `ContactUs`, `Faq` y `Legal` cargan contenido estatico desde `DataService`, que a su vez lo obtiene de `public/db.json`.

## Servicios y flujo de datos

### `DataService`

Responsabilidades principales:

- cargar `public/db.json` una sola vez
- exponer datos estaticos por seccion
- mantener `mascotas$` como estado reactivo del catalogo
- mezclar datos del JSON con datos persistidos en `localStorage`

La carga usa un `ReplaySubject(1)` para cachear el JSON completo y evitar problemas de refresco.

### `LocalJsonService`

Lee `public/db.json` por HTTP y usa `localStorage` como pseudo base de datos del frontend.

Claves encontradas en `localStorage`:

- `adoptme_extra_animals`
- `adoptme_deleted_animals`
- `adoptme_clicks`
- `adoptme_bookings`
- `adoptme_new_users`
- `userActive`

### `AuthService`

- guarda la sesion activa en `userActive`
- expone `currentUser` como signal
- soporta `login()` y `logout()`

## Estado real de `public/db.json`

En el estado actual revisado, `public/db.json` contiene solo estas claves raiz:

- `header`
- `footer`
- `home`
- `about_us`
- `faq`
- `stories`
- `legal`
- `contact_us`

No aparecen en el JSON actual:

- `animals`
- `users`
- `schedule`

Esto es importante porque hay codigo que espera esas tres secciones. Con el contenido actual:

- el catalogo de mascotas arranca vacio salvo datos creados en `localStorage`
- el login no tiene usuarios base desde JSON
- la agenda no recibe slots desde JSON y usa fallback local

## Scripts disponibles

Segun `package.json`:

```bash
npm start
npm run build
npm run watch
npm test
npm run import:db
npm run import:animals
```

### Resultado de la verificacion

Comandos revisados el `2026-04-24`:

- `cmd /c npm run build` -> funciona
- `cmd /c npm test -- --watch=false` -> falla

Resultado relevante del build:

- la compilacion termina correctamente
- el bundle inicial supera el budget de `500 kB`
- tamano observado: `627.81 kB`

Fallo observado en tests:

```text
Schema validation failed with the following errors:
Data path "" must have required property 'buildTarget'.
```

## Incidencias y discrepancias detectadas

### 1. README interno desalineado

`angular-version/README.md` indica Angular CLI `21.2.6`, pero `package.json` refleja Angular `20.3.x`.

### 2. Scripts de importacion rotos

`package.json` declara:

- `import:db`
- `import:animals`

Ambos apuntan a `./scripts/import-db-to-firestore.mjs`, pero ese archivo no existe en `angular-version`.

### 3. Firebase inicializado pero no integrado en el flujo real

La app configura Firebase y Firestore en `app.config.ts`, pero los servicios del frontend no consumen Firestore.

### 4. Datos esperados pero ausentes en `db.json`

El codigo espera `animals`, `users` y `schedule`, pero no existen en el JSON actual.

### 5. Panel admin siempre visible

En `AdoptionList`, `esAdmin` esta fijado a `true`, asi que el panel de alta de mascotas se muestra siempre, sin depender del usuario autenticado.

### 6. Persistencia simulada

Altas, bajas, clicks, citas y nuevos usuarios no van a backend real; se guardan en `localStorage`.

## Como ejecutar el proyecto

Desde `adoptme/angular-version`:

```bash
cmd /c npm install
cmd /c npm start
```

La aplicacion queda disponible en `http://localhost:4200/`.

Nota para PowerShell en este entorno: `npm` directo puede fallar por la politica de ejecucion de `npm.ps1`, por eso conviene usar `cmd /c npm ...`.

## Recomendaciones tecnicas

- Restaurar o recrear `animals`, `users` y `schedule` en `public/db.json`.
- Corregir la configuracion del target `test` en `angular.json`.
- Eliminar o recrear el script real de importacion a Firestore.
- Decidir si Firebase sera fuente real de datos o solo configuracion residual.
- Condicionar `AdminPanel` al usuario autenticado y a su rol.

