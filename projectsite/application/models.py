import datetime

from django.db import models
from django.utils import timezone

# This is the object that each line pulls from our database.
# TODO: Update to correctly reflect the values stored in our database
class Twitter(models.Model):
    geo = models.CharField(max_length=200)
    coordinate = models.CharField(max_length=200)
    geotype = models.CharField(max_length=200)
    tweet = models.CharField(max_length=280)
    user_id = models.IntegerField()
    tag = models.CharField(max_length=200)
    
    def __str__(self):
        return self.tweet
    def gettag(self):
        return self.tag
