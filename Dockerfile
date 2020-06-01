FROM nikolaik/python-nodejs:python3.8-nodejs14-alpine

COPY . /opt/service/
WORKDIR /opt/service/website

RUN apk add --no-cache --virtual .build-deps gcc g++ libxslt-dev libffi-dev openssl-dev && \ 
    apk add --no-cache libxml2 libxslt libffi openssl && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del .build-deps

ENTRYPOINT ["python3", "lexonomy.py"]
