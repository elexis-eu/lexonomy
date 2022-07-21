FROM python:3-alpine

ARG VER

COPY . /opt/service/
WORKDIR /opt/service/website

RUN apk add --virtual .build-deps gcc g++ libxslt-dev libffi-dev openssl-dev icu-dev && \ 
    apk add libxml2 libxslt libffi openssl icu && \
    apk add mysql-client && \
    apk add sqlite && \
    apk add openjdk11-jre  $(: for Naisc ) && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del .build-deps && \
    [ -z "$VER" ] || echo "$VER" > version.txt 

# RUN export GOOGLE_APPLICATION_CREDENTIALS="/Users/WaadTSS/Downloads/forward-fuze-354909-7c459293bf4d.json"


ENTRYPOINT ["python3", "lexonomy.py", "localhost:8000"]
