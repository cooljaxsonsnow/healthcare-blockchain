const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require('../../middleware/auth')
const { Login, register, getDoctorList, getPatientList, getFacilityList, getEntityList, grantAccess } = require('../../Controller/Admin/Admin');

const router = express.Router();

router.route('/register').post(isAuthenticatedUser, authorizeRoles("Admin"), register);
router.route('/users/login').post(Login);
router.route('/get-doctor-list').get(isAuthenticatedUser, authorizeRoles("Admin"), getDoctorList);
router.route('/get-patient-list').get(isAuthenticatedUser, authorizeRoles("Admin"), getPatientList);
router.route('/get-facility-list').get(isAuthenticatedUser, authorizeRoles("Admin"), getFacilityList);
router.route('/get-entity-list').get(isAuthenticatedUser, authorizeRoles("Admin"), getEntityList);
router.route('/grant-access').post(isAuthenticatedUser, authorizeRoles("Admin"), grantAccess);

module.exports = router;