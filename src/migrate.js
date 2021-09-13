const fs = require('fs');
const getConfig = require('./get-config');
const mysql = require('mysql');

class Migrate {
  files = fs.readdirSync('./migrations');
  conn;
  config;

  openConnection(config) {
    this.conn = mysql.createConnection(config);
    this.conn.connect();
  }

  closeConnection() {
    this.conn.end();
  }

  getExecutedMigrations() {
    return new Promise((resolve, reject) => {
      this.conn.query(`CREATE TABLE IF NOT EXISTS migrations(
          file VARCHAR(255) UNIQUE,
          executed timestamp
        )`, (err) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            this.conn.query('SELECT file FROM migrations', (err, files) => {
              resolve(files.map(file=> file.file));
            });
          }
        });
    });
  }

  prepField(field) {
    const nullable = field.Null === 'YES' ? 'NULL' : 'NOT NULL';
    return `\`${field.Field}\` ${field.Type} ${nullable} ${field.Extra}`;
  }

  runMigration(file) {
    console.log(`processing file ${file}...`);
    return new Promise((resolve, reject) => {
      const promises = [];
      const data = JSON.parse(fs.readFileSync(`./migrations/${file}`, 'utf-8'));
      data.forEach((item) => {
        const primaryItem = item.fields.filter(field => field.Key === 'PRI');
        const primary = primaryItem[0] ? `, PRIMARY KEY (${primaryItem[0].Field})` : '';
        const createFields = item.fields.map((field) => {
          return this.prepField(field);
        }).join(', ') + primary;
        promises.push(new Promise((res, rej) => {
          this.conn.query(`CREATE TABLE IF NOT EXISTS ${item.table} (${createFields})`, (err) => {
            if (err) {
              console.error(err);
              rej(err);
            } else {
              res(true);
            }
          });
        }));

      });

      Promise.all(promises).then(() => {
        console.log(`${file} migration completed successfully`);
        this.conn.query(`INSERT INTO migrations VALUES('${file}', NOW())`);
        resolve(true);
      }).catch(err => reject(err));
    });
  }

  execute() {
    getConfig.get().then(async (config) => {
      this.openConnection(config);
      const promises = [];
      const executed = await this.getExecutedMigrations();
      this.files.filter(file => !executed.includes(file)).forEach((file) => {
        promises.push(this.runMigration(file));
      });

      Promise.all(promises).then(() => {
        this.closeConnection();
      });
    });
  }
}

module.exports = new Migrate();