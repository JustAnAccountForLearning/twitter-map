from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.template import loader
from .utilities import makeJson

import json

def index(request):
    """ Index is the main web page for our site. """
    
    # TODO: Expand on this list. Can be hardcoded or pulled from tweets.
    # Maybe pick any hashtag that shows up over XXX number of times
    # Super short list for now. Only allows #trump, #sanders, and cities.json
    hashtag_list = ['Select a hashtag', '#trump', 'trumptestgeojson', '#sanders', 'cities.json']
    
    context = {'hashtag_list': hashtag_list}
    return render(request, 'application/index.html', context)
    
    
def findtweets(request):
    """ Allows the return of hashtag locations as a JSON object. """
    
    if request.method == 'GET':
        # Find out what the selected hashtag(s) is/are
        incommingdata = request.GET
        hashtags = list()
        hashtags.append(incommingdata.__getitem__('hashtag1'))
        hashtags.append(incommingdata.__getitem__('hashtag2'))
        
        twitterdata = list()

        for tag in hashtags:
            if tag != "Select a hashtag":
                if tag == "trumptestgeojson":
                    twitterdata.append('static/application/trump_geoJson.json')
                elif tag == "cities.json":
                    twitterdata.append('static/application/cities.json')
                else:
                    # Remove the '#'
                    tag = tag[1:]
                    # Make file path
                    path_to_twitterdata = 'static/application/{}_geoJson.json'
                    # make file
                    makeJson(tag)
            
                    twitterdata.append(path_to_twitterdata)
            else:
                twitterdata.append('static/application/empty.json')
        

        hashtags[:] = [tag for tag in hashtags if tag != "Select a hashtag"]
        

        
        returndata = {
            "hashtag": hashtags,
            "twitterdata": twitterdata
        }
    
    return JsonResponse(returndata)