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
        const migration = SCHEMA_MIGRATIONS[i];
        await migration(conn);
        await manualDbQuery(conn, 'UPDATE MigrationHead SET migration_id = ?', [i+1]);
      }
    } catch(err) {
      throw err;
    }
    resolve(true);
  });
}

migrate();


const SCHEMA_MIGRATIONS = [
  sql(`
    CREATE TABLE Users(
      id BINARY(16) NOT NULL UNIQUE,
      email varchar(100) NOT NULL UNIQUE,
      image varchar(255) NULL,
      name varchar(50) Null,
      provider varchar(10),
      signed_up_time BIGINT UNSIGNED NOT NULL,
      PRIMARY KEY (id)
    )
  `),
  sql(`
    CREATE TABLE UserAliases(
      user_id BINARY(16) NOT NULL,
      alias_id BINARY(16) NOT NULL,
      PRIMARY KEY (user_id, alias_id)
    )
  `),
  sql(`
    CREATE TABLE Admins(
      user_id BINARY(16) NOT NULL UNIQUE,
      is_admin TINYINT UNSIGNED NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id)
    )
  `),
  sql(`
    CREATE TABLE LocalAuth(
      user_id BINARY(16) NOT NULL,
      password BINARY(60) NOT NULL,
      PRIMARY KEY (user_id)
    )
  `),
  sql(`
    CREATE TABLE PasswordReset(
      token BINARY(40) NOT NULL UNIQUE,
      user_id BINARY(16) NOT NULL,
      expires BIGINT UNSIGNED NOT NULL,
      used TINYINT UNSIGNED NOT NULL DEFAULT 0,
      PRIMARY KEY (token)
    )
  `),
  sql(`
    CREATE TABLE Analytics(
      id BINARY(16) NOT NULL UNIQUE,
      user_id BINARY(16) NOT NULL,
      event_time BIGINT UNSIGNED NOT NULL,
      location varchar(100) NOT NULL,
      event varchar(20) NOT NULL,
      value varchar(100) NOT NULL,
      PRIMARY KEY (id)
    )
  `),
  sql(`
    CREATE INDEX analytics_user_id_idx ON Analytics (user_id);
  `),
]
