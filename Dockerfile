FROM node:21.6.1 AS build

WORKDIR /status-frontend

COPY . .

RUN npm install -g nodemon --unsafe-perm && npm ci --no-audit && npm run build

FROM nginx:stable-alpine-slim

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /status-frontend/build/ /usr/share/nginx/html/

EXPOSE 80
