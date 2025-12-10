from src.backend.main import IssueFavorite

def make_favorite(session, project_id=1, gitlab_id=1, favorited=True):
    fav = IssueFavorite(
        gitlab_id=gitlab_id,
        project_id=project_id,
        title="Test",
        context="Context",
        weight="3",
        favorited=favorited,
    )
    session.add(fav)
    session.commit()
    return fav