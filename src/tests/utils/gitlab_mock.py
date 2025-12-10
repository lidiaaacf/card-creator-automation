class FakeIssue:
    def __init__(self, iid=1, title="Fake Issue", description="Descrição"):
        self.iid = iid
        self.title = title
        self.description = description
        self.attributes = {
            "iid": self.iid,
            "title": self.title,
            "description": self.description
        }

class FakeProject:
    def __init__(self, id=1, name="Fake Project", web_url="http://example.com"):
        self.id = id
        self.name = name
        self.web_url = web_url
        self._issues = {1: FakeIssue()}

    @property
    def issues(self):
        return self

    def list(self, scope=None, all=True):
        return list(self._issues.values())

    def get(self, iid):
        return self._issues.get(iid) or FakeIssue(iid=iid)

    def create(self, payload):
        issue = FakeIssue(iid=123, title=payload["title"], description=payload["description"])
        self._issues[123] = issue
        return issue

class FakeGitLab:
    def __init__(self):
        self._projects = {1: FakeProject()}

    @property
    def projects(self):
        return self

    def list(self, **kwargs):
        return list(self._projects.values())

    def get(self, project_id):
        return self._projects.get(project_id) or FakeProject(id=project_id)

def mock_gitlab_instance(mocker):
    fake = FakeGitLab()
    mocker.patch("src.backend.main.gl", fake)
    return fake