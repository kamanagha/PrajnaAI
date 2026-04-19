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


# ✅ REGISTER - creates user with proper hashing
@api_view(['POST'])
def register(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not name or not email or not password:
        return Response({"error": "All fields required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    # 🔥 IMPORTANT: use create_user (handles password hashing)
    user = User.objects.create_user(
        username=email,   # required internally
        email=email,
        password=password,
        name=name
    )

    return Response({
        "message": "User registered successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }, status=status.HTTP_201_CREATED)


# ✅ LOGIN - returns user data with admin status
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)    
    
    # 🔍 Find user by email
    user = User.objects.filter(email=email).first()

    # 🔐 Check password (hashed)
    if user and user.check_password(password):
        tokens = get_tokens_for_user(user)

        # Prepare response with user data including admin status
        response_data = {
            "message": "Login successful",
            "access": tokens['access'],
            "refresh": tokens['refresh'],
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# ✅ GET USER DETAILS (optional - for fetching current user info)
@api_view(['GET'])
def get_user_details(request):
    # Get user from request (you'll need to add authentication)
    user_id = request.query_params.get('user_id')
    
    if not user_id:
        return Response({"error": "User ID required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ UPDATE USER PROFILE (optional)
@api_view(['PUT'])
def update_user_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        
        name = request.data.get('name')
        if name:
            user.name = name
        
        # Only update password if provided
        password = request.data.get('password')
        if password:
            user.set_password(password)
        
        user.save()
        
        return Response({
            "message": "Profile updated successfully",
            "user_id": user.id,
            "name": user.name,
            "email": user.email
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ CHANGE PASSWORD (optional)
@api_view(['POST'])
def change_password(request):
    user_id = request.data.get('user_id')
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user_id or not old_password or not new_password:
        return Response({"error": "All fields required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Verify old password
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ DELETE USER ACCOUNT (admin only - optional)
@api_view(['DELETE'])
def delete_user(request, user_id):
    # You should add admin permission check here
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent deleting superuser accounts
        if user.is_superuser:
            return Response({"error": "Cannot delete superuser account"}, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ GET ALL USERS (admin only - optional)
@api_view(['GET'])
def get_all_users(request):
    # Add admin permission check here
    users = User.objects.all().values('id', 'username', 'email', 'name', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
    return Response(list(users), status=status.HTTP_200_OK)