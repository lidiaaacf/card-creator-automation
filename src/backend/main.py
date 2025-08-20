import os
import gitlab
import cohere
import sqlite3 
from fastapi import Query
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from database import router as database_router
from fastapi.middleware.cors import CORSMiddleware
from database import Session, get_db, IssueLocal, Depends

load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL")
PRIVATE_TOKEN = os.getenv("GITLAB_TOKEN")
PROJECT_ID = int(os.getenv("GITLAB_PROJECT_ID"))
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
LOCAL_FRONT = os.getenv("LOCAL_FRONT")
LOCAL_BACK = os.getenv("LOCAL_BACK")

app = FastAPI() 

co = cohere.ClientV2(COHERE_API_KEY)
gl = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN)
app.include_router(database_router, prefix="/db")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[LOCAL_FRONT, LOCAL_BACK],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IssueRequest(BaseModel):
    projeto: str           # Projeto onde a issue será criada
    name: str              # Título da issue
    context: str           # Contexto da inconformidade
    weight: int            # Peso (1, 2, 3, 5, 8, 13)
    issue_type: str        # Label principal (Bug levantado, New feature, Ajuste, )
    client: str            # Nome do grupo/cliente 
    screen: str            # Tela afetada
    # screenshot_url: str    # Screenshot mostrando a inconformidade

@app.post("/create-issue/")
def create_issue(data: IssueRequest):
    """
    Cria issues de acordo com o template padrão e via parâmetros passados.
    """
    if " " in data.issue_type:
        tipo_issue_md = f"{data.issue_type}"
    else:
       tipo_issue_md = data.issue_type
        
    prompt = f"""
    Gere uma issue seguindo o seguinte template, completando somente as partes indicadas sem excessão
    
    ### CONTEXTO ###
    {data.context} (Aqui nessa sessão pode melhorar o detalhamento do contexto porém de forma breve)

    ### TIPO DE ISSUE ###
    ~{data.weight}  ~QA  ~{tipo_issue_md}

    ### LOCAL ###
    - Grupo: {data.client}  
    - Link: https://dataself.com.br/{data.screen} 

    ### NÃO CONFORMIDADE ###
    Descreva detalhadamente a inconformidade, mantendo a formatação Markdown.   

    ### AÇÕES ESPERADAS ###
    Liste os passos esperados para resolver a inconformidade em formato de checkbox
    
    - [ ] Cada tópico deve ser listado assim
    """

    response = co.chat( 
        model="command-a-03-2025", 
        messages=[{"role": "user", "content": prompt}] 
    ) 
    
    description = ""
    
    if hasattr(response.message, "content") and isinstance(response.message.content, list):
        for item in response.message.content:
            if getattr(item, "type", None) == "text":
                description += item.text + "\n"
    else:
        raise ValueError(f"Unexpected Cohere response format: {response}")

    project = gl.projects.get(project)
    
    labels_list = [data.weight, "QA", data.issue_type, "Ready"]

    issue = project.issues.create({
        "title": f"{data.name}",
        "description": description,
        "labels": labels_list
    })

    return {"message": "Issue criada com sucesso", "url": issue.web_url}  

@app.get("/get-automation-issues/")
def get_automation_issues(project_id: int = Query(..., description="ID do projeto"), db: Session = Depends(get_db)):
    project = gl.projects.get(project_id)
    issues = project.issues.list(scope="created_by_me", all=True)

    favorites = {
        issue.gitlab_id for issue in db.query(IssueLocal).filter(
            IssueLocal.project_id == project_id,
            IssueLocal.favorited == True
        ).all()
    }

    response = []
    for issue in issues:
        data = issue.attributes.copy()
        data["favorited"] = issue.iid in favorites
        response.append(data)

    return response


@app.get("/get-projects/")
def get_projects():
    try:
        projects = gl.projects.list(owned=True, membership=True, all=True)
        project_list = [
            {"id": p.id, "name": p.name, "web_url": p.web_url}
            for p in projects
        ]
        return project_list
    except Exception as e:
        return {"error": str(e)} 