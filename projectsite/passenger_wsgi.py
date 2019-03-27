import sys, os
INTERP = "/users/y/w/ywu10/www-root/cs205/CS205_Final_Project/projectsite/venv/bin/python"
#INTERP is present twice so that the new python interpreter 
#knows the actual executable path 
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)

cwd = os.getcwd()
sys.path.append(cwd)
sys.path.append(cwd + '/projectsite')

sys.path.insert(0,cwd+'/projectsite/bin')
sys.path.insert(0,cwd+'/projectsite/lib/python3.5/site-packages')

os.environ['DJANGO_SETTINGS_MODULE'] = "projectsite.settings"
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
