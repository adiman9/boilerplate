const {
  constructUpdateQuery,
  dbQuery
} = require('../db/db.js');
const uuid = require('uuid/v4');
const uuidParse = require('uuid-parse');
const Model = require('./model');

var addUserAlias = Model(
  async function(user, alias) {

    let user_id_bytes = Buffer.from(uuidParse.parse(user));
    let alias_id_bytes = Buffer.from(uuidParse.parse(alias));

    let result = await dbQuery(`
      INSERT INTO UserAliases(
        user_id,
        alias_id
      )
      VALUES
      (?,?)
    `, [user_id_bytes, alias_id_bytes]);

    return !!result.affectedRows;
  }
);

var getUserAliases = Model(
  async function(user) {

    let user_id_bytes = Buffer.from(uuidParse.parse(user));

    let result = await dbQuery(`
      SELECT
        alias_id
      FROM
        UserAliases
      WHERE
        user_id = ?
    `, [user_id_bytes]);

    return result.map(u => {
      return uuidParse.unparse(u.alias_id);
    });
  }
);

var createUser = Model(
  async function(user) {

    let user_id_bytes;
    if(user.id) {
      user_id_bytes = Buffer.from(uuidParse.parse(user.id))
    } else {
      user_id_bytes = new Buffer(16);
      uuid(null, user_id_bytes, 0);
    }
    let email = user.email;
    let image = user.image;
    let name = user.name;
    let provider = user.provider;
    let signed_up_time = new Date().getTime();

    let result = await dbQuery(`
        INSERT INTO Users (
          id,
          email,
          image,
          name,
          provider,
          signed_up_time
        )
        VALUES
        (?,?,?,?,?,?);
      `, [user_id_bytes, email, image, name, provider, signed_up_time]);

    const user_from_db = {
      id: uuidParse.unparse(user_id_bytes),
      email,
      image,
      name,
      provider,
      signed_up_time
    }

    return user_from_db;
  }
);

var getAllUsers = Model(
  async function() {

    let result = await dbQuery(`
      SELECT * FROM Users
    `);

    let users = result.map(user => {
      return Object.assign({}, user, {
        id: uuidParse.unparse(user.id)
      });
    });

    return users;
  }
);

var updateUserById = Model(
  async function(user_id, updates) {
    delete updates.id;
    delete updates.signed_up_time;
    delete updates.provider;

    // done to ensure that the user_id is always a 16byte uuid
    user_id = uuidParse.unparse(Buffer.from(uuidParse.parse(user_id)));

    const query = constructUpdateQuery(
      'Users',
      updates,
      {
        id: {
          val: user_id,
          isUUID: true
        }
      }
    );

    let result = await dbQuery(query, []);

    return !!result.affectedRows;
  }
);

var getUserById = Model(
  async function(id) {

    let user_id_bytes = Buffer.from(uuidParse.parse(id));

    let result = await dbQuery(`
      SELECT
        *
      FROM
        Users
      WHERE id = ?
    `, [user_id_bytes]);

    let user = result.map(user => {
      return Object.assign({}, user, {
        id: uuidParse.unparse(user.id)
      });
    });

    return user[0];
  }
);

var getUserByEmail = Model(
  async function(email) {

    let result = await dbQuery(`
      SELECT
        *
      FROM
        Users
      WHERE email = ?
    `, [email]);

    let user = result.map(user => {
      return Object.assign({}, user, {
        id: uuidParse.unparse(user.id)
      });
    });

    return user[0];
  }
);

var getOrCreateUserFromProfile = Model(
  async function(profile) {
    let user_from_db = await getUserById(profile.id);

    if(user_from_db) {
      user_from_db.method = 'get';
      return user_from_db;
    } else {
      let user = {
        id: profile.id,
        name: profile.displayName,
        provider: profile.provider
      }
      if(profile.emails && profile.emails[0])
        user.email = profile.emails[0].value;

      if(profile.photos && profile.photos[0])
        user.image = profile.photos[0].value;

      user_from_db = await createUser(user);

      user_from_db.method = 'create';
      return user_from_db;
    }
  }
);

var createAnonymousUser = Model(
  async function() {
    // Doesn't save to the db as it is only to associate sessions with a user. Analytics data will use the uuid but that will ultimately be migrated to a full user when they sign up.
    let user_id_bytes = new Buffer(16);
    uuid(null, user_id_bytes, 0);

    const user = {
      id: uuidParse.unparse(user_id_bytes),
      provider: 'anonymous'
    }

    return user;
  }
);

module.exports = {
  addUserAlias,
  createAnonymousUser,
  createUser,
  getAllUsers,
  getOrCreateUserFromProfile,
  getUserAliases,
  getUserByEmail,
  getUserById,
  updateUserById,
}

