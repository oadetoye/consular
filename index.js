const argv = require('yargs').argv;

 if (argv.scanDb) {
   const scanDb = require('./src/scan-db');
   scanDb.execute();
 }