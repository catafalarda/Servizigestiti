# ServiceCheck - Operational Checklist per Servizi Gestiti

Applicazione web moderna per la gestione di checklist operative su servizi gestiti, con backend Node.js, frontend React e database MongoDB.

## 🏗️ Architettura

ServiceCheck utilizza un'architettura **three-tier** distribuita:

```
┌──────────────────────────────────────────────────────┐
│     Frontend (React + TypeScript)                    │
│     Running: Proxmox Container :3000                │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ HTTP/REST API calls
                 ↓
┌──────────────────────────────────────────────────────┐
│     Backend (Node.js + Express)                      │
│     Running: Proxmox Container :5000                │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ Mongoose ODM
                 ↓
┌──────────────────────────────────────────────────────┐
│     MongoDB Database                                 │
│     Running: VM Dedicated (on-premise)              │
│     Network: Private LAB Network                    │
└──────────────────────────────────────────────────────┘
```

## 📋 Funzionalità

- 👥 **Gestione Utenti**: Admin, Service Manager, Team Leader, Operator
- 📝 **Checklist**: Definisci e assegna task operativi
- 📅 **Programmazione**: Task giornalieri, settimanali, mensili o specifici
- ✅ **Tracciamento**: Registra completamento e risultati
- 📊 **Audit**: Log completo di tutte le operazioni
- 🔐 **Autenticazione**: JWT token-based

## 🚀 Quick Start

### Prerequisiti
- Docker & Docker Compose
- MongoDB su VM remota configurata
- Proxmox Container con networking

### Step 1: Clona il repository

```bash
cd /path/to/servicecheck
cp .env.example .env
```

### Step 2: Configura le variabili di ambiente

```bash
nano .env
```

Modifica questi valori:
```env
# Indirizzo MongoDB VM nel tuo LAB
MONGODB_HOST=192.168.x.x        # ← Modifica con IP della VM
MONGODB_PORT=27017
MONGODB_USER=admin
MONGODB_PASSWORD=password123     # ← Cambia password!

# JWT Secret
JWT_SECRET=your_secure_secret_key_here
```

### Step 3: Avvia i servizi

```bash
# Build e avvia
docker-compose up -d

# Verifica stato
docker-compose ps

# Leggi log (Ctrl+C per uscire)
docker-compose logs -f
```

### Step 4: Accedi all'applicazione

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health API**: http://localhost:5000/health

### Step 5: Login

Usa le credenziali di default:
- Username: `admin`
- Password: `admin`

## 📚 Documentazione

- [🗄️ Setup MongoDB Remoto](./SETUP_MONGODB_REMOTE.md) - Guida completa per configurare MongoDB su VM
- [🐳 Docker Setup](./DOCKER_SETUP.md) - Guida Docker e container
- [🔌 Backend API Server](./server/README.md) - Documentazione API

## 📁 Struttura Progetto

```
servicecheck/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── views/               # Pagine principali
│   │   ├── components/          # Componenti React riutilizzabili
│   │   ├── services/
│   │   │   ├── api.ts           # Client API per comunicare con backend
│   │   │   └── db.ts            # Storage locale (localStorage)
│   │   ├── App.tsx              # Componente principale
│   │   └── types.ts             # TypeScript types
│   ├── vite.config.ts           # Config Vite
│   ├── tsconfig.json
│   └── package.json
│
├── server/                      # Backend Node.js/Express
│   ├── src/
│   │   ├── models/              # Modelli MongoDB Mongoose
│   │   ├── controllers/         # Logica API
│   │   ├── routes/              # Endpoint REST
│   │   ├── middleware/          # Middleware (auth, etc)
│   │   ├── seeds/               # Dati iniziali
│   │   └── index.ts             # Entry point server
│   ├── Dockerfile
│   ├── package.json
│   └── README.md                # Doc server
│
├── docker-compose.yml           # Production
├── docker-compose.dev.yml       # Development
├── Dockerfile                   # Frontend image
├── .env.example                 # Template env
└── README.md                    # Questo file
```

## 🔌 API REST

Il backend espone API REST per tutte le operazioni:

### Authentication
```bash
POST   /api/auth/login          # Login
GET    /api/auth/user           # Get current user (require auth)
GET    /api/auth/users          # List all users (require auth)
```

### Tasks (CRUD)
```bash
GET    /api/tasks               # Get all tasks
POST   /api/tasks               # Create (admin only)
PUT    /api/tasks/:id           # Update (admin only)
DELETE /api/tasks/:id           # Delete (admin only)
```

### Assignments
```bash
GET    /api/assignments         # Get assignments
POST   /api/assignments         # Create (admin)
DELETE /api/assignments/:id     # Delete (admin)
```

### Execution Logs
```bash
GET    /api/logs                # Get logs
POST   /api/logs                # Create log
```

## 🏃‍♂️ Comandi Utili

```bash
# View logs in tempo reale
docker-compose logs -f

# Arresta servizi
docker-compose stop

# Riavvia servizi
docker-compose restart

# Rimuovi container (mantieni volumi)
docker-compose down

# Accedi shell backend
docker-compose exec backend sh

# Verifica connessione MongoDB
docker-compose exec backend mongosh \
  "mongodb://admin:password123@mongodb-vm:27017/servicecheck?authSource=admin"

# Esegui seed database
docker-compose exec backend npm run build
docker-compose exec backend npm run seed
```

## 🔐 Sicurezza

### Autenticazione
- JWT token-based
- Token salvato in localStorage browser
- Scadenza token: 7 giorni (configurabile)

### Password
- Hashing bcrypt (10 rounds)
- Mai salvate in chiaro

### Autorizzazione
- Role-based access control (RBAC)
- Admin, Service Manager, Team Leader, Operator

### Ruoli

| Ruolo | Permessi |
|-------|----------|
| **Admin** | Full access, crea/modifica/elimina task |
| **Service Manager** | Visualizza e assegna task |
| **Team Leader** | Gestisce team, completa task |
| **Operator** | Esegue e completa i propri task |

## 🔧 Variabili d'Ambiente

```env
# Server
NODE_ENV=production              # development | production
APP_PORT=3000                    # Porta frontend
BACKEND_PORT=5000                # Porta backend

# MongoDB Remote
MONGODB_HOST=mongodb-vm          # Hostname o IP VM
MONGODB_PORT=27017
MONGODB_USER=admin
MONGODB_PASSWORD=password123
MONGODB_DB=servicecheck

# Frontend
VITE_API_URL=http://localhost:5000/api

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=*
```

## 🐛 Troubleshooting

### Backend non si connette a MongoDB
```bash
# 1. Verifica IP/hostname VM
ping <MONGODB_HOST>

# 2. Verifica porta MongoDB
nc -zv <MONGODB_HOST> 27017

# 3. Verifica credenziali
mongosh -u admin -p password123 --host <MONGODB_HOST>

# 4. Leggi log backend
docker-compose logs backend
```

### Frontend non raggiunge Backend
```bash
# 1. Verifica che backend sia in ascolto
curl http://localhost:5000/health

# 2. Verifica VITE_API_URL
docker-compose logs frontend | grep VITE_API_URL

# 3. Verifica CORS
curl -H "Origin: http://localhost:3000" http://localhost:5000/health
```

### Problema di autenticazione
```bash
# Resetta credenziali (seed database)
docker-compose exec backend npm run seed

# Verify user nel database
docker-compose exec backend mongosh \
  -u admin -p password123 \
  mongodb://mongodb-vm:27017/servicecheck?authSource=admin \
  -c "db.users.find()"
```

## 📦 Deploy in Produzione

### Su Proxmox CT

1. **Backup dati**: Snapshot MongoDB prima di deploy
2. **Build immagini**: `docker-compose build`
3. **Test**: `docker-compose up -d` e verifica funzionalità
4. **Reverse proxy**: Setup Nginx per HTTPS
5. **SSL/TLS**: Configura certificati Let's Encrypt
6. **Firewall**: Esponi solo porte 80, 443
7. **Monitoring**: Setup logging e alerting

### MongoDB Backup

```bash
# Su VM MongoDB
mongodump -u admin -p password123 --out /backups/servicecheck

# Restore
mongorestore -u admin -p password123 /backups/servicecheck
```

## 🛠️ Development

### Avvia in dev mode

```bash
# Solo backend MongoDB
docker-compose -f docker-compose.dev.yml up -d

# Avvia frontend in locale
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Modifica su hot reload

I file sorgente sono montati come volumi in dev mode:
```yaml
volumes:
  - ./server/src:/app/src
```

Qualsiasi modifica ai file TypeScript verrà automaticamente ricompilata.

## 📊 Stack Tecnologico

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Fetch API** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **TypeScript** - Type safety
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT auth

### Database
- **MongoDB 6.0+** - NoSQL database
- **Mongoose schemas** - Data validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Proxmox** - Virtualization platform

## 📞 Support & Documentazione

- Backend docs: [./server/README.md](./server/README.md)
- Setup MongoDB: [./SETUP_MONGODB_REMOTE.md](./SETUP_MONGODB_REMOTE.md)
- Docker guide: [./DOCKER_SETUP.md](./DOCKER_SETUP.md)

## 📄 Licenza

Privato - Uso interno

## 🤝 Contributi

Per modifiche o miglioramenti, crea un branch e submit una pull request.
