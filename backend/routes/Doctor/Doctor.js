const express = require('express');
const { isAuthenticatedUser } = require('../../middleware/auth')
const { createRecord } = require('../../Controller/Record/Record');

const router = express.Router();

router.route('/create-record').post(isAuthenticatedUser, createRecord);

module.exports = router;