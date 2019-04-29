from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.template import loader
from .utilities import makeJson, makeList, getSentiment

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

        for i in range(2):
            # Done this way so that the tag can be replaced if need be later.
            tag = hashtags[i]
            if tag == "Select a hashtag":
                twitterdata.append('static/application/empty.json')
            else:
                if tag == "Trump test data":
                    twitterdata.append('static/application/trump_geoJson.json')
                elif tag == "US cities":
                    twitterdata.append('static/application/cities.json')
                else:
                    # Safety check the incomming tag. Ensure it's not a copy paste or malicious attack. 
                    if (len(tag) > 14) or not tag.isalpha():
                        hashtags[i] = "Select a hashtag"
                        error = "Invalid tag option. Please try again."
                        twitterdata.append('static/application/empty.json')
                    else:
                        try:
                            # Remove the '#' if it exists
                            h_tag = tag.replace("#","")
                            # Make file path
                            path_to_twitterdata = 'static/application/{}_geoJSON.json'.format(h_tag)
                            # make file
                            makeJson(h_tag)
                            twitterdata.append(path_to_twitterdata)
                        except:
                            hashtags[i] = "Select a hashtag"
                            error = "Unable to source twitter data at this time."
                            twitterdata.append('static/application/empty.json')         
                
            # calculate sentiments for each tweet
            try:
                sentiments.append(getSentiment(tag))
            except:
                error = "Unable to gather twitter sentiment."

        returndata = {
            "error": error,
            "hashtag": hashtags,
            "twitterdata": twitterdata,
            "sentiment": sentiments
        }
    
    return JsonResponse(returndata)
