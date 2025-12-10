from src.tests.utils.factories import make_favorite

def test_get_automation_issues(client, db, mock_gitlab):
    make_favorite(db, project_id=1, gitlab_id=1, favorited=True)
    res = client.get("/get-automation-issues/?project_id=1")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert res.json()[0]["favorited"] is True
