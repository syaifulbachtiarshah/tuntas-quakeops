import os


MODEL = os.getenv("TUNTAS_MODEL", "gemini-3.7-flash")
APP_NAME = "tuntas-quakeops"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "TUNTAS_ALLOWED_ORIGINS",
        (
            "https://tuntas-quakeops-preview.syaiful752412.chatgpt.site,"
            "http://localhost:5173"
        ),
    ).split(",")
    if origin.strip()
]
