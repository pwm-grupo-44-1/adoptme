# Arbol de estructura del proyecto

Estructura principal del proyecto Angular `adoptme/angular-version`.

```text
angular-version/
|-- .angular/                         # Cache y archivos generados por Angular CLI
|-- dist/                             # Build compilada de la aplicacion
|-- node_modules/                     # Dependencias instaladas por npm
|-- public/
|   |-- db.json                       # Datos base locales usados por la aplicacion
|   `-- img/
|       |-- about_us/
|       |   |-- Alejandro.jpg
|       |   |-- Esther.jpg
|       |   `-- Nestor.jpg
|       `-- animals/
|           |-- Agnes/
|           |-- Brody/
|           |-- Bubbles/
|           ...
|-- src/
|   |-- index.html                    # HTML raiz servido por Angular
|   |-- main.ts                       # Punto de entrada de la app
|   |-- styles.css                    # Estilos globales
|   |-- environments/
|   |   `-- environment.ts            # Configuracion de la API de Firebase
|   `-- app/
|       |-- app.config.ts             # Configuracion global de Angular
|       |-- app.css                   # Estilos del componente raiz
|       |-- app.html                  # Plantilla del componente raiz
|       |-- app.routes.ts             # Rutas principales de la aplicacion
|       |-- app.ts                    # Componente raiz
|       |-- firebase.ts               # Configuracion Firebase
|       |-- models/
|       |   |-- animal.ts             # Modelo de mascota
|       |   |-- booking.ts            # Modelo de reserva/cita
|       |   |-- data.ts               # Modelos de contenido estatico
|       |   `-- user.ts               # Modelo de usuario
|       |-- services/
|       |   |-- animals.ts            # Servicio de mascotas en Firebase
|       |   |-- auth.ts               # Servicio de sesion local
|       |   |-- data.ts               # Servicio central de datos
|       |   `-- local-json.ts         # Carga de datos desde public/db.json
|       |-- pages/
|       |   |-- about-us/
|       |   |   |-- about-us.css
|       |   |   |-- about-us.html
|       |   |   |-- about-us.spec.ts
|       |   |   `-- about-us.ts
|       |   |-- adoption-list/
|       |   |   |-- adoption-list.css
|       |   |   |-- adoption-list.html
|       |   |   |-- adoption-list.spec.ts
|       |   |   `-- adoption-list.ts
|       |   |-- contact-us/
|       |   |   |-- contact-us.css
|       |   |   |-- contact-us.html
|       |   |   |-- contact-us.spec.ts
|       |   |   `-- contact-us.ts
|       |   |-- faq/
|       |   |   |-- faq.css
|       |   |   |-- faq.html
|       |   |   |-- faq.spec.ts
|       |   |   `-- faq.ts
|       |   |-- footer/
|       |   |   |-- footer.css
|       |   |   |-- footer.html
|       |   |   |-- footer.spec.ts
|       |   |   `-- footer.ts
|       |   |-- header/
|       |   |   |-- header.css
|       |   |   |-- header.html
|       |   |   |-- header.spec.ts
|       |   |   `-- header.ts
|       |   |-- home/
|       |   |   |-- home.css
|       |   |   |-- home.html
|       |   |   |-- home.spec.ts
|       |   |   `-- home.ts
|       |   |-- legal/
|       |   |   |-- legal.css
|       |   |   |-- legal.html
|       |   |   |-- legal.spec.ts
|       |   |   `-- legal.ts
|       |   |-- login/
|       |   |   |-- login.css
|       |   |   |-- login.html
|       |   |   |-- login.spec.ts
|       |   |   `-- login.ts
|       |   |-- pet-profile/
|       |   |   |-- pet-profile.css
|       |   |   |-- pet-profile.html
|       |   |   |-- pet-profile.spec.ts
|       |   |   `-- pet-profile.ts
|       |   |-- pet-schedule/
|       |   |   |-- pet-schedule.css
|       |   |   |-- pet-schedule.html
|       |   |   |-- pet-schedule.models.ts
|       |   |   |-- pet-schedule.spec.ts
|       |   |   `-- pet-schedule.ts
|       |   `-- stories/
|       |       |-- stories.css
|       |       |-- stories.html
|       |       |-- stories.spec.ts
|       |       `-- stories.ts
|       `-- shared/
|           |-- admin-panel/
|           |   |-- admin-panel.css
|           |   |-- admin-panel.html
|           |   |-- admin-panel.spec.ts
|           |   `-- admin-panel.ts
|           |-- available-slots/
|           |   `-- available-slots.ts
|           |-- cancel-booking-button/
|           |   `-- cancel-booking-button.ts
|           |-- card-animal/
|           |   |-- card-animal.css
|           |   |-- card-animal.html
|           |   |-- card-animal.spec.ts
|           |   `-- card-animal.ts
|           |-- day-calendar/
|           |   |-- day-calendar.css
|           |   |-- day-calendar.html
|           |   |-- day-calendar.spec.ts
|           |   `-- day-calendar.ts
|           |-- filter/
|           |   |-- filter.css
|           |   |-- filter.html
|           |   |-- filter.spec.ts
|           |   `-- filter.ts
|           |-- item-collapse/
|           |   |-- item-collapse.css
|           |   |-- item-collapse.html
|           |   |-- item-collapse.spec.ts
|           |   `-- item-collapse.ts
|           |-- item-story/
|           |   |-- item-story.css
|           |   |-- item-story.html
|           |   |-- item-story.spec.ts
|           |   `-- item-story.ts
|           |-- month-calendar/
|           |   |-- month-calendar.css
|           |   |-- month-calendar.html
|           |   |-- month-calendar.spec.ts
|           |   `-- month-calendar.ts
|           |-- schedule-form-field/
|           |   `-- schedule-form-field.ts
|           `-- upcoming-bookings/
|               `-- upcoming-bookings.ts
|-- firebase.json                     # Configuracion Firebase Hosting
|-- package.json                      # Dependencias y scripts npm
'-- README.md                         # Documentacion general del proyecto
```

## Resumen por carpetas

- `public/`: recursos estaticos, imagenes, favicon y base de datos local `db.json`.
- `scripts/`: utilidades de apoyo para tareas manuales o comprobaciones.
- `src/app/models/`: interfaces y tipos usados por la aplicacion.
- `src/app/services/`: servicios de datos, autenticacion, Firebase y carga local.
- `src/app/pages/`: componentes de pagina conectados a rutas.
- `src/app/shared/`: componentes reutilizables usados dentro de las paginas.
- `.angular/`, `dist/` y `node_modules/`: carpetas generadas que normalmente no se editan manualmente.

