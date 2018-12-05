const should = require('should');
const scheduler = require('./scheduler');

describe('[service] Scheduler', function () {
  it('should be able to start scheduler', async function () {
    await new Promise((resolve) => {
      const emitter = scheduler.start('* * * * * *');
      emitter.once('scheduler.before', resolve);
    });
  });
  it('should be able to process', async function () {
    const res = await scheduler.process();
    should(res).be.an.Object();
    res.should.have.property('status').which.is.a.String();
    res.should.have.property('services').which.is.an.Array();
    res.services.forEach((item) => {
      should(item).be.an.Object();
      item.should.have.property('serviceName').which.is.a.String();
      item.should.have.property('details').which.is.an.Object();
      item.should.have.property('status').which.is.a.String();
    });
  });
  it('should be able to get average uptime', async function () {
    const response = await scheduler.getAverageUptime();
    should(response).be.a.Number();
  });
});
