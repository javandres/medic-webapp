const sinon = require('sinon').sandbox.create();
require('chai').should();
const controller = require('../../../src/controllers/db-doc');
const service = require('../../../src/services/db-doc');

let testReq,
    testRes,
    next;

describe('db-doc controller', () => {
  beforeEach(() => {
    sinon.stub(service, 'filterRestrictedRequest').resolves();
    sinon.stub(service, 'isValidRequest');

    testReq = { body: {}, method: 'method', params: { docId: 'a' }};
    testRes = {};
    next = sinon.stub().resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('request', () => {
    it('filters restricted document requests when the request is valid', () => {
      service.isValidRequest.returns(true);
      return controller
        .requestDoc(testReq, testRes, next)
        .then(() => {
          service.isValidRequest.callCount.should.equal(1);
          service.isValidRequest.args[0].should.deep.equal([testReq.method, testReq.params.docId, testReq.body]);
          next.callCount.should.equal(0);
          service.filterRestrictedRequest.callCount.should.equal(1);
          service.filterRestrictedRequest.args[0].should.deep.equal([testReq, testRes, next]);
        });
    });

    it('directs to next route match when document request is not valid', () => {
      service.isValidRequest.returns(false);
      return controller
        .requestDoc(testReq, testRes, next)
        .then(() => {
          service.isValidRequest.callCount.should.equal(1);
          service.isValidRequest.args[0].should.deep.equal([testReq.method, testReq.params.docId, testReq.body]);
          next.callCount.should.equal(1);
          next.args[0].should.deep.equal(['route']);
          service.filterRestrictedRequest.callCount.should.equal(0);
        });
    });

    it('filters restricted attachment requests', () => {
      return controller
        .requestAttachment(testReq, testRes, next)
        .then(() => {
          service.isValidRequest.callCount.should.equal(0);
          next.callCount.should.equal(0);
          service.filterRestrictedRequest.callCount.should.equal(1);
          service.filterRestrictedRequest.args[0].should.deep.equal([testReq, testRes, next, true]);
        });
    });
  });
});