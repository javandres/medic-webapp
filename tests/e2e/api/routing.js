const _ = require('underscore'),
      utils = require('../../utils');

const password = 'passwordSUP3RS3CR37!';

const parentPlace = {
  _id: 'PARENT_PLACE',
  type: 'district_hospital',
  name: 'Big Parent Hostpital'
};

const users = [
  {
    username: 'offline',
    password: password,
    place: {
      _id: 'fixture:offline',
      type: 'health_center',
      name: 'Offline place',
      parent: 'PARENT_PLACE'
    },
    contact: {
      _id: 'fixture:user:offline',
      name: 'OfflineUser'
    },
    roles: ['district-manager', 'kujua_user', 'data_entry', 'district_admin']
  },
  {
    username: 'online',
    password: password,
    place: {
      _id: 'fixture:online',
      type: 'health_center',
      name: 'Online place',
      parent: 'PARENT_PLACE'
    },
    contact: {
      _id: 'fixture:user:online',
      name: 'OnlineUser'
    },
    type: 'national-manager',
    roles: ['national-manager', 'kujua_user', 'data_entry', 'national_admin']
  }
];

const restrictedRequestOptions = {
  auth: `offline:${password}`,
  method: 'GET'
};

const unrestrictedRequestOptions = {
  auth: `online:${password}`,
  method: 'GET'
};

const DOCS_TO_KEEP = [
  'PARENT_PLACE',
  /^messages-/,
  /^fixture/,
  /^org.couchdb.user/,
];

describe('restricted users routing', () => {
  beforeAll(done => {
    utils
      .saveDoc(parentPlace)
      .then(() => Promise.all(users.map(user => utils.request({
        path: '/api/v1/users',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: user
      }))))
      .then(done);
  });

  afterAll(done =>
    utils
      .revertDb()
      .then(() => utils
        .request({
          path: '/_users/_all_docs',
          method: 'POST',
          body: JSON.stringify({ keys: users.map(({username}) => `org.couchdb.user:${username}`) }),
          headers: { 'content-type': 'application/json' }
        })
        .then(({ rows }) => utils.request({
          path: '/_users/_bulk_docs',
          method: 'POST',
          body: JSON.stringify({ docs: rows.map(row => ({ _id: row.id, _rev: row.value.rev, _deleted: true })) }),
          headers: { 'Content-Type': 'application/json' }
        })))
      .then(done)
  );

  afterEach(done => utils.revertDb(DOCS_TO_KEEP, true).then(done));

  it('restricts _design/*/_list/*', () => {
    const path = '/_design/medic/_list/test';
    return utils
      .requestOnTestDb(_.extend({ path }, restrictedRequestOptions))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({ path }, unrestrictedRequestOptions)))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(404);
        expect(err.responseBody.error).toEqual('list_error');
      });
  });

  it('restricts _design/*/_show/*', () => {
    const path = '/_design/medic/_show/test';
    return utils
      .requestOnTestDb(_.extend({ path }, restrictedRequestOptions))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({ path }, unrestrictedRequestOptions)))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(404);
        expect(err.responseBody.error).toEqual('not_found');
      });
  });

  it('restricts _design/*/_view/*', () => {
    const path = '/_design/medic/_view/test';
    return utils
      .requestOnTestDb(_.extend({ path }, restrictedRequestOptions))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({ path }, unrestrictedRequestOptions)))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(404);
        expect(err.responseBody.error).toEqual('not_found');
      });
  });

  it('restricts _find', () => {
    const request = {
      path: '/_find',
      method: 'POST',
      body: JSON.stringify({ selector: { type: 'person' }, limit: 1 }),
      headers: { 'Content-Type': 'application/json' }
    };

    return utils
      .requestOnTestDb(_.extend({}, restrictedRequestOptions, request))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({}, unrestrictedRequestOptions, request)))
      .then(result => {
        expect(result.docs.length).toEqual(1);
      });
  });

  it('restricts _explain', () => {
    const request = {
      path: '/_explain',
      method: 'POST',
      body: JSON.stringify({ selector: { type: 'person' }, limit: 1 }),
      headers: { 'Content-Type': 'application/json' }
    };

    return utils
      .requestOnTestDb(_.extend({}, restrictedRequestOptions, request))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({}, unrestrictedRequestOptions, request)))
      .then(result => {
        expect(result.limit).toEqual(1);
        expect(result.fields).toEqual('all_fields');
      });
  });

  it('restricts _index', () => {
    const request = {
      path: '/_index',
      method: 'POST',
      body: JSON.stringify({ index: {} }),
      headers: { 'Content-Type': 'application/json' }
    };

    return utils
      .requestOnTestDb(_.extend({}, restrictedRequestOptions, request))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({}, unrestrictedRequestOptions, request)))
      .catch(err => {
        expect(err.responseBody.error).toEqual('invalid_key');
      });
  });

  it('restricts _purge', () => {
    const request = {
      path: '/_purge',
      method: 'POST',
      body: JSON.stringify({ someId: ['1-someRev'] }),
      headers: { 'Content-Type': 'application/json' }
    };

    return utils
      .requestOnTestDb(_.extend({}, restrictedRequestOptions, request))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.statusCode).toEqual(403);
        expect(err.responseBody.error).toEqual('forbidden');
      })
      .then(() => utils.requestOnTestDb(_.extend({}, unrestrictedRequestOptions, request)))
      .then(result => expect(result).toEqual('Should not be a successful request'))
      .catch(err => {
        expect(err.responseBody.error).toEqual('bad_request');
      });
  });
});