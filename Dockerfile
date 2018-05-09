#build with: docker build -t lexonomy .
#run with: docker run -p 9000:80 lexonomy:latest
#access at: http://localhost:9000

FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y git
RUN apt-get install -y npm
RUN npm install npm@latest -g

WORKDIR build
RUN git clone https://github.com/michmech/lexonomy.git
RUN mv lexonomy/website/siteconfig.json.template lexonomy/website/siteconfig.json
RUN mv lexonomy/data/lexonomy.sqlite.template lexonomy/data/lexonomy.sqlite

WORKDIR lexonomy/website
# fix dependency install problem
RUN npm install -g node-gyp
RUN npm install
# fix Error: Cannot find module [...]slite3.node
RUN npm install https://github.com/mapbox/node-sqlite3/tarball/master

CMD ["node", "/build/lexonomy/website/lexonomy.js"]
