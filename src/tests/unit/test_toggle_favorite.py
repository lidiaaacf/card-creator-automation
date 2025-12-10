from src.tests.utils.factories import make_favorite
from src.backend.main import IssueFavorite

def test_toggle_favorite_creates(client, db, mock_gitlab):
    db.query(IssueFavorite).delete()
    db.commit()

    response = client.post(f"/issues/1/1/favorite")
    assert response.status_code == 200
    assert response.json()["favorited"] is True

def test_toggle_favorite_switch(client, db, mock_gitlab):
    db.query(IssueFavorite).delete()
    db.commit()

    db.add(IssueFavorite(
        gitlab_id=1,
        project_id=1,
        title="Teste",
        favorited=True
    ))
    db.commit()

    res = client.post("/issues/1/1/favorite")
    assert res.json()["favorited"] is False