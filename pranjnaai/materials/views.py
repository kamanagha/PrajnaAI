from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse

from .models import Material
from .utils import extract_pdf_text, extract_docx_text

import re

# Function to structure content like W3Schools style
# Function to structure content properly
def structure_content(content):
    """
    Improved content splitter:
    - Detect headings if line is fully uppercase or ends with ":"
    - Merge broken lines for headings
    - Keep numbered steps or bullets intact
    """
    lines = content.split("\n")
    structured = []
    current_heading = "Introduction"
    current_content = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # New heading detection
        is_heading = line.isupper() or line.endswith(":")
        if is_heading:
            # Save previous section
            if current_content:
                structured.append({
                    "heading": current_heading,
                    "content": "\n".join(current_content).strip()
                })
            current_heading = line
            current_content = []
        else:
            current_content.append(line)

    # Add last section
    if current_content:
        structured.append({
            "heading": current_heading,
            "content": "\n".join(current_content).strip()
        })

    return structured


# ✅ UPLOAD MATERIAL
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_material(request):
    try:
        user = request.user
        file = request.FILES.get("file")
        title = request.data.get("title")
        subject = request.data.get("subject")

        if not file:
            return Response({"error": "File required"}, status=400)

        # Detect file type & extract text
        if file.name.endswith(".pdf"):
            content = extract_pdf_text(file)
            file_type = "PDF"
        elif file.name.endswith(".docx"):
            content = extract_docx_text(file)
            file_type = "DOC"
        elif file.name.endswith(".txt"):
            content = file.read().decode("utf-8")
            file_type = "NOTE"
        else:
            return Response({"error": "Unsupported file type"}, status=400)

        # Structure content for W3Schools-style
        structured_data = structure_content(content)

        # Format content into readable plain text for frontend
        formatted_content = ""
        for sec in structured_data:
            formatted_content += f"{sec['heading']}\n{'-'*len(sec['heading'])}\n{sec['content']}\n\n"

        # Save material
        material = Material.objects.create(
            title=title,
            subject=subject,
            uploaded_file=file,
            structured_content=formatted_content.strip(),
            file_type=file_type,
            user=user
        )

        return Response({"message": "Material uploaded", "id": material.id})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ✅ VIEW MATERIALS
@api_view(['GET'])
def view_materials(request):
    materials = Material.objects.all().values(
        "id", "title", "subject", "file_type", "uploaded_file", "user_id"
    )
    return Response(list(materials))


# ✅ MATERIAL DETAIL
@api_view(['GET'])
def material_detail(request, id):
    try:
        material = Material.objects.get(id=id)
        return Response({
            "id": material.id,
            "title": material.title,
            "subject": material.subject,
            "file_type": material.file_type,
            "content": material.structured_content,  # Plain formatted text
            "file_url": material.uploaded_file.url,
            "owner": material.user.id
        })
    except Material.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)


# ✅ DELETE MATERIAL
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_material(request, id):
    try:
        material = Material.objects.get(id=id)
        if material.user != request.user:
            return Response({"error": "Unauthorized"}, status=403)
        material.uploaded_file.delete()
        material.delete()
        return Response({"message": "Material deleted successfully"})
    except Material.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)


# ✅ DOWNLOAD MATERIAL
@api_view(['GET'])
def download_material(request, id):
    try:
        material = Material.objects.get(id=id)
        return FileResponse(
            material.uploaded_file.open(),
            as_attachment=True,
            filename=material.uploaded_file.name
        )
    except Material.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)