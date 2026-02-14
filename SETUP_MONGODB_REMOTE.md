# ServiceCheck - Architettura MongoDB + Docker su Proxmox

Questa documentazione descrive come configurare ServiceCheck con MongoDB su una VM dedicata e l'applicazione su un Container (CT) di Proxmox.

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────┐
│                    LAB on-premise                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐          ┌─────────────────┐ │
│  │   Proxmox CT     │          │  MongoDB VM     │ │
│  │  (Container)     │◄────────►│  (Dedicata)     │ │
│  │                  │          │                 │ │
│  │ Frontend (React) │          │ Port: 27017     │ │
│  │ Port: 3000       │          │ Auth DB: admin  │ │
│  │                  │          │                 │ │
│  │ Backend (API)    │          │                 │ │
│  │ Port: 5000       │          │                 │ │
│  └──────────────────┘          └─────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔧 Prerequisiti

### Sulla VM MongoDB
- Sistema operativo: Ubuntu/Debian Linux
- MongoDB 6.0 o superiore
- Port 27017 accessibile dalla rete

### Su Proxmox CT
- Container Linux (Ubuntu/Debian)
- Docker Engine installato
- Docker Compose installato
- Connettività di rete verso VM MongoDB

## 📋 Step-by-step

### 1️⃣ Installazione MongoDB sulla VM

```bash
# Sul server MongoDB (VM)
sudo apt-get update
sudo apt-get install -y mongodb-org

# Avvia il servizio
sudo systemctl start mongod
sudo systemctl enable mongod

# Verifica lo stato
sudo systemctl status mongod
```

### 2️⃣ Configurazione MongoDB (Accesso remoto)

```bash
# Edita il file di configurazione
sudo nano /etc/mongod.conf

# Modifica la sezione 'net':
net:
  port: 27017
  bindIp: 0.0.0.0    # ← Permetti connessioni da tutte le interfacce
  
# Riavvia MongoDB
sudo systemctl restart mongod
```

### 3️⃣ Inizializzazione database MongoDB

```bash
# Accedi a MongoDB
mongosh

# Crea il database e l'utente
use admin
db.createUser({
  user: "admin",
  pwd: "password123",  # Cambia questa password!
  roles: ["root"]
})

# Abilita autenticazione nel file di configurazione
sudo nano /etc/mongod.conf

# Aggiungi o modifica la sezione 'security':
security:
  authorization: enabled

# Riavvia MongoDB
sudo systemctl restart mongod
```

### 4️⃣ Setup su Proxmox CT

```bash
# Sul Container Proxmox
cd /path/to/servicecheck

# Copia il file di configurazione
cp .env.example .env

# Edita .env con le credenziali e l'indirizzo della VM MongoDB
nano .env
```

### 5️⃣ File `.env` - Configurazione per VM MongoDB remota

```env
# Frontend App
NODE_ENV=production
APP_PORT=3000

# Backend API
BACKEND_PORT=5000
VITE_API_URL=http://localhost:5000/api

# MongoDB remoto su VM
MONGODB_HOST=192.168.1.100        # ← IP o hostname della VM
MONGODB_PORT=27017
MONGODB_USER=admin
MONGODB_PASSWORD=password123       # ← Personalizza!
MONGODB_DB=servicecheck

# JWT Token
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# CORS (per permettere richieste front-end)
CORS_ORIGIN=*
```

### 6️⃣ Avvio di Docker su Proxmox CT

```bash
# Nel container Proxmox, dalla directory del progetto

# Build e avvio dei servizi
docker-compose up -d

# Verifica che i servizi siano attivi
docker-compose ps

# Leggi i log
docker-compose logs -f

# Seed database con utenti iniziali (opzionale)
docker-compose exec backend npm run build
docker-compose exec backend npm run seed
```

## 🌐 Accesso all'Applicazione

Dopo l'avvio:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check API**: http://localhost:5000/health

### Credenziali di default

| Username | Password | Ruolo |
|----------|----------|-------|
| admin | admin | Admin |
| manager | manager | Service Manager |
| lead | lead | Team Leader |
| op1 | op1 | Operator |
| op2 | op1 | Operator |

## 🔗 Comunicazione Frontend ↔ Backend

Il frontend comunica con il backend tramite API REST:

```
Frontend (React) → Backend API (Express) → MongoDB
   :3000             :5000                 remoto
```

**Variabile di ambiente per il Frontend**: `VITE_API_URL`

Quando distribuisci, assicurati che il frontend possa raggiungere il backend con l'URL corretto.

## 🛠️ Comandi Docker utili

```bash
# Visualizza log in tempo reale
docker-compose logs -f

# Arresta i servizi
docker-compose stop

# Riavvia i servizi
docker-compose restart

# Rimuovi i container (mantieni i volumi)
docker-compose down

# Accedi al backend
docker-compose exec backend sh

# Verifica la connessione a MongoDB
docker-compose exec backend mongosh mongodb://admin:password123@mongodb-vm:27017
```

## ⚠️ Troubleshooting

### Backend non si connette a MongoDB

```bash
# 1. Verifica che MongoDB sia in ascolto
# Su MongoDB VM:
sudo lsof -i :27017

# 2. Verifica la connettività di rete
# Dal CT Proxmox:
ping 192.168.1.100
telnet 192.168.1.100 27017

# 3. Verifica i log del backend
docker-compose logs backend

# 4. Verifica il valore di MONGODB_HOST in .env
cat .env | grep MONGODB_HOST
```

### Frontend non raggiunge il Backend

```bash
# 1. Verifica che il backend sia in ascolto
docker-compose exec frontend curl http://backend:5000/health

# 2. Verifica VITE_API_URL nel .env o nei log del build
docker-compose logs frontend

# 3. Ribuildi il frontend con le variabili corrette
docker-compose up -d --build frontend
```

### Errori di autenticazione MongoDB

```bash
# Verifica le credenziali su MongoDB
# Su MongoDB VM:
mongosh -u admin -p password123
use admin
db.auth("admin")
```

## 📚 Struttura del Progetto

```
servicecheck/
├── server/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── models/        # Modelli Mongoose
│   │   ├── controllers/   # Logica API
│   │   ├── routes/        # Endpoint API
│   │   ├── middleware/    # Auth, validazione
│   │   └── seeds/         # Dati iniziali
│   ├── Dockerfile
│   └── package.json
├── src/                   # Frontend React
│   ├── services/api.ts   # Client API
│   ├── views/            # Pagine React
│   └── components/       # Componenti React
├── docker-compose.yml    # Orchestrazione
├── Dockerfile           # Frontend
├── .env.example         # Template variabili
└── vite.config.ts       # Config Vite
```

## 🚀 Deploy in Produzione

Per un ambiente di produzione su Proxmox:

1. **Firewall**: Apri solo le porte 3000 (frontend) e 5000 (backend) verso il CT
2. **Reverse Proxy**: Configura Nginx per esporre l'applicazione
3. **SSL/TLS**: Utilizza certificati Let's Encrypt
4. **MongoDB Backup**: Configurale backup automatici
5. **Monitoraggio**: Setup logging e alerting

## 📞 Supporto

Per problemi di connettività, verifica:
- IP/hostname della VM MongoDB
- Regole firewall tra VM e CT
- Autenticazione MongoDB
- Stato dei servizi Docker
