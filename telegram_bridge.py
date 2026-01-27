import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from telethon import TelegramClient, events
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# إعدادات Telegram API المقدمة من المستخدم
API_ID = 32853272
API_HASH = '03ae5630ad77963417794b2bf77a9d66'

app = FastAPI(title="Afnan Telegram Bridge")

# تفعيل CORS للسماح لتطبيق الويب بالاتصال بالخادم
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# إنشاء العميل (بدون تشغيل تلقائي لتجنب مشاكل الجلسة في البداية)
client = TelegramClient('afnan_session', API_ID, API_HASH)

class MessageRequest(BaseModel):
    target_id: str
    text: str

@app.get("/")
async def root():
    return {"status": "online", "message": "Afnan Telegram Bridge is running"}

@app.post("/send_message")
async def send_telegram_message(request: MessageRequest):
    try:
        if not client.is_connected():
            await client.connect()
        
        # ملاحظة: يجب أن يكون المستخدم مسجلاً دخوله بالفعل في السيرفر
        # هذا يتطلب تشغيل العميل يدوياً لأول مرة لإدخال الكود
        await client.send_message(request.target_id, request.text)
        return {"status": "success", "message": "Message sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def get_status():
    is_connected = client.is_connected() if hasattr(client, 'is_connected') else False
    return {
        "telegram_connected": is_connected,
        "api_id": API_ID
    }

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
