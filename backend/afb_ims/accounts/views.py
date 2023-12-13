from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

# CUSTOM AUTH TOKEN
class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            # Handle the exception here, e.g., for invalid login credentials
            return Response({'error': 'Invalid username or password!'}, status=400)

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_staff': user.is_staff,
        })
