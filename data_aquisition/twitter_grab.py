# -*- coding: utf-8 -*-
"""
Created on Wed Mar 20 07:40:08 2019

@author: mgreen13
"""

import tweepy
from tweepy import Stream
from tweepy.streaming import StreamListener 
from tweepy import OAuthHandler
import json


with open ("access_info.json","r") as file:
    creds = json.load(file)
    
creds["APP_KEY"]    
    
APP_KEY = creds["APP_KEY"]
APP_SECRET = creds["APP_SECRET"]
ACCESS_TOKEN = creds["ACCESS_TOKEN"]
ACCESS_SECRET = creds["ACCESS_SECRET"]


 
auth = OAuthHandler(APP_KEY, APP_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)
 
api = tweepy.API(auth)

# clever method to parse incoming tweets to json
@classmethod
def parse(cls, api, raw):
    status = cls.first_parse(api, raw)
    setattr(status, 'json', json.dumps(raw))
    return status
 
# Status() is the data model for a tweet
tweepy.models.Status.first_parse = tweepy.models.Status.parse
tweepy.models.Status.parse = parse

# open file tweets.json and save tweets json data to a line
class MyListener(StreamListener):
    def on_data(self, data):
        try:
            with open('tweets_bernie.json', 'a') as f:
                f.write(data)
                return True
        except BaseException as e:
            print("Error on_data: %s" % str(e))
        return True
 
    def on_error(self, status):
        print(status)
        return True

# create tweepy stream object
twitter_stream = Stream(auth, MyListener())
# select hashtag to be filtered, need to cut off manually 
tag = "#Bernie"
twitter_stream.filter(track=[tag])
# disconnect stream                   
twitter_stream.disconnect()

file = 'tweets.json'
with open(file, 'r') as f:
    geodata_tweets = []
    # keep track of number of geo tagged tweets
    geo_tweets = 0
    # iterate through file
    for line in f:
        #skip blank lines  #TODO FIX THIS PROBLEM WHEN TIME
        if len(line) > 1:
            tweet = json.loads(line)
            # make sure that user has an id
            if tweet['user']['id']:
                # build dict to save tweet text and location if exists
                tweet_data = {'primary_geo' : None,
                              'tag' : tag
                              }
                #Iterate through different types of geodata to get the variable primary_geo
                # check coordinates
                if tweet['coordinates']:
                    try:
                        tweet_data["primary_geo"] = str(tweet['coordinates'][tweet['coordinates'].keys()[1]][1]) + ", " + str(tweet['coordinates'][tweet['coordinates'].keys()[1]][0])
                    except:
                        TypeError
                    tweet_data["geo_type"] = "Tweet coordinates"
                    tweet_data['text'] = tweet['text']
                    tweet_data['user_id'] = tweet['user']['id']
                # check place
                elif tweet['place']:
                    tweet_data["primary_geo"] = tweet['place']['full_name'] + ", " + tweet['place']['country']
                    tweet_data["geo_type"] = "Tweet place"
                    tweet_data['text'] = tweet['text']
                    tweet_data['user_id'] = tweet['user']['id']


                # check features
                else:
                    tweet_data["primary_geo"] = tweet['user']['location']
                    tweet_data["geo_type"] = "User location"
                    tweet_data['text'] = tweet['text']
                    tweet_data['user_id'] = tweet['user']['id']

                # only track tweets that contain some geo tag
                if tweet_data["primary_geo"]:
                    geodata_tweets.append(tweet_data)
                    geo_tweets += 1
# Save data to JSON file
with open('locations.json', 'w') as fout:
    fout.write(json.dumps(geodata_tweets))


    
