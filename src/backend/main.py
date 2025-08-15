import os
import gitlab
import cohere
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL")
PRIVATE_TOKEN = os.getenv("GITLAB_TOKEN")
PROJECT_ID = int(os.getenv("GITLAB_PROJECT_ID"))
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

co = cohere.ClientV2(COHERE_API_KEY)
gl = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN)

app = FastAPI()

class IssueRequest(BaseModel):
    name: str              # Título da issue
    context: str           # Contexto da inconformidade
    complexity: int        # Peso (1, 2, 3, 5, 8, 13)
    issue_type: str        # Label principal (Bug levantado, New feature, Ajuste, )
    client: str            # Nome do grupo/cliente 
    screen: str            # Tela afetada
    screenshot_url: str    # Screenshot mostrando a inconformidade

@app.post("/create-issue/")
def create_issue(data: IssueRequest):
    if " " in data.issue_type:
        tipo_issue_md = f"{data.issue_type}"
    else:
       tipo_issue_md = data.issue_type
        
    prompt = f"""
    Gere uma issue seguindo o seguinte template, completando somente as partes indicadas sem excessão
    
    ### CONTEXTO ###
    {data.context} (Aqui nessa sessão pode melhorar o detalhamento do contexto porém de forma breve)

    ### TIPO DE ISSUE ###
    ~{data.complexity}  ~QA  ~{tipo_issue_md}

    ### LOCAL ###
    - Grupo: {data.client}  
    - Link: https://dataself.com.br/{data.screen}

    ### NÃO CONFORMIDADE ###
    Descreva detalhadamente a inconformidade, mantendo a formatação Markdown.  
    Inclua também o screenshot no seguinte formato: 
    ![Screenshot]({data.screenshot_url})

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

    project = gl.projects.get(PROJECT_ID)
    
    labels_list = [data.complexity, "QA", data.issue_type, "Ready"]

    issue = project.issues.create({
        "title": f"{data.issue_type.upper()} - {data.name}",
        "description": description,
        "labels": labels_list
    })

    return {"message": "Issue criada com sucesso", "url": issue.web_url}
