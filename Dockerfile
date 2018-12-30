FROM nginx:1.15-alpine

# Copy site file
COPY . /usr/share/nginx/html

# Copy nginx configuration for site
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD [ "nginx", "-g", "daemon off;" ]
