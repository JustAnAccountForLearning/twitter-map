from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.template import loader
from .utilities import makeJson, makeList

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

        for tag in hashtags:
            if tag != "Select a hashtag":
                if tag == "Trump test data":
                    twitterdata.append('static/application/trump_geoJson.json')
                elif tag == "US cities":
                    twitterdata.append('static/application/cities.json')
                else:

                    # TODO: Safety check the incomming text. 
                    # If the tag is safe, do a search.
                    # If the tag is not safe, reply with empty.json and an appropriate error message
                    if (tag != "Select a hashtag" or tag != "US cities" or tag != "Trump test data"): 
                        error = "Invalid tag option. Please try again."
                        twitterdata.append('static/application/empty.json')
                    else:
                        # Remove the '#' if it exists
                        h_tag = tag.replace("#","")
                        # Make file path
                        path_to_twitterdata = 'static/application/{}_geoJson.json'.format(h_tag)
                        # make file
                        makeJson(h_tag)
            
                        twitterdata.append(path_to_twitterdata)
            else:
                twitterdata.append('static/application/empty.json')

        
        returndata = {
            "error": error,
            "hashtag": hashtags,
            "twitterdata": twitterdata
        }
    
    return JsonResponse(returndata)