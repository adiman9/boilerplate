const {
  connWithNoDb,
  manualDbQuery,
  sql
} = require('./db.js');
const config = require('../config/')('config');

async function migrate() {
  let conn = connWithNoDb();
  conn.connect();

  await manualDbQuery(conn, `CREATE DATABASE IF NOT EXISTS ${config.db.database}; use ${config.db.database};`);

  let rows = await manualDbQuery(conn, 'SHOW TABLES');

  let tables = rows.map(row => {
    // FIXME make this more robust
    let rowName = 'Tables_in_' + config.db.database;
    return row[rowName];
  });

  let index = tables.indexOf('MigrationHead');
  if(index === -1){
    await manualDbQuery(conn, 'CREATE TABLE MigrationHead (migration_id INT); INSERT INTO MigrationHead Values (0)');
  }

  let result  = await manualDbQuery(conn, 'SELECT migration_id FROM MigrationHead');
  let migrationHead = result[0].migration_id;

  await applyMigrations(migrationHead, conn);
  conn.end();
}

function applyMigrations(head, conn) {
  return new Promise(async (resolve, reject) => {
    if(head > SCHEMA_MIGRATIONS.length){
      console.error('More migrations have been run than you have available. Ensure your code is up to date');
    }

    console.log('Applying', SCHEMA_MIGRATIONS.length - head, 'migrations');

    let i;
    try {
      for(i = head; i < SCHEMA_MIGRATIONS.length; i++){
        migration = SCHEMA_MIGRATIONS[i];
        await migration(conn);
      }
      await manualDbQuery(conn, 'UPDATE MigrationHead SET migration_id = ?', [i]);
    } catch(err) {
      throw err;
    }
    resolve(true);
  });
}

migrate();


const SCHEMA_MIGRATIONS = []
