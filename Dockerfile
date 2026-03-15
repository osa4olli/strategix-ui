FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY . .
RUN npm i --save
RUN npm run build

FROM nginx:1.27.3-alpine3.20
COPY --from=build-stage /app/dist /usr/share/nginx/html/
COPY --from=build-stage /app/nginx/default.conf /etc/nginx/conf.d/
