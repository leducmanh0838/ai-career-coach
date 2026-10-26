from rest_framework import generics, permissions


class IsStudentRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "student"


class IsRecruiterRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
                request.user
                and request.user.is_authenticated
                and getattr(request.user, "role", None) == "recruiter"
        )
