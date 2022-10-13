FROM node:latest

WORKDIR /usr/src/server

COPY . .

RUN npm ci

EXPOSE 3000
CMD [ "npm", "run", "start" ]