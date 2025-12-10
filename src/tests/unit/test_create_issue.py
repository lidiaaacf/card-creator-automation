def test_create_issue(client, mock_gitlab, mock_ai):
    payload = {
        "project": "1",
        "title": "Bug test",
        "context": "Erro encontrado",
        "weight": "3",
        "issue_type": "bug"
    }
    res = client.post("/create-issue/", json=payload)
    assert res.status_code == 200
    assert "description" in res.json()
    assert res.json()["title"] == "Bug test"