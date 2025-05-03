# Penguin - Desktop Audio Transcriber

This project demonstrates a real-time communication application using FastRTC, featuring a React frontend and a FastAPI backend. The application supports audio and video streaming with speech-to-text transcription.

## Project Structure

```
.
├── backend/      
│   └── main.py
├── frontend/        
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
└── README.md
```

## Technologies Used

*   **Frontend:**
    *   React
    *   Vite
    *   TypeScript
    *   Tailwind CSS
*   **Backend:**
    *   FastAPI
    *   FastRTC
    *   Python

## Getting Started

### Prerequisites

*   Node.js and npm (for frontend)
*   Python 3.x and pip (for backend)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *Note: You might need to create a `requirements.txt` file based on the imports in `main.py`.*
4.  **Run the backend server:**
    ```bash
    fastapi dev main.py
    ```
    The backend will be running on `http://localhost:8000` by default.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:5173` (or another port specified by Vite).

## How it Works

*   The FastAPI backend uses `fastrtc` to handle WebRTC connections for audio/video streaming.
*   It includes an STT (Speech-to-Text) model to transcribe the audio stream in real-time.
*   The `/transcript` endpoint provides the live transcription via Server-Sent Events (SSE).
*   The React frontend connects to the backend's WebRTC stream and displays the video and transcription.
