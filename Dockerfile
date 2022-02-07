FROM python:3-alpine

ARG VER

COPY . /opt/service/
WORKDIR /opt/service/website

RUN apk add --virtual .build-deps gcc g++ libxslt-dev libffi-dev openssl-dev icu-dev && \ 
    apk add libxml2 libxslt libffi openssl icu && \
    apk add mysql-client && \
    apk add sqlite && \
    apk add openjdk11-jre  $(: for Naisc ) && \
    pip install -r requirements.txt && \
    apk del .build-deps && \
    [ -z "$VER" ] || echo "$VER" > version.txt

ENTRYPOINT ["python3", "lexonomy.py", "0.0.0.0:8000"]
