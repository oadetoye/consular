const getConfig = require('./get-config');
const mysql = require('mysql');
const fs = require('fs');
const colors = require('colors/safe');

class ScanDB {
  config = {};
  conn;

  openConnection(config) {
    this.config = config;
    this.conn = mysql.createConnection(config);
    this.conn.connect();
  }

  closeConnection() {
    this.conn.end();
  }

  readDatabase(database) {
    this.conn.query('SHOW TABLES', (err, results) => {
      if (err) {
        throw err;
      } else {
        const tables = results.map(row => row[`Tables_in_${database}`]);
        const promises = [];
        tables.forEach((table) => {
          promises.push(new Promise((resolve, reject) => {
            this.conn.query(`DESCRIBE ${table}`, (err, fields) => {
              if (err) {
                reject(err);
              } else {
                resolve({ table, fields });
              }
            });
          }));
        });

        Promise.all(promises)
          .then((tableFields) => {
            fs.writeFile('./migrations/0-db-init.json', JSON.stringify(tableFields, null, 4), (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log(colors.green(`... database schema written to ${__dirname}/db-init.json`));
              }
            });
            this.closeConnection();
          })
          .catch(err => console.error(err));
      }
    });
  }

  execute() {
    getConfig.get().then((config) => {
      this.openConnection(config);
      this.readDatabase(config.database);
    });
    
  }
}

module.exports = new ScanDB();