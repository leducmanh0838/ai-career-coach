from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "success",
        "message": "Django backend đang chạy rất mượt!"
    })