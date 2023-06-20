FROM node:lts-alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    build-base \    
    python3 \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

WORKDIR /backend
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD npm start