import os, requests
from sqlalchemy import create_engine, Column, Integer, Boolean, DateTime, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
CREATE_ISSUE_URL = os.getenv("LOCAL_BACK") + "/create-issue/"
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

# ---------- MODELO - ISSUES VINDAS DO GITLAB ----------
class IssueGitlab(Base):
    __tablename__ = "issues_gitlab"
    id = Column(Integer, primary_key=True, index=True)
    gitlab_id = Column(Integer, unique=True, nullable=False)
    project_id = Column(Integer, nullable=False)
    favorited = Column(Boolean, default=False)
    sent = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow) 

# ---------- MODELO - ISSUES SOMENTE LOCAL ----------
class IssueLocal(Base):
    __tablename__ = "issues_local"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    context = Column(Text, nullable=True)
    weight = Column(Integer, nullable=True)
    issue_type = Column(String, nullable=True)
    favorited = Column(Boolean, default=False)
    sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class IssueLocalRequest(BaseModel):
    project: str
    name: str
    context: str
    weight: int
    issue_type: str

# ---------- ROTAS LOCAL ----------
@router.post("/issues/local")
def save_local_issue(data: IssueLocalRequest, db: Session = Depends(get_db)):
    issue = IssueLocal(
        project_id=data.project,
        name=data.name,
        context=data.context,
        weight=data.weight,
        issue_type=data.issue_type,
        sent=False
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return {"message": "Issue salva localmente", "id": issue.id}

@router.put("/issues/local/{local_id}")
def edit_local_issue(local_id: int, data: IssueLocalRequest, db: Session = Depends(get_db)):
    issue = db.query(IssueLocal).filter(IssueLocal.id == local_id).first()
    if not issue:
        return {"error": "Issue local não encontrada"}

    issue.name = data.name
    issue.context = data.context
    issue.weight = data.weight
    issue.issue_type = data.issue_type

    db.commit()
    db.refresh(issue)
    return {"message": "Issue local atualizada", "id": issue.id}

@router.post("/issues/local/{issue_id}/send")
def send_local_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(IssueLocal).filter(IssueLocal.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue não encontrada")

    payload = {
        "project": str(issue.project_id),
        "name": issue.name,
        "context": issue.context,
        "weight": issue.weight,
        "issue_type": issue.issue_type,
    }

    try:
        resp = requests.post(CREATE_ISSUE_URL, json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Erro ao criar issue via IA: {resp.text}")

        db.delete(issue)
        db.commit()

        return {"message": "Issue enviada para GitLab via IA e removida do banco local", "gitlab_data": resp.json()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar issue: {str(e)}")

@router.delete("/issues/local/{local_id}")
def delete_local_issue(local_id: int, db: Session = Depends(get_db)):
    issue = db.query(IssueLocal).filter(IssueLocal.id == local_id).first()
    if not issue:
        return {"error": "Issue local não encontrada"}
    db.delete(issue)
    db.commit()
    return {"message": f"Issue local {local_id} deletada"}

@router.post("/issues/{origin}/{project_id}/{gitlab_id}/favorite")
def favorite_issue(origin: str, project_id: int, gitlab_id: int, db: Session = Depends(get_db)):
    if origin == "local":
        issue = db.query(IssueLocal).filter(IssueLocal.id == gitlab_id).first()
    else:
        issue = db.query(IssueGitlab).filter(IssueGitlab.gitlab_id == gitlab_id,
                                            IssueGitlab.project_id == project_id).first()
    if not issue:
        return {"error": "Issue não encontrada"}
    issue.favorited = not issue.favorited
    db.commit()
    db.refresh(issue)
    return {"favorited": issue.favorited}

# ---------- ROTAS GITLAB ----------
@router.post("/issues/{project_id}/{gitlab_id}/favorite")
def favorite_issue(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db)
    ):
    
    issue = (db.query(IssueGitlab).filter(IssueGitlab.gitlab_id == gitlab_id,IssueGitlab.project_id == project_id).first())

    if not issue:
        issue = IssueGitlab(gitlab_id=gitlab_id, project_id=project_id)

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
    
    issue = (db.query(IssueGitlab).filter(IssueGitlab.gitlab_id == gitlab_id,IssueGitlab.project_id == project_id).first())
    
    if not issue:
        return {"error": "Issue não encontrada"}
    return {
        "gitlab_id": issue.gitlab_id,
        "project_id": issue.project_id,
        "favorited": issue.favorited,
        "sent": issue.sent,
        "created_at": issue.created_at
    }
