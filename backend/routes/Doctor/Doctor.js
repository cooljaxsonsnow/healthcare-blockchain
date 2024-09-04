const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require('../../middleware/auth')
const { getPrescription, prescription, createRecord, getRecord } = require('../../Controller/Doctor/Doctor');

const router = express.Router();

router.route('/prescription').post(isAuthenticatedUser, prescription);
router.route('/get-prescription').get(isAuthenticatedUser, getPrescription);
router.route('/get-record/:recordId').get(isAuthenticatedUser, getRecord);
router.route('/create-record').post(isAuthenticatedUser, createRecord);

module.exports = router;