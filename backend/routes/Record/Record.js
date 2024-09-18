const express = require('express');
const { isAuthenticatedUser } = require('../../middleware/auth')
const { getRecord } = require('../../Controller/Entity/Entity');

const router = express.Router();

router.route('/get-record/:recordId').get(isAuthenticatedUser, getRecord);

module.exports = router;