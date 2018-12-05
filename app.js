const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const { scheduler: { cronjobPattern: rawPattern } } = require('config');
const scheduler = require('./lib/services/scheduler/scheduler');

const pattern = Object.values(rawPattern).reverse().join(' ');
scheduler.start(pattern);

const config = {
  appRoot: __dirname, // required config
};

SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  const port = process.env.PORT || 10010;
  app.listen(port);
});

module.exports = app; // for testing
