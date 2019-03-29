import json
# load json file into memory
file = "cleaned_tweets.json"
location_data = []
with open(file, 'r') as f:
    for line in f:
        if len(line) > 1:
            location_data.append(json.loads(line))

loc = location_data[0]

# convert into geoJson format
skeleton = {"type":"FeatureCollection","features" : []}


# fill in features list of geoJson file
for idx,i in enumerate(loc):
    skeleton['features'].append({"type":"Feature","id": idx,"properties":{"primary_geo":i["primary_geo"],"tag":i['tag'],'text':i['text'],'user_id':i['user_id']},"geometry" :{"type":"Point","coordinates": [i['coordinate'][1],i['coordinate'][0]]}})

# write out geoJSON file
with open('trump_geoJSON.json', 'w') as fout:
    fout.write(json.dumps(skeleton))


