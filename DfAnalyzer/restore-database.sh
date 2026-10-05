# DB_FARM=/Users/vitor/Documents/repository/rest-dfa/db_farm
DB_FARM=./data
SQL_PATH=./monetdb/sql
monetdbd create $DB_FARM
# Rm -rf data unzip data-local.zip escuta em todas as interfaces ja na criacao do dbfarm, para que a porta 50000 publicada pelo container seja alcancavel de fora (DataGrip, mclient remoto)
monetdbd set listenaddr=0.0.0.0 $DB_FARM
monetdbd stop $DB_FARM
monetdbd start $DB_FARM
monetdb destroy -f dataflow_analyzer
monetdb create dataflow_analyzer
monetdb release dataflow_analyzer
monetdb status
# running SQL scripts
mclient -p 50000 -d dataflow_analyzer $SQL_PATH/create-schema.sql
mclient -p 50000 -d dataflow_analyzer $SQL_PATH/database-script.sql
