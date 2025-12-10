import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.backend.main import Base, get_db, app, IssueFavorite

@pytest.fixture(scope="session")
def db_file():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    try:
        os.remove(path)
    except PermissionError:
        print(f"Não foi possível remover {path}. Feche todas as conexões abertas.")

@pytest.fixture(scope="session")
def engine(db_file):
    engine = create_engine(
        f"sqlite:///{db_file}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

@pytest.fixture(scope="function")
def db(engine):
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSessionLocal()
    session.query(IssueFavorite).delete()
    session.commit()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def mock_gitlab(mocker):
    from src.tests.utils.gitlab_mock import mock_gitlab_instance
    return mock_gitlab_instance(mocker)

@pytest.fixture
def mock_ai(mocker):
    from src.tests.utils.cohere_mock import mock_cohere_openai
    return mock_cohere_openai(mocker)