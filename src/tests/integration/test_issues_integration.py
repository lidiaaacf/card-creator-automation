import pytest
from src.backend.main import IssueFavorite

@pytest.mark.integration
def test_toggle_favorite_creates(client, db, mock_gitlab):
    project_id = 1
    gitlab_id = 1
    response = client.post(f"/issues/{project_id}/{gitlab_id}/favorite")

    assert response.status_code == 200
    data = response.json()
    assert data["favorited"] is True

    fav_in_db = db.query(IssueFavorite).filter_by(project_id=project_id, gitlab_id=gitlab_id).first()
    assert fav_in_db is not None
    assert fav_in_db.favorited is True

@pytest.mark.integration
def test_toggle_favorite_switch(client, db, mock_gitlab):
    fav = IssueFavorite(
        gitlab_id=1,
        project_id=1,
        title="Teste",
        context="Contexto",
        weight="3",
        favorited=True,
    )
    db.add(fav)
    db.commit()

    response = client.post("/issues/1/1/favorite")
    assert response.status_code == 200
    data = response.json()
    assert data["favorited"] is False

    fav_in_db = db.query(IssueFavorite).filter_by(project_id=1, gitlab_id=1).first()
    assert fav_in_db.favorited is False

@pytest.mark.integration
def test_create_issue(client, mock_gitlab, mock_ai):
    payload = {
        "project": "1",
        "title": "Bug de integração",
        "context": "Erro encontrado",
        "weight": "3",
        "issue_type": "bug"
    }

    res = client.post("/create-issue/", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "description" in data
    assert data["title"] == "Bug de integração"
    
from src.backend.main import IssueFavorite

@pytest.mark.integration
def test_get_automation_issues(client, db, mock_gitlab):
    gitlab_id = mock_gitlab.projects.get(1).list()[0].iid

    db.add(IssueFavorite(gitlab_id=gitlab_id, project_id=1, title="Teste", favorited=True))
    db.commit()

    res = client.get("/get-automation-issues/?project_id=1")
    assert res.status_code == 200
    issues = res.json()
    assert isinstance(issues, list)
    found = any(issue.get("favorited") for issue in issues if issue.get("gitlab_id") == gitlab_id)
    assert found is True
