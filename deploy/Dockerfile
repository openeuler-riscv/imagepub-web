FROM nginx:1.27-alpine

RUN  sed -i 's/#error_page/error_page/' "/etc/nginx/conf.d/default.conf"
COPY dist /usr/share/nginx/html

EXPOSE 80
