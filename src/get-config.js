const prompt = require('prompt');
prompt.message = '';

const config = {};

const schema = {
  properties: {
    host: {
      description: 'DB Host',
      required: true
    },
    database: {
      description: 'DB Name',
      required: true
    },
    user: {
      description: 'DB Username',
      required: true
    },
    password: {
      description: 'DB Password',
      required: true,
      hidden: true,
      replace: '*'
    }
  }
};

module.exports = {
  get() {
    return new Promise((resolve, reject) => {
      if (process.env.host && process.env.user && process.env.database && process.env.password ) {
        const { host, user, database, password } = process.env;
        Object.assign(config, { host, database, user, password });
        resolve(config);
      } else {
        prompt.start();

        prompt.get(schema, (err, results) => {
          if (err) {
            reject(err);
          } else {
            Object.assign(config, results);
            resolve(config);
          }
        });
      }
    })
  }
};