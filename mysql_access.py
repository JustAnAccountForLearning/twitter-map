import sqlalchemy as sql
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects import mysql
import json
import pymysql
# declare mapping
from sqlalchemy import Sequence

ssl_args = {'ssl': {'ca': 'webdb-cacert.pem.txt'}}
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

a = db.query().filter(User.tag == "#Bernie").first()
