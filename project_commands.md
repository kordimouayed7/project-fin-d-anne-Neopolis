Project Runbook (Windows)
=========================

This file explains how to run the full project step by step:
- FastAPI backend
- React frontend
- File log agent (hospital simulator)
- Windows OS agent (Event Viewer)


1) Open terminal in project root
-------------------------------
Path:
`D:\project-fin-d-anne-Neopolis-main`


2) Activate Python virtual environment
--------------------------------------
PowerShell:
```powershell
& .\.venv\Scripts\Activate.ps1
```


3) Install backend dependencies (if needed)
-------------------------------------------
From project root:
```powershell
pip install fastapi uvicorn sqlalchemy psycopg2-binary requests pywin32 psutil
```


4) Start FastAPI backend
------------------------
From project root:
```powershell
uvicorn backend.main:app --reload
```

Backend URL:
- http://127.0.0.1:8000


5) Start frontend (React + Vite)
--------------------------------
Open a second terminal in project root:
```powershell
cd frontend
npm install
npm run dev
```

Frontend URL (usually):
- http://127.0.0.1:5173


6) Start log file agent (optional stream)
-----------------------------------------
Open an extra terminal in `backend`:

Terminal:
```powershell
cd backend
python log_agent.py
```


7) Start Windows Event Viewer OS agent
--------------------------------------
Open another terminal in `backend`:
```powershell
cd backend
python os_agent.py
```

This agent watches Application/System/Security logs and forwards events to:
- POST /api/logs/ingest


8) Generate WARNING/ERROR test events for OS agent
---------------------------------------------------
Run the following in PowerShell as Administrator.

Application ERROR:
```powershell
eventcreate /t ERROR /id 1000 /l APPLICATION /d "PFE Test Error: The Database connection failed abruptly."
```

Application WARNING:
```powershell
eventcreate /t WARNING /id 1001 /l APPLICATION /d "PFE Test Warning: API latency exceeded threshold."
```

System ERROR:
```powershell
eventcreate /t ERROR /id 2000 /l SYSTEM /d "PFE Test Error: Service heartbeat timeout detected."
```

System WARNING:
```powershell
eventcreate /t WARNING /id 2001 /l SYSTEM /d "PFE Test Warning: Disk queue length is elevated."
```

Optional INFO (for comparison):
```powershell
eventcreate /t INFORMATION /id 3000 /l APPLICATION /d "PFE Test Info: Normal maintenance cycle completed."
```


9) Check data in PostgreSQL
---------------------------
Example query:
```sql
SELECT id, timestamp, level, message, cpu_percent, ram_percent
FROM logs
ORDER BY id DESC
LIMIT 30;
```

Expected:
- `level` should include INFO, WARNING, ERROR
- `cpu_percent` and `ram_percent` should be non-null for logs sent by `os_agent.py`


10) Troubleshooting quick checks
--------------------------------
- If OS agent sends nothing:
	- confirm backend is running on port 8000
	- confirm API key in `backend/os_agent.py` matches `backend/main.py`
	- run PowerShell as Administrator for `eventcreate`
- If cpu/ram are null:
	- restart FastAPI after code changes
	- verify new rows only (old rows remain null)
