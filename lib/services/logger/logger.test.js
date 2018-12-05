const logger = require('./logger');
const should = require('should');

describe('[service] Logger', function () {
  it('should be able to log', async function () {
    should(logger).be.an.Object();
    logger.should.have.property('debug').which.is.a.Function();
    logger.debug('test')
  });
});
