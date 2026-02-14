# ServiceCheck API Server

Backend Node.js/Express per ServiceCheck - Operational checklist per servizi gestiti.

## 🚀 Quick Start

### In locale

```bash
# Installa dipendenze
npm install

# Configura le variabili di ambiente
cp .env.example .env

# Compila TypeScript
npm run build

# Seed il database con utenti di test
npm run seed

# Avvia il server
npm start
```

### Con Docker

```bash
# Build immagine
docker build -t servicecheck-backend .

# Avvia container
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb://admin:password123@mongodb-vm:27017/servicecheck?authSource=admin" \
  servicecheck-backend
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Get current user
- `GET /api/auth/users` - List all users

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (admin)
- `PUT /api/tasks/:id` - Update task (admin)
- `DELETE /api/tasks/:id` - Delete task (admin)

### Assignments
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment (admin)
- `DELETE /api/assignments/:id` - Delete assignment (admin)

### Execution Logs
- `GET /api/logs` - Get logs
- `POST /api/logs` - Create log

### Health
- `GET /health` - Server health status

## 🔐 Authentication

Tutti gli endpoint richiedono un JWT token nel header:

```
Authorization: Bearer <token>
```

Ottieni il token facendo login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

## 📝 Variabili di Ambiente

```env
# Server
NODE_ENV=development|production
PORT=5000
HOST=0.0.0.0

# MongoDB
MONGODB_URI=mongodb://user:pass@host:27017/db?authSource=admin

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=*
```

## 🏗️ Struttura Cartelle

```
server/
├── src/
│   ├── models/              # Schemi MongoDB
│   │   ├── User.ts
│   │   ├── TaskDefinition.ts
│   │   ├── TaskAssignment.ts
│   │   └── ExecutionLog.ts
│   ├── controllers/         # Logica di business
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   ├── assignmentController.ts
│   │   └── logController.ts
│   ├── routes/              # Endpoint
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── assignments.ts
│   │   └── logs.ts
│   ├── middleware/          # Middleware
│   │   └── auth.ts
│   ├── seeds/               # Seed data
│   │   └── index.ts
│   └── index.ts             # Entry point
├── dist/                    # Build output
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Login e ottieni token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.token')

# Test endpoint protetto
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/user
```

## 🐛 Debugging

```bash
# Logs in tempo reale
docker-compose logs -f backend

# Accedi al container
docker-compose exec backend sh

# Verifica connessione MongoDB
docker-compose exec backend mongosh mongodb://admin:password123@mongodb-vm:27017/servicecheck?authSource=admin
```

## 📦 Dependencies

- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🔄 Data Flow

```
Client (React)
    ↓
POST /api/auth/login {username, password}
    ↓
authController.login()
    ↓
bcrypt.compare() password
    ↓
jwt.sign() token
    ↓
Return token to client
    ↓
Client stores token in localStorage
    ↓
Future requests include: Authorization: Bearer <token>
    ↓
authMiddleware verifies JWT
    ↓
Route handler executes
```

## 🚀 Production Build

```bash
# Compila TypeScript
npm run build

# Verifica il build
ls -la dist/

# Avvia il server di produzione
npm start
```

## 📞 Support

Per problemi:
1. Verifica che MongoDB sia raggiungibile
2. Controlla le variabili di ambiente
3. Leggi i log: `docker-compose logs backend`
4. Verifica i permessi su MongoDB
