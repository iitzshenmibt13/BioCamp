"""WebSocket connection manager + router."""
import json
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.auth.jwt import decode_token

ws_router = APIRouter()


class WebSocketManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict[str, Any]):
        data = json.dumps(message)
        disconnected = []
        for ws in self.active:
            try:
                await ws.send_text(data)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.disconnect(ws)


ws_manager = WebSocketManager()


@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Validate token
    try:
        decode_token(token)
    except ValueError:
        await websocket.close(code=4001)
        return

    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep alive – ignore incoming messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
