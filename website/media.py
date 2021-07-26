#!/usr/bin/python3
import requests

def get_images(configs, query):
    images = []
    if not configs["gapi"]["image_licence"] or configs["gapi"]["image_licence"] == "":
        configs["gapi"]["image_licence"] = "code"
    if configs["gapi"] and configs["gapi"]["pixabaykey"] != "":
        images.extend(get_image_pixabay(query, configs["gapi"]["pixabaykey"]))
    images.extend(get_image_wikidata(query, configs["gapi"]["image_licence"]))
    if configs["gapi"] and configs["gapi"]["apikey"] != "" and configs["gapi"]["cx"] != "":
        images.extend(get_image_google(query, configs["gapi"]["apikey"], configs["gapi"]["cx"], configs["gapi"]["image_licence"]))
    return images

def get_image_pixabay(query, apikey):
    images = []
    endpoint = 'https://pixabay.com/api/'
    params = {
        'key': apikey,
        'q': query,
        'per_page': 10
    }
    results = requests.get(endpoint, params=params)
    for item in results.json()['hits']:
        images.append({
            'title': 'Pixabay: ' + item['user'] + ': ' + item['tags'],
            'thumb': item['previewURL'],
            'url': item['webformatURL'],
            'licence': 'pixabay'
        })
    return images

def get_image_google(query, apikey, cx, licence):
    images = []
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    rights = {
        'any': '(cc_publicdomain|cc_attribute|cc_sharealike|cc_noncommercial|cc_nonderived)',
        'public': 'cc_publicdomain',
        'comm': '(cc_publicdomain|cc_attribute|cc_sharealike|cc_nonderived).-(cc_noncommercial)',
        'der': '(cc_publicdomain|cc_attribute|cc_sharealike|cc_noncommercial).-(cc_nonderived)',
        'code': '(cc_publicdomain|cc_attribute|cc_sharealike).-(cc_noncommercial|cc_nonderived)',
    }
    rightsVal = {
        'any': 'any licence',
        'public': 'public domain',
        'comm': 'permits commercial use',
        'der': 'permits derivative works',
        'code': 'permits commercial and derivative use'
    }
    params = {
        'key': apikey,
        'cx': cx,
        'q': query,
        'filetype': 'jpg',
        'imgSize': 'medium',
        'searchType': 'image',
        'format': 'json',
        'rights': rights[licence]
    }
    results = requests.get(endpoint, params=params)
    for item in results.json()['items']:
        images.append({
            'title': 'Wikimedia: ' + item.get('title'),
            'thumb': item['image']['thumbnailLink'],
            'url': item['link'],
            'licence': rightsVal[licence]
        })
    return images

def get_image_wikidata(query, licence):
    images = []
    endpoint = 'https://www.wikidata.org/w/api.php'
    params = {
        'action': 'wbsearchentities',
        'search': query,
        'language': 'en',
        'format': 'json',
        'limit': 20
    }
    results = requests.get(endpoint, params=params)
    for item in results.json()['search']:
        for file in get_wikidata_file_name(item['id']):
            for info in get_wikidata_info(file).values():
                if licence == 'public' and info['imageinfo'][0]['extmetadata']['LicenseShortName']['value'] != 'Public':
                    next
                if licence in ['comm', 'der', 'cod'] and "CC BY-SA" not in info['imageinfo'][0]['extmetadata']['LicenseShortName']['value']:
                    next
                images.append({
                    'title': info['title'],
                    'thumb': info['imageinfo'][0]['url'],
                    'url': info['imageinfo'][0]['url'],
                    'licence': info['imageinfo'][0]['extmetadata']['LicenseShortName']['value']
                })
    return images

def get_wikidata_file_name(source_id):
    endpoint = 'https://www.wikidata.org/w/api.php'
    params = {
        'action': 'wbgetclaims',
        'entity': source_id,
        'property': 'P18',
        'format': 'json',
    }
    results = requests.get(endpoint, params=params).json()
    try:
        return [x['mainsnak']['datavalue']['value'] for x in results['claims']['P18']]
    except KeyError:
        return []

def get_wikidata_info(file_name):
    endpoint = 'https://commons.wikimedia.org/w/api.php'
    params = {
        'action': 'query',
        'titles': 'File:{}'.format(file_name),
        'prop': 'imageinfo',
        'format': 'json',
        'iiprop': 'url|user|extmetadata|dimensions'
    }
    results = requests.get(endpoint, params=params).json()
    return results['query']['pages']

