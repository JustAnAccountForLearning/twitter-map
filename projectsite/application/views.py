from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Twitter

def index(request):
    # Unused at the moment. It orders ALL of the tweets by time stamp
    tweet_list = Twitter.objects.order_by('timestamp')
    # Super short list for now. Only allows #trump and #sanders
    hashtag_list = ['trump', 'sanders']
    context = {'hashtag_list': hashtag_list}
    return render(request, 'application/index.html', context)
    
