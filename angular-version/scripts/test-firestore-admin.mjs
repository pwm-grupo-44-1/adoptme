import { access, readFile } from 'node:fs/promises';
import process from 'node:process';
import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function parseArgs(argv) {
  const options = {
    collection: 'animals',
    limit: 1
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--credentials') {
      options.credentials = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--project') {
      options.project = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--collection') {
      options.collection = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--limit') {
      options.limit = Number(argv[i + 1]);
      i += 1;
      continue;
    }
  }

  return options;
}

async function loadCredentials(credentialsPath) {
  const raw = await readFile(credentialsPath, 'utf8');
  return JSON.parse(raw);
}

async function resolveCredentialsPath(options) {
  if (options.credentials) {
    return options.credentials;
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!envPath) {
    return null;
  }

  await access(envPath);
  return envPath;
}

function buildAppOptions(options, serviceAccount) {
  if (serviceAccount) {
    return {
      credential: cert(serviceAccount),
      projectId: options.project ?? serviceAccount.project_id
    };
  }

  return {
    credential: applicationDefault(),
    projectId: options.project
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const limitValue = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 1;
  const credentialsPath = await resolveCredentialsPath(options);

  let serviceAccount;
  if (credentialsPath) {
    serviceAccount = await loadCredentials(credentialsPath);
  } else {
    throw new Error(
      'No se ha encontrado un service account. Usa --credentials <ruta-json> o define GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }

  const app =
    getApps()[0] ??
    initializeApp(buildAppOptions(options, serviceAccount));

  const db = getFirestore(app);
  const snapshot = await db.collection(options.collection).limit(limitValue).get();
  const first = snapshot.docs[0];

  console.log(
    JSON.stringify(
      {
        ok: true,
        authMode: serviceAccount ? 'service-account' : 'application-default',
        projectId: app.options.projectId ?? null,
        collection: options.collection,
        documentsRead: snapshot.size,
        firstDocumentId: first?.id ?? null,
        firstDocumentKeys: first ? Object.keys(first.data()).slice(0, 10) : []
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        name: error?.name ?? 'Error',
        message: error?.message ?? String(error),
        code: error?.code ?? null,
        hint:
          'Pasa --credentials <ruta-json> o define GOOGLE_APPLICATION_CREDENTIALS con un service account que tenga acceso a Firestore.'
      },
      null,
      2
    )
  );
  process.exit(1);
});
