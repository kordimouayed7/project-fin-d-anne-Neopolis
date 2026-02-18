from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------
# 1. CONFIGURATION (The Connection String)
# Format: postgresql://user:password@localhost/database_name
# CHANGE "YOUR_PASSWORD" below!
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
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Create the tables in the database
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# 3. DATA SHAPE (Pydantic)
# This checks that the data sent to us is correct
# ---------------------------------------------------------
class LogCreate(BaseModel):
    level: str
    message: str

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
    new_log = LogDB(level=log.level, message=log.message)
    # Add it to the database
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

# GET: Read all Logs (The Frontend will use this!)
@app.get("/logs/")
def read_logs(db: Session = Depends(get_db)):
    return db.query(LogDB).all()
