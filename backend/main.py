from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy import Float, create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import datetime
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------
# 1. CONFIGURATION (The Connection String)
# ---------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin@localhost/pfe_project"

# Create the connection engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ---------------------------------------------------------
# 2. THE DATABASE TABLE ( The Model )
# This creates a table called "logs" automatically
# ---------------------------------------------------------
class LogDB(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String, index=True)   # e.g., "ERROR", "INFO"
    message = Column(String)             # e.g., "Failed to connect"
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    cpu_percent = Column(Float, nullable=True)
    ram_percent = Column(Float, nullable=True)

# Create the tables in the database
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# 3. DATA SHAPES (Pydantic)
# These check that the data sent to us is correct
# ---------------------------------------------------------
class LogCreate(BaseModel):
    level: str
    message: str
    cpu_percent: float | None = None
    ram_percent: float | None = None

# Model for logs arriving from the external monitoring agent.
# timestamp is kept as a raw string so the agent controls the format.
class LogIncoming(BaseModel):
    timestamp: str   # e.g. "2026-03-05 14:22:01"
    level: str       # e.g. "INFO", "ERROR", "CRITICAL"
    message: str     # e.g. "FATAL: Database connection lost"
    cpu_percent: float | None = None
    ram_percent: float | None = None

# ---------------------------------------------------------
# 4. THE SERVER (FastAPI)
# ---------------------------------------------------------
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all websites to talk to us (For development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST: Create a new Log (The Agent will use this!)
@app.post("/logs/")
def create_log(log: LogCreate, db: Session = Depends(get_db)):
    # Create the new log object
    new_log = LogDB(
        level=log.level,
        message=log.message,
        cpu_percent=log.cpu_percent,
        ram_percent=log.ram_percent,
    )
    # Add it to the database
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

# GET: Read all Logs (The Frontend will use this!)
@app.get("/logs/")
def read_logs(db: Session = Depends(get_db)):
    return db.query(LogDB).all()


# ---------------------------------------------------------
# SECURED INGEST ENDPOINT
# Route : POST /api/logs/ingest
# Auth  : X-API-Key header must equal the hardcoded secret
# Usage : Called by the external monitoring / simulator agent
# ---------------------------------------------------------

# Hardcoded API key — replace with an env-var lookup in production.
API_KEY = "super-secret-key-123"


def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    """
    Dependency that extracts the X-API-Key header and validates it.
    Raises HTTP 401 immediately if the key is wrong or missing.
    """
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: invalid or missing X-API-Key header.",
        )
    return x_api_key


@app.post("/api/logs/ingest", status_code=200)
def ingest_log(
    log: LogIncoming,
    db: Session = Depends(get_db),
    _key: str = Depends(verify_api_key),   # 401 if key is wrong
):
    """
    Receive a single log line from the external agent and persist it.

    - Validates the X-API-Key header via the `verify_api_key` dependency.
    - Parses the incoming timestamp string into a Python datetime object.
    - Inserts a new row into the `logs` table using the existing LogDB model.
    """
    # Parse the agent's timestamp string into a proper datetime object.
    # Expected format: "YYYY-MM-DD HH:MM:SS"
    try:
        parsed_ts = datetime.datetime.strptime(log.timestamp, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        # Fall back to current UTC time if the format is unexpected.
        parsed_ts = datetime.datetime.now(datetime.timezone.utc)

    # Build and persist the new log entry.
    new_entry = LogDB(
        level=log.level,
        message=log.message,
        timestamp=parsed_ts,
        cpu_percent=log.cpu_percent,
        ram_percent=log.ram_percent,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {"status": "success", "id": new_entry.id}
