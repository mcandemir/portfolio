FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY . .

EXPOSE 3169

CMD ["nginx", "-g", "daemon off;"]