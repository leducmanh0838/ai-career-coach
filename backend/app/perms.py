from rest_framework import generics, permissions

class IsStudentRole(permissions.BasePermission):
    """Phân quyền: Chỉ cho phép tài khoản có role là student"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "student"