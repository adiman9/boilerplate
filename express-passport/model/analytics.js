const {
  dbQuery
} = require('../db/db.js');
const uuid = require('uuid/v4');
const uuidParse = require('uuid-parse');
const Model = require('./model');

var getAnalyticsByTypeByUser = Model(
  async function(type, user_id) {

    let id_bytes = Buffer.from(uuidParse.parse(user_id));

    let result = await dbQuery(`
      SELECT
        *
      FROM
        Analytics
      WHERE
        event = ? AND user_id = ?
    `, [type, id_bytes]);

    let analytics = result.map(ev => {
      return Object.assign({}, ev, {
        id: uuidParse.unparse(ev.id),
        user_id: uuidParse.unparse(ev.user_id)
      });
    });

    return analytics;
  }
);

var getAnalyticsByType = Model(
  async function(type) {

    let result = await dbQuery(`
      SELECT
        *
      FROM
        Analytics
      WHERE
        event = ?
    `, [type]);

    let analytics = result.map(ev => {
      return Object.assign({}, ev, {
        id: uuidParse.unparse(ev.id),
        user_id: uuidParse.unparse(ev.user_id)
      });
    });

    return analytics;
  }
);

var getUserAnalytics = Model(
  async function(user_id) {

    let id_bytes = Buffer.from(uuidParse.parse(user_id));

    let result = await dbQuery(`
      SELECT
        *
      FROM
        Analytics
      WHERE
        user_id = ?
    `, [id_bytes]);

    let analytics = result.map(ev => {
      return Object.assign({}, ev, {
        id: uuidParse.unparse(ev.id),
        user_id: uuidParse.unparse(ev.user_id)
      });
    });

    return analytics;
  }
);

var addAnalyticsEvent = Model(
  async function(analytics) {

    event_id_bytes = new Buffer(16);
    uuid(null, event_id_bytes, 0);
    let event_time = new Date().getTime();
    const {
      user_id,
      location,
      event,
      value
    } = analytics;

    let user_id_bytes = Buffer.from(uuidParse.parse(user_id));

    let result = await dbQuery(`
      INSERT INTO Analytics (
        id,
        user_id,
        event_time,
        location,
        event,
        value
      )
      VALUES
      (?,?,?,?,?,?)
    `, [
      event_id_bytes,
      user_id_bytes,
      event_time,
      location,
      event,
      value
    ]);

    return !!result.affectedRows;
  }
);

module.exports = {
  addAnalyticsEvent,
  getAnalyticsByType,
  getAnalyticsByTypeByUser,
  getUserAnalytics,
}

