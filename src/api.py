from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import shutil, os, uuid

from main import main

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
DIST_DIR = "dist"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Serve frontend
app.mount("/static", StaticFiles(directory=DIST_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def index():
    with open(os.path.join(DIST_DIR, "index.html")) as f:
        return f.read()


@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    uid = uuid.uuid4().hex
    path = f"{UPLOAD_DIR}/{uid}_{file.filename}"

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = main(path)

    return result


@app.get("/file")
def get_file(path: str):
    return FileResponse(path)
