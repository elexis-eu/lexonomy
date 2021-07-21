#!/usr/bin/python3
import requests

def get_images(configs, query):
    images = []
    if not configs["gapi"]["image_licence"] or configs["gapi"]["image_licence"] == "":
        configs["gapi"]["image_licence"] = "code"
    if configs["gapi"] and configs["gapi"]["pixabaykey"] != "":
        images.extend(get_image_pixabay(query, configs["gapi"]["pixabaykey"]))
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
            'url': item['webformatURL']
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
            'title': item['title'],
            'thumb': item['image']['thumbnailLink'],
            'url': item['link']
        })
    return images
