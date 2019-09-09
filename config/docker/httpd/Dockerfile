ARG DISMANTLE_VERSION=latest

FROM registry.gitlab.com/dismantle/dismantle/api:${DISMANTLE_VERSION} as libeo_sources

FROM httpd:2.4
COPY config/docker/httpd/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --chown=www-data:www-data --from=libeo_sources /var/www/html/dismantle /var/www/html/dismantle
COPY --chown=www-data:www-data ./libeoweb/build/ /var/www/html/libeoweb