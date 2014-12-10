import ConfigParser

maps = {
    'google_map_api_key' : ['api_key', 'google_map', None]
}

def read(name):
    config = ConfigParser.ConfigParser()
    config.read('../config/config.ini')
    
    global maps

    try:
        if maps[name][2] is None:
            maps[name][2] = config.get(maps[name][0], maps[name][1])
        return maps[name][2]
    except KeyError, e:
        return None