FROM node:21.6.1

WORKDIR /status-frontend

COPY . .

RUN npm install
RUN npm install -g nodemon --unsafe-perm

CMD ["npm", "start"]