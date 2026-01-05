from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Used for:
    - Admin user listing
    - Current logged-in user (/me)
    """
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Used for:
    - Customer registration
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            role='CUSTOMER'
        )
        return user
