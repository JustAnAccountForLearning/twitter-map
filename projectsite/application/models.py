import datetime

from django.db import models
from django.utils import timezone

# This is the object that each line pulls from our database.
# TODO: Update to correctly reflect the values stored in our database
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
