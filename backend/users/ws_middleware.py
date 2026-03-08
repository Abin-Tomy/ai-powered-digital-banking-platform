from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs


@database_sync_to_async
def _get_user_from_token(token_str):
    try:
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from rest_framework_simplejwt.backends import TokenBackend
        from django.contrib.auth import get_user_model
        from django.conf import settings

        UntypedToken(token_str)
        jwt_settings = getattr(settings, 'SIMPLE_JWT', {})
        algorithm = jwt_settings.get('ALGORITHM', 'HS256')
        signing_key = jwt_settings.get('SIGNING_KEY', settings.SECRET_KEY)
        data = TokenBackend(algorithm=algorithm, signing_key=signing_key).decode(token_str, verify=True)
        User = get_user_model()
        return User.objects.get(id=data['user_id'])
    except Exception:
        return AnonymousUser()


class JwtAuthMiddleware:
    """Attach a JWT-authenticated user to WS scope when ?token= query param is present."""

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'websocket':
            query_string = scope.get('query_string', b'').decode()
            params = parse_qs(query_string)
            token_list = params.get('token', [])
            if token_list:
                scope['user'] = await _get_user_from_token(token_list[0])
        return await self.inner(scope, receive, send)
