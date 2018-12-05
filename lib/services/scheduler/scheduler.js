const cron = require('node-cron');
const { scheduler: { endpoints } } = require('config');
const EventEmitter = require('events');
const request = require('request-promise');
const { parseString } = require('xml2js');
const { NormalizeParserError, UnrecognizedServiceNameError } = require('./scheduler.errors');

const samples = [];

function parseXML(text) {
  return new Promise((resolve, reject) => {
    parseString(text, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

async function normalize(serviceName, responseRaw) {
  let response;
  if (['users', 'commands'].includes(serviceName)) {
    try {
      response = JSON.parse(responseRaw);
    } catch (e) {
      throw new NormalizeParserError(serviceName, response);
    }

    let status;
    if (serviceName === 'users') {
      status = response.status.overall === 'GOOD' ? 'ok' : 'error';
    } else if (serviceName === 'commands') {
      status = response.status.overall === 'OK' ? 'ok' : 'error';
    }

    return {
      serviceName,
      status,
      details: response.status,
    };
  }
  if (serviceName === 'worker') {
    let status;
    try {
      response = await parseXML(responseRaw);
      ({ HealthCheck: { status: [status] } } = response);
    } catch (e) {
      throw new NormalizeParserError(serviceName, response);
    }
    return {
      serviceName,
      status: status === 'Good' ? 'ok' : 'error',
      details: response.HealthCheck.$,
    };
  }

  throw new UnrecognizedServiceNameError(serviceName);
}

async function process() {
  const promises = endpoints.map(async (endpoint) => {
    const response = await request.get(endpoint.serviceUrl);
    return normalize(endpoint.serviceName, response);
  });
  const responses = await Promise.all(promises);
  const finalStatus = responses.some(({ status }) => status !== 'ok');
  return {
    status: finalStatus ? 'error' : 'ok',
    services: responses,
  };
}

function start(pattern) {
  const emitter = new EventEmitter();
  cron.schedule(pattern, () => {
    emitter.emit('scheduler.before');
    process()
      .then((result) => {
        if (samples.length === 60) {
          samples.splice(-1, 1);
        }
        samples.splice(0, 0, {
          date: Date.now(),
          result,
        });
        emitter.emit('scheduler.done');
      })
      .catch(e => emitter.emit('scheduler.error', {
        e,
      }));
  });
  return emitter;
}

function getAverageUptime() {
  const uptimeMinutes = samples.reduce((all, sample) => all + (sample.result.status === 'ok' ? 1 : 0), 0);
  return (uptimeMinutes / 60) * 100;
}

module.exports = {
  start,
  process,
  getAverageUptime,
};
