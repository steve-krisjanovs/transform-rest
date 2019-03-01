FROM node:10.15.1-alpine

ENV EXPRESS_PORT=3000
EXPOSE ${EXPRESS_PORT}

WORKDIR /myapp
COPY ./package.json /myapp/package.json
COPY ./index.js /myapp/index.js

#go to myapp dir and finalize install
RUN cd /myapp

#install pdftk package
RUN apk add --update \
    pdftk \
    python2 \
    build-base

#set up node deps
RUN npm install -g node-gyp
RUN npm install
CMD ["node","./index.js"]

# NOTES ###########################################################
#to build docker container:
# docker build --rm -f "dockerfile" -t transform-rest:latest .
#
#to run docker container (examples below):
# docker run -p 3000:3000 transform-rest:latest
#
###################################################################