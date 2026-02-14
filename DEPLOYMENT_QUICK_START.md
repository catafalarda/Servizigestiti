# 🚀 Deployment Guida Rapida - MongoDB VM + Proxmox CT

Istruzioni step-by-step per deployare ServiceCheck nel tuo LAB on-premise.

## 📍 Mappa Deployment

```
┌─────────────────────────────────┐
│  Your LAB Network               │
├─────────────────────────────────┤
│                                 │
│  VM 1: MongoDB 27017            │
│  └─ Hostname: mongodb-vm        │
│  └─ IP: 192.168.x.x             │
│                                 │
│  CT (Proxmox): ServiceCheck     │
│  └─ Frontend: :3000             │
│  └─ Backend: :5000              │
│                                 │
└─────────────────────────────────┘
```

## ⏱️ Tempo Richiesto

- MongoDB setup: **10-15 minuti**
- Docker setup: **5-10 minuti**
- Testing: **5 minuti**

---

## 🔧 PARTE 1: Setup MongoDB VM

### 1.1 SSH nella VM MongoDB

```bash
ssh user@192.168.x.x
```

### 1.2 Installa MongoDB

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Installa MongoDB
sudo apt-get install -y mongodb-org

# Avvia il servizio
sudo systemctl start mongod
sudo systemctl enable mongod

# Verifica
sudo systemctl status mongod
```

### 1.3 Configura accesso remoto

```bash
# Edita configurazione MongoDB
sudo nano /etc/mongod.conf

# Trova la sezione 'net:' e modifica:
net:
  port: 27017
  bindIp: 0.0.0.0     # ← Permetti tutte le interfacce

# Salva (Ctrl+O, Enter, Ctrl+X)

# Riavvia MongoDB
sudo systemctl restart mongod
```

### 1.4 Crea database e utente

```bash
# Accedi a MongoDB shell
mongosh

# Nel shell MongoDB, esegui:
use admin

db.createUser({
  user: "admin",
  pwd: "password123",        # ← Cambia password!
  roles: ["root"]
})

db.createDatabase("servicecheck")

exit
```

### 1.5 Abilita autenticazione

```bash
# Edita config
sudo nano /etc/mongod.conf

# Aggiungi sezione security:
security:
  authorization: enabled

# Salva e riavvia
sudo systemctl restart mongod

# Verifica accesso autenticato
mongosh -u admin -p password123
```

### 1.6 Verifica accessibilità

```bash
# Dal tuo PC locale o dal CT:
telnet 192.168.x.x 27017

# O con netcat:
nc -zv 192.168.x.x 27017
```

✅ **MongoDB VM è pronto!**

---

## 🐳 PARTE 2: Setup Proxmox CT - ServiceCheck

### 2.1 SSH nel Container Proxmox

```bash
ssh user@proxmox-ct-ip
```

### 2.2 Installa Docker (se non presente)

```bash
# Update
## 🐳 PARTE 2: Setup Proxmox CT - ServiceCheck

### 2.1 SSH nel Container Proxmox

```bash
ssh user@proxmox-ct-ip
```

### 2.2 Installa Docker (se non presente)

```bash
# Update
sudo apt-get update

# Installa Docker
sudo apt-get install -y docker.io docker-compose

# Aggiungi utente al gruppo docker (opzionale)
sudo usermod -aG docker $USER
newgrp docker

# Verifica
docker --version
docker-compose --version

# Installa Docker
sudo apt-get install -y docker.io docker-compose

# Aggiungi utente al gruppo docker (opzionale)
sudo usermod -aG docker $USER
newgrp docker

# Verifica
docker --version
docker-compose --version
```

### 2.3 Clona repository

```bash
# Clona il repository (o copia i file)
git clone <repo-url> servicecheck
cd servicecheck

# O se copies file:
cd /path/to/servicecheck
```

### 2.4 Configura le variabili

```bash
# Copia template
cp .env.example .env

# Modifica con i tuoi parametri
nano .env
```

**Importante**: Modifica questi valori:

```env
# Stringa di collegamento completa MongoDB
MONGODB_URI=mongodb://admin:Mapelex1973@192.168.1.146:27017/admin

# Indirizzo IP o hostname della VM MongoDB
MONGODB_HOST=192.168.1.146        # ← IP reale della VM MongoDB

# Credenziali (stesse della VM)
MONGODB_USER=admin
MONGODB_PASSWORD=Mapelex1973     # ← Stessa password usata su MongoDB

# JWT Secret (cambia!)
JWT_SECRET=your_unique_secret_key_$(date +%s)

# Se accedi da remote, modifica:
VITE_API_URL=http://<public-ip>:5000/api
```

### 2.5 Avvia i servizi

```bash
# Build e start
docker-compose up -d

# Verifica stato (attendi 10-15 sec)
docker-compose ps

# Leggi log
docker-compose logs -f
```

Dovresti vedere:
```
servicecheck-backend    | ✓ MongoDB connected
servicecheck-frontend   | ✓ Vite dev server running
```

### 2.6 Seed il database (opzionale)

```bash
# Popola con utenti di test
docker-compose exec backend sh
npm run build
npm run seed
exit
```

### 2.7 Accedi all'applicazione

```
👉 Frontend:  http://localhost:3000
👉 Backend:   http://localhost:5000
👉 Health:    http://localhost:5000/health
```

Credenziali di test:
- Username: `admin`
- Password: `admin`

✅ **ServiceCheck è online!**

---

## 🧪 TESTING

### Test 1: Verifica connessione MongoDB

```bash
# Nel CT:
docker-compose logs backend | grep MongoDB

# Dovrebbe mostrare:
✓ MongoDB connected
```

### Test 2: Verifica API

```bash
# Health check
curl http://localhost:5000/health

# Dovrebbe ritornare:
{
  "status": "OK",
  "timestamp": "...",
  "mongodb": "connected"
}
```

### Test 3: Verifica Frontend

```bash
curl http://localhost:3000

# Dovrebbe ritornare HTML della pagina
```

### Test 4: Login API

```bash
# Genera token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.token')

# Usa token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/user
```

---

## 🔒 Sicurezza Post-Deploy

- [ ] Cambia password admin MongoDB
- [ ] Cambia `JWT_SECRET` con valore casuale
- [ ] Configura firewall (solo porte 3000, 5000, 27017 nella rete interna)
- [ ] Setup backup MongoDB
- [ ] Abilita SSL/TLS se accessi da internet
- [ ] Configura logging e monitoring

---

## 📊 Monitoraggio

### Leggi i log

```bash
# Tutto
docker-compose logs

# Solo backend
docker-compose logs backend

# Solo frontend
docker-compose logs frontend

# Real-time
docker-compose logs -f
```

### Verifica stato container

```bash
docker-compose ps

# Output:
NAME                    STATUS
servicecheck-backend    Up 5 minutes (healthy)
servicecheck-frontend   Up 5 minutes
```

---

## 🔄 Aggiornamenti & Manutenzione

### Aggiorna il codice

```bash
# Stop servizi
docker-compose down

# Update repository
git pull origin main

# Rebuild con nuovo codice
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Backup database MongoDB

```bash
# Su VM MongoDB
mongodump -u admin -p password123 \
  --out /backups/servicecheck_$(date +%Y%m%d)

# Verifica
ls -la /backups/
```

### Restore database MongoDB

```bash
mongorestore -u admin -p password123 \
  /path/to/backup/servicecheck
```

---

## 🆘 Troubleshooting

### Frontend mostra errore "Cannot reach backend"

```bash
# 1. Verifica che backend sia up
docker-compose exec frontend curl http://backend:5000/health

# 2. Controlla VITE_API_URL
grep VITE_API_URL .env
docker-compose logs frontend | grep VITE

# 3. Rebuilda frontend
docker-compose up -d --build frontend
```

### Backend non connette a MongoDB

```bash
# 1. Verifica IP MongoDB
ping <MONGODB_HOST>

# 2. Verifica porta
nc -zv <MONGODB_HOST> 27017

# 3. Test con credenziali
mongosh -u admin -p <password> \
  --host <MONGODB_HOST>:27017

# 4. Verifica .env
grep MONGODB .env

# 5. Log backend
docker-compose logs backend
```

### Login fallisce

```bash
# Seed database di nuovo
docker-compose exec backend npm run seed

# Verifica utenti in MongoDB
docker-compose exec backend mongosh \
  -u admin -p password123 \
  --host <MONGODB_HOST>:27017 \
  mongodb://admin:password123@<MONGODB_HOST>:27017/servicecheck?authSource=admin \
  -c "db.users.find()"
```

---

## ✅ Checklist Finale

- [ ] MongoDB running su VM (telnet <ip> 27017 OK)
- [ ] Docker & Docker Compose installati su CT
- [ ] .env configurato con credenziali corrette
- [ ] docker-compose up -d completato
- [ ] Frontend raggiungibile su http://localhost:3000
- [ ] Backend raggiungibile su http://localhost:5000/health
- [ ] Login funzionante
- [ ] Database seeded (utenti visibili)
- [ ] Firewall configurato
- [ ] Backup MongoDB schedulato

---

## 📞 Support

Se riscontri problemi:

1. Leggi i log: `docker-compose logs -f`
2. Verifica connettività MongoDB: `nc -zv <ip> 27017`
3. Verifica credenziali: `mongosh -u admin -p <pass> --host <ip>`
4. Controlla le variabili .env
5. Ricrea container: `docker-compose restart`

Buon lavoro! 🎉
