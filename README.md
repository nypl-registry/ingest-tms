# ingest-tms
Converts TMS table exports to native registry JSON

[![travis](https://travis-ci.org/nypl-registry/ingest-tms.svg)](https://travis-ci.org/nypl-registry/ingest-tms/)

This module converts the CSV tables exported from tms into native registry JSON. The test suite covers the CSV array to json object transformation. The main part of this process is building lookup tables from the exported data. Once built it will cache them in the dispatch data directory, these (tms_*.json) should be removed when new data is addded. There is also a job to map ULAN ids to VIAF using the viaf web service. These jobs could be ran manually but are called from the [TMS Ingest dispatch job](https://github.com/nypl-registry/dispatch/blob/master/jobs/ingest_tms.js)
