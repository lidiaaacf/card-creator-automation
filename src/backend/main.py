import os
from datetime import datetime
import cohere
import gitlab
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import Session, sessionmaker

load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL")
PRIVATE_TOKEN = os.getenv("GITLAB_TOKEN")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
LOCAL_FRONT = os.getenv("LOCAL_FRONT")
IP_FRONT = os.getenv("IP_FRONT")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./issues.db")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    """Dependência para obter a sessão do banco."""
    with SessionLocal() as db:
        yield db


class IssueFavorite(Base):
    __tablename__ = "issues_favorite"

    id = Column(Integer, primary_key=True, index=True)
    gitlab_id = Column(Integer, unique=True, nullable=False)
    project_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    context = Column(Text, nullable=True)
    weight = Column(String, nullable=True)
    favorited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[LOCAL_FRONT, IP_FRONT],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

co = cohere.Client(COHERE_API_KEY)
gl = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN)
class IssueRequest(BaseModel):
    project: str     # ID ou path do projeto no GitLab
    title: str       # Título da issue
    context: str     # Contexto do problema
    weight: str      # Peso/estimativa (1,2,3,5,8,13)
    issue_type: str  # Ex: Bug levantado, New feature, Ajuste

@app.post("/create-issue/")
async def create_issue(issue: IssueRequest):
    """
    Cria issues de acordo com o template padrão, usando Cohere para gerar a descrição
    e GitLab para criar a issue de fato.
    """
    prompt = f"""
        Gere uma issue seguindo o seguinte template, completando somente as partes indicadas sem exceção.

        ### CONTEXTO ###
        {issue.context} (Aqui nessa sessão pode melhorar o detalhamento do contexto porém de forma breve)

        ### NÃO CONFORMIDADE ###
        Descreva detalhadamente a inconformidade, mantendo a formatação Markdown.

        ### AÇÕES ESPERADAS ###
        Liste os passos esperados para resolver a inconformidade em formato de checkbox
        - [ ] Cada tópico deve ser listado assim
    """

    try:
        client = OpenAI(
            base_url="https://api.cohere.ai/compatibility/v1",
            api_key=COHERE_API_KEY,
        )

        completion = client.chat.completions.create(
            model="command-a-03-2025",
            messages=[{"role": "user", "content": prompt}],
        )

        description = completion.choices[0].message.content
        project = gl.projects.get(issue.project)
        labels_list = [issue.weight, "QA", issue.issue_type, "Ready"]
        created_issue = project.issues.create({
            "title": issue.title,
            "description": description,
            "labels": labels_list
        })

        return {
            "gitlab_id": created_issue.iid,
            "title": issue.title,
            "description": description,
            "weight": issue.weight,
            "type": issue.issue_type,
            "project": issue.project
        }

    except Exception as e:
        print("ERRO NA API COHERE OU GITLAB:", str(e))
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")
    
@app.get("/get-projects/")
def get_projects():
    """
    Lista os projetos do GitLab nos quais o token possui acesso.
    """
    projects = gl.projects.list(owned=True, membership=True, all=True)
    full_projects = [gl.projects.get(p.id) for p in projects]
    return [{"id": p.id, "title": p.name, "web_url": p.web_url} for p in full_projects]

@app.get("/get-automation-issues/")
def get_automation_issues(
    project_id: int = Query(..., description="ID do projeto"),
    db: Session = Depends(get_db),
):
    """
    Retorna issues criadas pelo usuário atual no GitLab,
    indicando quais estão favoritadas localmente.
    """
    project = gl.projects.get(project_id)
    issues = project.issues.list(scope="created_by_me", all=True)

    favorites = {
        fav.gitlab_id
        for fav in db.query(IssueFavorite)
        .filter(IssueFavorite.project_id == project_id, IssueFavorite.favorited == True)
        .all()
    }

    response = []
    for issue in issues:
        data = issue.attributes.copy()
        data["favorited"] = issue.iid in favorites
        response.append(data)

    return response


@app.post("/issues/{project_id}/{gitlab_id}/favorite")
def toggle_favorite(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db),
):
    """
    Marca ou desmarca uma issue como favorita localmente.
    """
    fav = (
        db.query(IssueFavorite)
        .filter(
            IssueFavorite.gitlab_id == gitlab_id,
            IssueFavorite.project_id == project_id,
        )
        .first()
    )

    if not fav:
        git_issue = gl.projects.get(project_id).issues.get(gitlab_id)
        weight_value = getattr(git_issue, "weight", None)
        fav = IssueFavorite(
            gitlab_id=gitlab_id,
            project_id=project_id,
            title= git_issue.title,
            context=git_issue.description,
            weight=str(weight_value) if weight_value else None,
            favorited=True,
        )
        db.add(fav)
    else:
        fav.favorited = not fav.favorited


    db.commit()
    db.refresh(fav)
    return {"gitlab_id": gitlab_id, "project_id": project_id, "favorited": fav.favorited}


@app.get("/issues/{project_id}/{gitlab_id}")
def get_issue_details(
    project_id: int,
    gitlab_id: int,
    db: Session = Depends(get_db),
):
    """
    Retorna detalhes armazenados localmente de uma issue favoritada.
    """
    fav = (
        db.query(IssueFavorite)
        .filter(
            IssueFavorite.gitlab_id == gitlab_id,
            IssueFavorite.project_id == project_id,
        )
        .first()
    )

    if not fav:
        return {"error": "Issue não encontrada no banco local"}

    return {
        "gitlab_id": fav.gitlab_id,
        "project_id": fav.project_id,
        "title": fav.title,
        "context": fav.context,
        "weight": fav.weight,
        "favorited": fav.favorited,
        "created_at": fav.created_at,
    }