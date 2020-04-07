FROM node:12.16.1-alpine

WORKDIR /helm

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package*.json /helm/
RUN npm install

COPY . /helm/

ENV PORT 3000
EXPOSE $PORT
CMD [ "npm", "run", "dev" ]
