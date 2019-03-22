import datetime

from django.db import models
from django.utils import timezone

# TODO: Update fields to match our twitter information database.
# What information are we actually storing and using from twitter?
class Twitter(models.Model):
    content = models.CharField(max_length=280)
    hashtag = models.CharField(max_length=200)
    timestamp = models.DateTimeField()
    longitude = models.FloatField()
    latitude = models.FloatField()
    def __str__(self):
        return self.content
    def hashtagged(self):
        return self.hashtag
