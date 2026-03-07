import json
from channels.generic.websocket import AsyncWebsocketConsumer


class FraudAlertConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_name = "fraud_alerts"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )
        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "Connected to fraud alert stream",
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        # Clients don't send to this socket — it's receive-only
        pass

    async def fraud_alert(self, event):
        await self.send(text_data=json.dumps({
            "type": "fraud_alert",
            "transaction_id": event["transaction_id"],
            "risk_score": event["risk_score"],
            "amount": event["amount"],
            "user_email": event["user_email"],
            "timestamp": event["timestamp"],
        }))
