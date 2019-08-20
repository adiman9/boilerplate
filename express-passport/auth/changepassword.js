const express = require('express');
const router = express.Router();
const userModel = require('../../model/user');
const emailController = require('../../controllers/email');
const logger = require('../../common/logger');

// /auth/changepassword
router.post('/', changeUserPassword);


async function changeUserPassword(req, res, next) {
  const form = req.body;
  const user = req.user;
  const {
    oldPass,
    newPass,
    repeatPass,
  } = form;
  logger.info(`password change requested for user ${user.id}`);

  req.checkBody('newPass', 'New password is required').notEmpty();
  req.checkBody('oldPass', 'Old password is required').notEmpty();
  req.checkBody('newPass', 'Old password is required').notEmpty();
  req.checkBody('repeatPass','Passwords do not match.').equals(newPass);

  let result = await req.getValidationResult();
  let errors = result.array();

  if(errors.length) {
    logger.info('validation for password change for user ${user.id} failed. ${errors}');
    res.json({errors})
  } else {
    let valid_pass = await userModel.verifyUserPassword(user.id, oldPass);

    if (!valid_pass) {
      return res.json({success: false, errors: [{ msg: 'Old password is not valid' }]})
    }
    const success = await userModel.addUserPassword(user.id, newPass);
    if (success) {
      return res.json({success: true});
    } else {
      return res.json({success: false});
    }
  }
}

module.exports = router;
