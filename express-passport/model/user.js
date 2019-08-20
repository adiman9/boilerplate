const {
  constructUpdateQuery,
  dbQuery
} = require('../db/db.js');
const uuid = require('uuid/v4');
const uuidParse = require('uuid-parse');
const Model = require('./model');
const bcrypt = require('bcryptjs');
const { StringDecoder  } = require('string_decoder');
const decoder = new StringDecoder('utf8');
const {
  randomHexString
} = require('../utils');

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

var resetPassword = Model(
  async function(token, password) {
    let user_id = await checkResetToken(token);
    let token_bytes = Buffer.from(token);

    if(user_id) {
      let id_bytes = Buffer.from(uuidParse.parse(user_id));

      let hash = await bcrypt.hash(password, 10);

      let result = await dbQuery(`
        UPDATE
          LocalAuth
        SET
          password = ?
        WHERE
          user_id = ?;
        UPDATE
          PasswordReset
        SET
          used = 1
        WHERE
          token = ?
      `, [hash, id_bytes, token_bytes]);

      return !!result[0].affectedRows && !!result[1].affectedRows;
    }
    return false;
  }
)

var checkResetToken = Model(
  async function(token) {

    let token_bytes = Buffer.from(token);
    let time = new Date().getTime();

    let result = await dbQuery(`
      SELECT
        user_id
      FROM
        PasswordReset
      WHERE
        token = ? AND ? < expires AND used = 0
    `, [token_bytes, time]);

    if(result[0])
      return uuidParse.unparse(result[0].user_id);
    return false;
  }
);

var createPasswordResetToken = Model(
  async function(user_id) {

    let id_bytes = Buffer.from(uuidParse.parse(user_id));

    let resetToken = await randomHexString(20);
    let token_bytes = Buffer.from(resetToken);
    let expires = new Date().getTime() + 3600000; // 1 hour

    let result = await dbQuery(`
      INSERT INTO PasswordReset(
        token,
        user_id,
        expires
      )
      VALUES
      (?,?,?)
    `, [token_bytes, id_bytes, expires]);

    return !!result.affectedRows ? resetToken : null;
  }
);

var verifyUserPassword = Model(
  async function(user_id, pass) {

    let id_bytes = Buffer.from(uuidParse.parse(user_id));

    let result = await dbQuery(`
      SELECT
        password
      FROM
        LocalAuth
      WHERE
        user_id = ?
    `, [id_bytes]);

    let hash = decoder.write(result[0].password);
    let is_correct = await bcrypt.compare(pass, hash);

    return is_correct;
  }
);

var createUserWithPassword = Model(
  async function(email, password) {
    let user = {
      email,
      provider: 'password'
    }
    let user_from_db = await createUser(user);
    await addUserPassword(user_from_db.id, password);

    return user_from_db;
  }
);

var addUserPassword = Model(
  async function(user_id, password) {

    let id_bytes = Buffer.from(uuidParse.parse(user_id));

    let hash = await bcrypt.hash(password, 10);

    let result = await dbQuery(`
      INSERT INTO LocalAuth(
        password,
        user_id
      )
      VALUES
      (?,?)
    `, [hash, id_bytes]);

    return !!result.affectedRows;
  }
);

var isAdminById = Model(
  async function(id) {
    let ids = await getAllAdminIds();

    let index = ids.indexOf(id);
    if(index === -1)
      return false;
    else
      return true;
  }
);

var getAllAdminUsers = Model(
  async function() {

    let result = await dbQuery(`
      SELECT
        Users.id,
        Users.email,
        Users.image,
        Users.name,
        Users.provider,
        Users.signed_up_time
      FROM
        Admins
      INNER JOIN Users ON Admins.user_id = Users.id
    `);

    let admins = result.map(user => {
      return Object.assign({}, user, {
        id: uuidParse.unparse(user.id)
      });
    });

    return admins;
  }
);

var getAllAdminIds = Model(
  async function() {

    let result = await dbQuery(`
      SELECT user_id FROM Admins
    `);

    let users = result.map(user => {
      return uuidParse.unparse(user.user_id);
    });

    return users;
  }
);

var makeUserAdmin = Model(
  async function(id) {

    let user_id_bytes = Buffer.from(uuidParse.parse(id));

    let result = await dbQuery(`
      INSERT INTO Admins (
        user_id,
        is_admin
      )
      VALUES
      (?, ?)
    `, [user_id_bytes, 1]);

    return !!result.affectedRows;
  }
);

var verifyProfile = Model(
  async function(profile) {
    const id = uuidParse.unparse(Buffer.from(uuidParse.parse(profile.id)));

    let result = await dbQuery(`
      SELECT
        *
      FROM
        Users
      WHERE
        email = ?
    `, [profile.emails[0].value]);

    if (result && result[0]) {
      const profileId = uuidParse.unparse(result[0].id);

      if (profileId === id) {
        return {
          exists: true,
          valid: true,
        };
      }
      return {
        exists: true,
        valid: false,
      };
    }
    return {
      exists: false,
      valid: true,
    };
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
  verifyProfile,
}

