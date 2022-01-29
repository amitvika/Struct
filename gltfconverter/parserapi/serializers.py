from rest_framework import serializers
from .models import File, ParsingDetails, ChildParsingDetails, EdgeParsingDetails, ItemDetails

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"

class ParsingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParsingDetails
        fields = "__all__"

class EdgeParsingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EdgeParsingDetails
        fields = "__all__"

class ChildParsingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildParsingDetails
        fields = "__all__"

class ItemDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemDetails
        fields = "__all__"