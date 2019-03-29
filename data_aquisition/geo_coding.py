# -*- coding: utf-8 -*-
"""
Created on Wed Mar 20 08:51:29 2019

@author: mgreen13
"""
import json
import geocoder
from geotext import GeoText
import numpy as np
file = "locations.json"
bingk = "AhTP2X3M0KqYyubuu3aUz8YDMtjN9Cbz11ES2h_l1Os-kDJJTGGMdAsXzjbUDs_6"

# open json file containing locations
location_data = []
with open(file, 'r') as f:
    for line in f:
        if len(line) > 1:
            location_data.append(json.loads(line))

# extract locations from file
location_data = location_data[0]['data']
locations = []
for tweet in location_data:
    locations.append(tweet['primary_geo'])

# perform geo-coding to aquire lat/lng coordinate pairs from addressess
cords = list(np.ones([len(location_data)]))
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
    location_data[idx]['coordinate'] = i

# aggregate tweets with geo coordinates
geo_located_tweets = []
for tweet in location_data:
    if tweet['coordinate'] != 1:
        geo_located_tweets.append(tweet)

# write data to json file
with open('cleaned_tweets.json', 'w') as fout:
    fout.write(json.dumps(geo_located_tweets))
