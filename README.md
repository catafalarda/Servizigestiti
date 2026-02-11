# Managed Services Checklist MVP

MVP web app per sostituire i file Excel nella gestione quotidiana delle attività operative Managed Services.

## Stack
- **Frontend**: HTML/CSS/JavaScript vanilla (cartella `frontend/`)
- **Backend**: FastAPI + SQLAlchemy (`backend/app/`)
- **Database**: SQLite (`managed_services.db`)
- **Auth**: login username/password con JWT Bearer token

## Ruoli implementati
- Service Manager
- Team Leader
- Operatore/Sistemista

## Funzionalità principali
- Creazione attività programmate (giornaliere, settimanali, mensili, ricorrenti)
- Creazione attività specifiche (giorno singolo o intervallo)
- Dashboard giornaliera per assegnazioni operatori
- Vista operatore con sola lista attività assegnate
- Consuntivazione attività con esito **OK/KO** + note
- Tracciabilità completa tramite `execution_logs`: utente, timestamp, esito, note
- Storico non sovrascrivibile (append-only log)

## Struttura
```
backend/
  app/
    main.py
    models.py
    auth.py
    db.py
    schemas.py
    seed.py
frontend/
  index.html
  app.js
  styles.css
```

## Avvio locale
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Apri: `http://localhost:8000`

## Utenti demo
- `manager / manager123`
- `leader / leader123`
- `operatore1 / operator123`
- `operatore2 / operator123`

## Evoluzione futura supportata
Il modello dati separa:
- **definizione attività** (`activity_definitions`)
- **assegnazione giornaliera** (`daily_assignments`)
- **execution log append-only** (`execution_logs`)

Questa base permette estensione futura verso moduli ITSM (ticketing, CMDB, compliance, knowledge base) senza rifondazioni strutturali.
