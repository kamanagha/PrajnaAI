from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Material
from .utils import extract_pdf_text, extract_docx_text


@api_view(['POST'])
def upload_material(request):

    file = request.FILES['file']
    title = request.data['title']
    subject = request.data['subject']

    if file.name.endswith('.pdf'):
        content = extract_pdf_text(file)

    elif file.name.endswith('.docx'):
        content = extract_docx_text(file)

    else:
        return Response({"error": "Unsupported file"})

    material = Material.objects.create(
        title=title,
        subject=subject,
        uploaded_file=file,
        structured_content=content
    )

    return Response({"message": "Material Uploaded"})

@api_view(['GET'])
def view_material(request):

    materials = Material.objects.all().values()

    return Response(materials)