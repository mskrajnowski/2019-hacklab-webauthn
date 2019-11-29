FROM node:12-alpine

WORKDIR /opt/hacklab

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY ./tsconfig.json ./
COPY ./public ./public
COPY ./src ./src

EXPOSE 3000

ENV PORT=3000

CMD npm start
