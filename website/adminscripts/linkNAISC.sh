#!/bin/sh

if [ "$#" -ne 5 ]; then
  echo "Usage: $0 DATADIR DB1 DB2 NAISCCMD JOBID"
  exit 1;
fi

DATADIR="$1"
DB1="$2"
DB2="$3"
NAISCCMD="$4"
JOBID="$5"
CURRDIR=$(dirname "$0")
"$CURRDIR/xml2ontolex.py" "$DATADIR/dicts/$DB1.sqlite" > "/tmp/linkNAISC-$DB1.nt"
"$CURRDIR/xml2ontolex.py" "$DATADIR/dicts/$DB2.sqlite" > "/tmp/linkNAISC-$DB2.nt"
"$NAISCCMD" "/tmp/linkNAISC-$DB1.nt" "/tmp/linkNAISC-$DB2.nt" -c configs/auto.json -o "/tmp/linkNAISC-$DB1-$DB2"
RET=$?
[ "$RET" -eq 0 ] && "$CURRDIR/importNAISClinks.py" "$DATADIR/crossref.sqlite" < "/tmp/linkNAISC-$DB1-$DB2"
sqlite3 "$DATADIR/dicts/$DB1.sqlite" "UPDATE bgjobs SET finished=$RET WHERE id=$JOBID"
