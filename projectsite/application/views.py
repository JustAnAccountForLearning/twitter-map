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
    hashtag_list = ['Select a hashtag', '#trump', 'cities.json']
    
    context = {'hashtag_list': hashtag_list}
    return render(request, 'application/index.html', context)
    
    
def findtweets(request):
    """ Allows the return of hashtag locations as a JSON object. """
    
    if request.method == 'GET':
        # Find out what the selected hashtag is
        incommingdata = request.GET
        hashtag = incommingdata.__getitem__('hashtag')
    
        if hashtag == "#trump":
            twitterdata = 'static/application/trump_geoJson.json'
        elif hashtag == "cities.json":
            twitterdata = 'static/application/cities.json'
        #elif hashtag == "#sanders":
            #twitterdata = makeJson()
        else:
            twitterdata = 'static/application/empty.json'
        
        returndata = {
            "hashtag": hashtag,
            "twitterdata": twitterdata
        }
    
    return JsonResponse(returndata)