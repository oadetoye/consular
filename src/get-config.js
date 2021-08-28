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
  prompt() {
    return new Promise((resolve, reject) => {
      prompt.start();

      prompt.get(schema, (err, results) => {
        if (err) {
          reject(err);
        } else {
          Object.assign(config, results);
          resolve(config);
        }
      });
    })
  }
};