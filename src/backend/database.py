import os
from sqlalchemy import create_engine, Column, Integer, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from dotenv import load_dotenv
from fastapi import APIRouter, Depends

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- MODELO ----------
class IssueLocal(Base):
    __tablename__ = "issues"
    id = Column(Integer, primary_key=True, index=True)
    gitlab_id = Column(Integer, unique=True, nullable=False)
    project_id = Column(Integer, nullable=False)
    favorited = Column(Boolean, default=False)
    sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ---------- ROTAS ----------
@router.post("/issues/{project_id}/{gitlab_id}/favorite")
def favorite_issue(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db)
    ):
    
    issue = (db.query(IssueLocal).filter(IssueLocal.gitlab_id == gitlab_id,IssueLocal.project_id == project_id).first())

    if not issue:
        issue = IssueLocal(gitlab_id=gitlab_id, project_id=project_id)

    issue.favorited = not issue.favorited
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return {"gitlab_id": gitlab_id, "project_id": project_id, "favorited": issue.favorited}

@router.get("/issues/{project_id}/{gitlab_id}")
def get_issue_details(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db)
    ):
    
    issue = (db.query(IssueLocal).filter(IssueLocal.gitlab_id == gitlab_id,IssueLocal.project_id == project_id).first())
    
    if not issue:
        return {"error": "Issue não encontrada"}
    return {
        "gitlab_id": issue.gitlab_id,
        "project_id": issue.project_id,
        "favorited": issue.favorited,
        "sent": issue.sent,
        "created_at": issue.created_at
    }

@router.post("/issues/{project_id}/{gitlab_id}/send")
def send_issue(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db)
    ):
    
    issue = (db.query(IssueLocal).filter(IssueLocal.gitlab_id == gitlab_id,IssueLocal.project_id == project_id).first())
    
    if not issue:
        return {"error": "Issue não encontrada"}
    issue.sent = True
    db.commit()
    db.refresh(issue)
    return {"gitlab_id": gitlab_id, "sent": issue.sent}

@router.delete("/issues/{project_id}/{gitlab_id}")
def delete_issue(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db)
    ):
    
    issue = (db.query(IssueLocal).filter(IssueLocal.gitlab_id == gitlab_id,IssueLocal.project_id == project_id).first())
    
    if not issue:
        return {"error": "Issue não encontrada"}
    db.delete(issue)
    db.commit()
    return {"message": f"Issue {gitlab_id} deletada do banco local"}
