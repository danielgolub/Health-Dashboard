const scheduler = require('../../lib/services/scheduler/scheduler');

function ping(req, res) {
  scheduler.process()
    .then(response => res.send(response))
    .catch(e => res.status(500).send(e));
}

function getStats(req, res) {
  const uptimePercent = scheduler.getAverageUptime();
  res.send({
    uptimePercent,
  });
}

module.exports = {
  ping,
  getStats,
};
