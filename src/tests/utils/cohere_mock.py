class FakeCompletion:
    class Choice:
        class Message:
            content = "Descrição gerada pela AI"
        message = Message()
    choices = [Choice()]

class FakeOpenAI:
    class chat:
        class completions:
            @staticmethod
            def create(model, messages):
                return FakeCompletion()

def mock_cohere_openai(mocker):
    fake = FakeOpenAI()
    mocker.patch("src.backend.main.OpenAI", lambda *args, **kwargs: fake)
    return fake