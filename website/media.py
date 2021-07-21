#!/usr/bin/python3
import requests

def get_images(configs, query):
    images = []
    if configs["gapi"] and configs["gapi"]["apikey"] != "" and configs["gapi"]["cx"] != "":
        images.extend(get_image_google(query, configs["gapi"]["apikey"], configs["gapi"]["cx"]))
    return images


def get_image_google(query, apikey, cx):
    images = []
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': apikey,
        'cx': cx,
        'q': query,
        'filetype': 'jpg',
        'imgSize': 'medium',
        'searchType': 'image',
        'format': 'json',
        'rights': '(cc_publicdomain|cc_attribute|cc_sharealike|cc_nonderived).-(cc_noncommercial)'
    }
    results = requests.get(endpoint, params=params)
    for item in results.json()['items']:
        images.append({
            'title': item['title'],
            'thumb': item['image']['thumbnailLink'],
            'url': item['link']
        })
    return images
