import sqlalchemy as sql
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String
from sqlalchemy import Sequence

import json


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
    
    hashtag_list = ["Select a hashtag"]
    for instance in db.query(User).order_by(User.id):
        if instance.tag not in hashtag_list:
            hashtag_list.append(instance.tag)
    return(hashtag_list)
    
    
def makeJson(hashtag):
    
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
        
        
        
    # build geoJSON file data structure
    skeleton = {"type":"FeatureCollection","features" : []}
    
    # fill in features list of geoJson file
    for i in range(len(coordinates)):
        skeleton['features'].append({"type":"Feature","id": i,"properties":{"tag":tag[i],'text':text[i]},"geometry" :{"type":"Point","coordinates": (coordinates[i][1],coordinates[i][0])}})
     # write out geoJSON file
    with open('application/static/application/{}_geoJSON.json'.format(hashtag), 'w') as fout:
        fout.write(json.dumps(skeleton))
   

