from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# 🔑 GENERATE JWT TOKENS
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ✅ REGISTER (FIXED - uses Django hashing)
@api_view(['POST'])
def register(request):

    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not name or not email or not password:
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    # 🔥 IMPORTANT: use create_user (handles hashing)
    user = User.objects.create_user(
        username=email,   # required internally
        email=email,
        password=password,
        name=name
    )

    return Response({
        "message": "User registered successfully"
    }, status=201)


# ✅ LOGIN (FIXED - uses authenticate)
@api_view(['POST'])
def login(request):

    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)    
    
    # 🔍 Find user by email
    user = User.objects.filter(email=email).first()

    # 🔐 Check password (hashed)
    if user and user.check_password(password):

        tokens = get_tokens_for_user(user)

        return Response({
            "message": "Login successful",
            "access_token": tokens['access'],
            "refresh_token": tokens['refresh'],
            "user_id": user.id,
            "name": user.name
        }, status=200)

    return Response({"error": "Invalid credentials"}, status=401)