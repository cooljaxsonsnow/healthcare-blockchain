const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require('../../middleware/auth')
const { Login, register, registerPatient, getUserList, registerDoctor, getDoctorList, getPatientList } = require('../../Controller/Admin/Admin');

const router = express.Router();

router.route('/register').post(isAuthenticatedUser, authorizeRoles("Admin"), register);
router.route('/register-patient').post(isAuthenticatedUser, authorizeRoles("Admin"), registerPatient);
router.route('/register-doctor').post(isAuthenticatedUser, authorizeRoles("Admin"), registerDoctor);
router.route('/users/login').post(Login);
router.route('/list-users').get(isAuthenticatedUser, authorizeRoles("Admin"), getUserList);
router.route('/get-doctor-list').get(isAuthenticatedUser, authorizeRoles("Admin"), getDoctorList);
router.route('/get-patient-list').get(isAuthenticatedUser, authorizeRoles("Admin"), getPatientList);

module.exports = router;