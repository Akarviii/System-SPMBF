from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserBasicSerializer
from reservations.models import Reservation
from spaces.serializers import SpaceSerializer

User = get_user_model()


class ReservationPublicSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    space = SpaceSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = ["id", "space", "start_at", "end_at", "status", "label"]

    def get_label(self, obj):
        return "Ocupado"


class ReservationAdminSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)
    approved_by = UserBasicSerializer(read_only=True)
    space = SpaceSerializer(read_only=True)

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
        fields = ["title", "description", "start_at", "end_at", "space"]
        extra_kwargs = {
            'space': {'required': False, 'allow_null': True}
        }


class ReservationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["title", "description", "start_at", "end_at", "status", "decision_note"]
        read_only_fields = ["status", "decision_note"]


class ReservationDecisionSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)
