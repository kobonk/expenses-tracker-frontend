# Build stage
FROM node:14 AS build
LABEL maintainer="kobonk@kobonk.pl"

WORKDIR /usr/src/app
COPY . .

# Build stage
RUN npm ci
RUN npm run-script build

# Deployment stage
FROM nginx:1.17.1-alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
