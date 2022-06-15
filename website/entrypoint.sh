mysqlshow --host=${MYSQL_DB_HOST} --user=${MYSQL_DB_USER} --password=${MYSQL_DB_PASSWORD} | grep lexo;
if [ $? -eq 0 ]; 
then 
    echo 'DB already exist';
else
    echo 'creating lexo databases...';
    mysql --host=${MYSQL_DB_HOST} --user=${MYSQL_DB_USER} --password=${MYSQL_DB_PASSWORD} < /opt/service/data/sql/lexo.sql && \
    mysql --host=${MYSQL_DB_HOST} --user=${MYSQL_DB_USER} --password=${MYSQL_DB_PASSWORD} < /opt/service/data/sql/lexo_crossref.sql && \
    mysql --host=${MYSQL_DB_HOST} --user=${MYSQL_DB_USER} --password=${MYSQL_DB_PASSWORD} < /opt/service/data/sql/lexo_template_blank.sql && \
    mysql --host=${MYSQL_DB_HOST} --user=${MYSQL_DB_USER} --password=${MYSQL_DB_PASSWORD} < /opt/service/data/sql/lexo_template_smd.sql && \
    mysql --host=${MYSQL_DB_HOST} --user=${MYSQL_DB_USER} --password=${MYSQL_DB_PASSWORD} < /opt/service/data/sql/lexo_template_lmf.sql

    echo 'done creating databases.';
    echo 'creating root password:';
    python3 ./adminscripts/changePasswordMysql.py root@localhost
fi;
python3 lexonomy.py 0.0.0.0:8000