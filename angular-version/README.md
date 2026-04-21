# AngularVersion

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Import `db.json` to Firestore

The project includes a Node script that reads `public/db.json` and imports each top-level key into Firestore as a separate collection.

Mapping rules:

1. Root arrays become collections with one document per entry.
2. If an array item has `id`, that value is used as Firestore document id.
3. If an array item has no `id`, the script falls back to `slug`, then `name`, and finally a generated id.
4. Root objects become collections with a single document called `default`.
5. Root primitive values become collections with a single `default` document containing `{ value: ... }`.
6. Local asset paths are normalized to web paths like `/img/...` before uploading.

1. Install dependencies:

```bash
npm install
```

2. Save your Firebase service account JSON inside `angular-version/` or anywhere you prefer. The repository ignores files like `firebase-service-account*.json`.

3. Run a validation without writing data:

```bash
npm run import:db -- --credentials ./firebase-service-account.json --dry-run
```

4. Import the full database into Firestore:

```bash
npm run import:db -- --credentials ./firebase-service-account.json
```

5. If you only want the `animals` collection:

```bash
npm run import:animals -- --credentials ./firebase-service-account.json
```

Optional flags:

```bash
--db <ruta>            # default: public/db.json
--only <clave>         # imports only one root key, e.g. animals
--project <projectId>  # overrides project_id from the service account
--singleton-doc-id     # default: default
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
