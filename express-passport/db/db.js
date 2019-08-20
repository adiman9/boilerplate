const mysql = require('mysql');
const config = require('../config/')('config');
const logger = require('../common/logger');

module.exports = {
  connWithNoDb,
  constructUpdateQuery,
  getDbConnection,
  dbQuery,
  manualDbQuery,
  sql,
  endPoolConn,
}

const dbConfig = config.db;
let pool;

function createConnectionPool() {
  pool = mysql.createPool({
    connectionLimit: dbConfig.connectionLimit,
    multipleStatements: dbConfig.multipleStatements,
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    debug: dbConfig.debug,
  });
}

createConnectionPool();

function connWithNoDb() {
  let options = {
    multipleStatements: dbConfig.multipleStatements,
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  }
  return mysql.createConnection(options);
}

function getDbConnection() {
  return new Promise(async (resolve, reject) => {
    pool.getConnection((err, conn) => {
      if(err){
        throw err;
        reject(err);
      }
      resolve(conn);
    });
  });
}

function dbQuery(query, args){
  return new Promise(async (resolve, reject) => {
    pool.query(query, args, (err, results, fields) => {
      // TODO handle error better than just throwing
      if(err) throw err;
      resolve(results);
    })
  });
}

function manualDbQuery(conn, query, args){
  return new Promise(async (resolve, reject) => {
    conn.query(query, args, (err, results, fields) => {
      // TODO handle error better than just throwing
      if(err) throw err;
      resolve(results);
    })
  });
}

function sql(sql) {
  return (conn) => {
    return new Promise(async (resolve, reject) => {
      let results = await manualDbQuery(conn, sql);
      resolve(results);
    });
  }
}

function endPoolConn(sql, args) {
  return new Promise(async (resolve, reject) => {
    pool.end();
    resolve();
  });
}

function constructUpdateQuery(
  table,
  updateObj,
  whereObj
) {

  // TODO escape table, update vals and where vals Wed 19 Jul 2017 17:50:07 UTC

  let updates = Object.keys(updateObj);
  let wheres = Object.keys(whereObj);
  let totalUpdates = updates.length;
  let totalWheres = wheres.length;

  let query = `
    UPDATE ${table}
    SET
  `;

  query += updates.reduce((str, key, i) => {
    let updateVal = updateObj[key];
    str += `${key} = '${updateVal}'`;

    if(i < totalUpdates - 1) {
      str += ', '
    }
    return str;
  }, '');

  if(wheres.length) {
    query += `
      WHERE
    `;

    query += wheres.reduce((str, key, i) => {
      let whereVal = whereObj[key];
      if(whereVal.isUUID) {
        let val = whereVal.val.replace(/-/g, '');
        str += `${key} = UNHEX('${val}')`;
      } else {
        str += `${key} = '${whereVal.val}'`;
      }

      if(i < totalWheres - 1) {
        str += ` ${whereVal.logic} `;
      }
      return str;
    }, '');
  }

  return query;
}
