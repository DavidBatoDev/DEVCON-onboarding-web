from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI()

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app

app = create_app()