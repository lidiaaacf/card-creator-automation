import pytest

@pytest.mark.unit
def test_get_projects(client, mock_gitlab):
    res = client.get("/get-projects/")
    assert res.status_code == 200
    assert "id" in res.json()[0]
    assert "title" in res.json()[0]