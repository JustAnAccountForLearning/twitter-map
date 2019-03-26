import datetime

from django.db import models
from django.utils import timezone

class Twitter(models.Model):
    content = models.CharField(max_length=280)
    hashtag = models.CharField(max_length=200)
    timestamp = models.DateTimeField()
    longitude = models.FloatField()
    latitude = models.FloatField()
    def __str__(self):
        # TODO: What are we actually returning here?
        return 0
    def hashtagged(self):
        return self.hashtag
