FROM denoland/deno:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN deno install
COPY ./ .
RUN deno run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf