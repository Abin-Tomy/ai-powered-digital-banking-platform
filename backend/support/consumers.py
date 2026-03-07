import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_name = f"chat_{self.user_id}"

        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name,
        )
        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "Connected to support chat",
            "timestamp": timezone.now().isoformat(),
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message = data.get('message', '').strip()
        sender = data.get('sender', 'unknown')
        sender_role = data.get('sender_role', 'CUSTOMER')

        if not message:
            return

        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": sender,
                "sender_role": sender_role,
                "timestamp": timezone.now().isoformat(),
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
            "sender": event["sender"],
            "sender_role": event["sender_role"],
            "timestamp": event["timestamp"],
        }))
