from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.template import loader
from .models import Twitter

import json

def index(request):
    """ Index is the main web page for our site. """
    # tweet_list is unused at the moment. It orders ALL of the tweets by time stamp
    tweet_list = Twitter.objects.order_by('timestamp')
    
    # TODO: Expand on this list. Can be hardcoded or pulled from tweets.
    # Maybe pick any hashtag that shows up over XXX number of times
    # Super short list for now. Only allows #trump and #sanders
    hashtag_list = ['Select a hashtag', '#trump', '#sanders', 'cities.json']
    
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
        else:
            twitterdata = 'static/application/empty.json'
        
        returndata = {
            "hashtag": hashtag,
            "twitterdata": twitterdata
        }
    
    return JsonResponse(returndata)