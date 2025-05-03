from fastrtc import (ReplyOnPause, Stream, get_stt_model,AdditionalOutputs)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Initialize STT model
stt_model = get_stt_model()

def echo(audio):
    _, array = audio
    audio_text = stt_model.stt(audio)
    print("Transcribed text:", audio_text)
    yield AdditionalOutputs(audio_text)

# Create stream
stream = Stream(ReplyOnPause(echo), modality="audio-video", mode="send-receive")

# Configure CORS
origins = ['*']

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the stream to the app
stream.mount(app)

class SendInput(BaseModel):
    webrtc_id: str
    transcript: str

@app.get("/")
async def root():
    return {"message": "Hello, world!"}

@app.get("/transcript")
def _(webrtc_id: str):
    async def output_stream():
        async for output in stream.output_stream(webrtc_id):
            transcript = output.args[0].split("\n")[-1]
            yield f"event: output\ndata: {transcript}\n\n"

    return StreamingResponse(output_stream(), media_type="text/event-stream")