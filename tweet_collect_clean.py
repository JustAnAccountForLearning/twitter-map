import sqlalchemy as sql
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String
from sqlalchemy import Sequence
from textblob import TextBlob
import tweepy
from tweepy import OAuthHandler
from textblob import TextBlob
import numpy as np
import geocoder
import json
import os

# Initialize the database connection with SQL on WebDB
ssl_args = {'ssl': {'ssl-ca': 'webdb-cacert.pem.txt'}}
    
db_engine = sql.create_engine(
        'mysql://mgreen13_admin:7oGdoDnzJ9IK8nS8@webdb.uvm.edu/MGREEN13_twitter?charset=utf8', encoding='utf-8', 
        connect_args=ssl_args,convert_unicode = True)

Session = sessionmaker(bind=db_engine)
db = Session()

Base = declarative_base()

class User(Base):
     __tablename__ = 'tweet'
     __table_args__ = {'extend_existing': True} 
     id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
     tag = Column(String(length = 20))
     text = Column(String(length = 400))
     lat = Column(String(length = 50))
     lon = Column(String(length = 50))


def makeList():
    """ Create a hashtag list from the available tags in our database. """
    hashtag_list = ["Select a hashtag"]
    for instance in db.query(User).order_by(User.id):
        if instance.tag not in hashtag_list:
            hashtag_list.append(instance.tag)
    return(hashtag_list)
    
    
def makeJson(hashtag):
    """ Takes a hashtag as an argument and writes a geoJSON file readable by D3. """
    text = []
    tag =[]
    coordinates = []
    
    for instance in db.query(User).order_by(User.id):
        if instance.tag == hashtag:
            tag.append(instance.tag)
            text.append(instance.text)
            lat = float(instance.lat)
            lon = float(instance.lon)
            coordinates.append((lat,lon))
        
        
        
    # Build geoJSON file data structure
    skeleton = {"type":"FeatureCollection","features" : []}
    
    # Fill in features list of geoJson file
    for i in range(len(coordinates)):
        skeleton['features'].append({"type":"Feature","id": i,"properties":{"tag":tag[i],'text':text[i]},"geometry" :{"type":"Point","coordinates": (coordinates[i][1],coordinates[i][0])}})

    # Write out geoJSON file
    with open('application/static/application/{}_geoJSON.json'.format(hashtag), 'w') as fout:
        fout.write(json.dumps(skeleton))
   

def getSentiment(hashtag):
    """ Calculate the sentiment of each of the tweets. """
    sentiment = []
    for instance in db.query(User).order_by(User.id):
        if instance.tag == hashtag:
            sent = TextBlob(instance.text)
            sentiment.append(sent.polarity)
    return(sentiment)


def getTwitterData(key_word):
    """
    INPUT : key_word - word of inquiry. Ex: 'election','thrones','pie','vermont'
    OUTPUT : None
    DESCRIPTION : This function scrapes tweets off the twitter API, transforms addresses to lat/lon coordinates and then posts the subsequant data to the UVM webdm data base. 
    
    """
    # get twitter data and geoCode tweets, add to database
    creds = { "APP_KEY" : "qSawwnOibAchjwvXlqklP6pPk", "APP_SECRET":"YfjHzNweOFwFpdh6a7hL80hZKNmDfbwU5JHPRZ7hP0lae0GMmV", "ACCESS_TOKEN":"905108414484774912-ydWrMkuP5GGFQVaghMTSYUoSfZWLMjv","ACCESS_SECRET":"0gTMLMVHQTiUd0UouRbk6904bsoBmVWOSmb9Kll2HEbkZ"}
    APP_KEY = creds["APP_KEY"]
    APP_SECRET = creds["APP_SECRET"]
    ACCESS_TOKEN = creds["ACCESS_TOKEN"] 
    ACCESS_SECRET = creds["ACCESS_SECRET"]

    auth = OAuthHandler(APP_KEY, APP_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)

    api = tweepy.API(auth)

    # run query using keyword
    jsons = []
    query = key_word  # open file tweets.json and save tweets json data to a line
    tag = key_word

    language = "en"
    results = api.search(q=query, lang=language, count=1000)
    # collect many tweets
    results= []
    for i in range(4):
        result = api.search(q=query, lang=language, count=1000)
        results.extend(result)


    for tweet in results:
        jsons.append(tweet._json)

    # search tweet for location, could be in one of several different places
    geodata_tweets = []
    for tweet in jsons:
        if tweet['user']['id']:
                # build dict to save tweet text and location if exists
                tweet_data = {'primary_geo': None,
                        'tag': tag
                        }
                # Iterate through different types of geodata to get the variable primary_geo
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
                        tweet_data["primary_geo"] = tweet['place']['full_name'] + \
                        ", " + tweet['place']['country']
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
    # geo code tweets(retrieve lat/lon pairs from addresses)
    bingk = "AhTP2X3M0KqYyubuu3aUz8YDMtjN9Cbz11ES2h_l1Os-kDJJTGGMdAsXzjbUDs_6"
    locations = []
    for tweet in geodata_tweets:
        locations.append(tweet['primary_geo'])
    # perform geo-coding to aquire lat/lng coordinate pairs from addressess
    cords = list(np.ones([len(locations)]))
    for idx, loc in enumerate(locations):
        cord = geocoder.bing(loc, key=bingk)
        if cord.latlng:
                cords[idx] = [cord.latlng]
    # write coordinates back into tweet dictionaries
    for idx, i in enumerate(cords):
        try:
                i = i[0]
        except:
                IndexError
        geodata_tweets[idx]['coordinate'] = i
    # aggregate tweets with geo coordinates
    geo_located_tweets = []
    for tweet in geodata_tweets:
        if tweet['coordinate'] != 1:
                geo_located_tweets.append(tweet)
    # save data to database
    for tweet in geo_located_tweets:
        db.add(User(
            tag=key_word, text=tweet['text'], lat=tweet['coordinate'][0], lon=tweet['coordinate'][1]))
    db.commit()
    
    
# example of tweets added to database
getTwitterData("GOT")
getTwitterData("lanister")
getTwitterData("stark")
getTwitterData("crpyto")
getTwitterData("vaccines")
getTwitterData("anti-vaccs")