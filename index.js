const argv = require('yargs').argv;

 if (argv.scanDb) {
   const scanDb = require('./src/scan-db');
   scanDb.execute();
 }

 if (argv.migrate || argv.m) {
   const migrate = require('./src/migrate');
   migrate.execute();
 }