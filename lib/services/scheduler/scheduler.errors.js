const logger = require('../logger/logger');

class NormalizeParserError extends Error {
  constructor(serviceName, response, ...err) {
    super(err);
    logger.error('scheduler failed because of unrecognized response structure', {
      serviceName,
      response,
    });
    this.serviceName = serviceName;
    this.response = response;
  }
}

class UnrecognizedServiceNameError extends Error {
  constructor(serviceName, ...err) {
    super(err);
    logger.error('scheduler failed because of unrecognized service name', {
      serviceName,
    });
    this.serviceName = serviceName;
  }
}

module.exports = {
  NormalizeParserError,
  UnrecognizedServiceNameError,
};
