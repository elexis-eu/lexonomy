#!/bin/sh
export MYSQL_PWD="$MYSQL_DB_PASSWORD"
mysqldump -u $MYSQL_DB_USER --port=$MYSQL_DB_PORT "lexo_template_$1" -h host.docker.internal > "/tmp/lexo_template_$1.sql" && mysqladmin -u $MYSQL_DB_USER --port=$MYSQL_DB_PORT -h host.docker.internal create "lexo_$2" && mysql -u $MYSQL_DB_USER --port=$MYSQL_DB_PORT -h host.docker.internal "lexo_$2" < "/tmp/lexo_template_$1.sql"


