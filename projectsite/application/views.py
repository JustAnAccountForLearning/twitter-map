from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.template import loader
from .utilities import makeJson, makeList,getSentiment, getTwitterData

import json

def index(request):
    """ Index is the main web page for our site. """
    
    hashtag_list = list()
    error = False
    
    try:
        hashtag_list = makeList()  
    except:
        # In the event that there was an error connecting to the database,
        # the below list will be provided
        hashtag_list = ['Select a hashtag', 'Trump test data', 'US cities']
        error = True
    
    context = {'error': error, 'hashtag_list': hashtag_list}
    return render(request, 'application/index.html', context)
    
    
def findtweets(request):
    """ Allows the return of hashtag locations as a JSON object. """
    
    if request.method == 'GET':
        # Find out what the selected hashtag(s) is/are
        incommingdata = request.GET
        hashtags = list()
        hashtags.append(incommingdata.__getitem__('hashtag1'))
        hashtags.append(incommingdata.__getitem__('hashtag2'))
        
        error = False
        twitterdata = list()
        sentiments = []
        for tag in hashtags:
            if tag != "Select a hashtag":
                if tag == "Trump test data":
                    twitterdata.append('static/application/trump_geoJson.json')
                elif tag == "US cities":
                    twitterdata.append('static/application/cities.json')
                else:
                    # Remove the '#' if it exists
                    h_tag = tag.replace("#","")
                    # Make file path
                    path_to_twitterdata = 'static/application/{}_geoJson.json'.format(h_tag)
                    # query twitter for desired tweets
                    getTwitterData(h_tag)
                    # make file
                    makeJson(h_tag)
                    twitterdata.append(path_to_twitterdata)
        else:
            twitterdata.append('static/application/empty.json')
        # calculate sentiments for each tweet
        sentiments.append(getSentiment(tag))

        returndata = {
            "error": error,
            "hashtag": hashtags,
            "twitterdata": twitterdata,
            "sentiment": sentiments
        }
    
    return JsonResponse(returndata)