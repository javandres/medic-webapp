const sinon = require('sinon').sandbox.create();
require('chai').should();
const controller = require('../../../src/controllers/bulk-get');
const service = require('../../../src/services/bulk-get');

const testReq = {
  body: {
    docs: []
  }
};
const testRes = {};

describe('Bulk GET controller', () => {
  beforeEach(() => {
    sinon.stub(service, 'filterRestrictedRequest').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('request', () => {
    it ('filters for restricted requests', () => {
      return controller
        .request(testReq, testRes)
        .then(() => {
          service.filterRestrictedRequest.callCount.should.equal(1);
          service.filterRestrictedRequest.getCall(0).args[0].should.equal(testReq);
          service.filterRestrictedRequest.getCall(0).args[1].should.equal(testRes);
        });
    });
  });
});
