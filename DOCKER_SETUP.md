# Setup Docker per ServiceCheck

## 📁 File creati

1. **Dockerfile** - Immagine per l'app React (build multi-stage)
2. **docker-compose.yml** - Orquestrazione per production (app + PostgreSQL + pgAdmin)
3. **docker-compose.dev.yml** - Stack solo database per sviluppo locale
4. **.dockerignore** - File da escludere dal build Docker
5. **.env.example** - Variabili di configurazione

## 🚀 Quick Start

### 1. Preparazione
```bash
# Copia il file di configurazione
cp .env.example .env

# Modifica .env con le tue credenziali se necessario
```

### 2. Avvio completo (Production)
```bash
# Build e avvio di tutti i servizi
docker-compose up -d

# L'app sarà disponibile su: http://localhost:3000
# pgAdmin su: http://localhost:5050
```

### 3. Avvio solo database (Sviluppo locale)
```bash
# Se preferisci sviluppare in locale con React:
docker-compose -f docker-compose.dev.yml up -d

# Sviluppa l'app in locale
npm run dev
```

## 📊 Servizi disponibili

| Servizio | Porta | Credenziali |
|----------|-------|-------------|
| **App React** | 3000 | - |
| **PostgreSQL** | 5432 | admin / password123 |
| **pgAdmin** | 5050 | admin@servicecheck.local / admin |

## 📝 Comandi utili

```bash
# Visualizza log in tempo reale
docker-compose logs -f

# Accedi al database
docker-compose exec postgres psql -U admin -d servicecheck

# Arresta i servizi
docker-compose down

# Rimuovi anche i dati persisti
docker-compose down -v

# Rebuilda l'immagine dell'app
docker-compose build --no-cache
```

## 🔧 Configurazione

Modifica il file `.env` per personalizzare:
- **POSTGRES_PASSWORD** - Password del database
- **POSTGRES_DB** - Nome del database
- **GEMINI_API_KEY** - Chiave API Google Gemini
- **APP_PORT** - Porta dell'applicazione
- **PGADMIN_PASSWORD** - Password pgAdmin

## ⚠️ Note importanti

- Il database PostgreSQL **non è ancora integrato** con l'app (attualmente usa db.ts in memoria)
- Per persistere i dati, dovrai aggiornare `services/db.ts` per usare il database
- I volumi Docker mantengono i dati anche dopo l'arresto dei container
- Le immagini Alpine riducono la dimensione dei container

## 🛠️ Prossimi passi

Per rendere l'app completamente funzionante con il database:
1. Creare un backend Node.js/Express per le API
2. Migrare la logica da `db.ts` a query SQL
3. Aggiungere file di migrazione del database
4. Configurare le variabili di ambiente nell'app
