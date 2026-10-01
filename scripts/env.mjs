// Loads .env.local for dev scripts (Node 22 has process.loadEnvFile).
process.loadEnvFile(new URL("../.env.local", import.meta.url));
