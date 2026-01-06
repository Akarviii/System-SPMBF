from django.contrib.auth import get_user_model
from rest_framework import serializers

from reservations.models import Reservation

User = get_user_model()


class ReservationPublicSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ["id", "space", "start_at", "end_at", "status", "label"]

    def get_label(self, obj):
        return "Ocupado"


class ReservationAdminSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    approved_by = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Reservation
        fields = [
            "id",
            "space",
            "created_by",
            "title",
            "description",
            "start_at",
            "end_at",
            "status",
            "approved_by",
            "decision_at",
            "decision_note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "approved_by", "decision_at", "decision_note", "created_at", "updated_at"]


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["title", "description", "start_at", "end_at"]


class ReservationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["title", "description", "start_at", "end_at", "status", "decision_note"]
        read_only_fields = ["status", "decision_note"]


class ReservationDecisionSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)
