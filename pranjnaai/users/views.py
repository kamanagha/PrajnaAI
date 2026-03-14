from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User


@api_view(['POST'])
def register(request):

    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(email=email).exists():

        return Response({"error":"Email already exists"})

    user = User.objects.create(

        name=name,
        email=email,
        password=password

    )

    return Response({"message":"User registered"})


@api_view(['POST'])
def login(request):

    email = request.data.get('email')
    password = request.data.get('password')

    try:

        user = User.objects.get(email=email,password=password)

        return Response({

            "message":"Login successful",
            "user_id":user.id,
            "name":user.name

        })

    except:

        return Response({"error":"Invalid credentials"})