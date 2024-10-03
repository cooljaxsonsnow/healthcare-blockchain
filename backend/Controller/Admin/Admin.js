const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const { PrismaClient } = require("@prisma/client");
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const constants = require('../../config/constants.json')
const helper = require('../../app/helper')
const invoke = require('../../app/invoke')
const qscc = require('../../app/qscc')
const query = require('../../app/query');
const { generateHash } = require('../../utils/hash');
const { capitalizeFirstLetter } = require('../../utils/string');

const prisma = new PrismaClient();

logger.level = 'debug';

function getErrorMessage(field) {
  var response = {
    success: false,
    message: field + ' field is missing or Invalid in the request'
  };
  return response;
}

exports.register = async (req, res, next) => {
  console.log('///////////', req.body);

  const {
    firstName = "",
    lastName = "",
    name = "",
    email = "",
    orgName,
    password
  } = req.body;

  let fcn;

  if (!['doctor', 'patient', 'facility', 'entity'].includes(orgName)) {
    console.error('Org name does not exist')
    res.status(404).json({ success: false, message: 'Org name does not exist' })
    return;
  }

  fcn = `register${capitalizeFirstLetter(orgName)}`;

  const hash = generateHash()

  const user = await prisma.user.findMany({
    where: {
      email: email
    },
  })

  if (user.length > 0) {
    res.status(404).json({ success: false, message: 'User already exist' })
    return;
  }

  let response = await helper.getRegisteredUser(hash, orgName, true);

  let args;

  if (['doctor', 'patient'].includes(orgName)) {
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First name and Last name are required for doctor and patient' });
    }
    args = [firstName, lastName, hash];
  } else {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required for facility and entity' });
    }
    args = [name, hash];
  }

  // ledger
  let message = await invoke.invokeTransaction("main-channel1", "chaincode1", fcn, args, hash, orgName, {});

  console.log("ledger message: ", message);

  logger.debug('-- returned from registering the email %s for organization %s', email, orgName);
  if (response && typeof response !== 'string' && typeof message != 'string') {
    logger.debug('Successfully registered the email %s for organization %s', email, orgName);
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { firstName, lastName, orgName, password: password_hash, email, walletHash: hash } })

    var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET,);


    response.token = token;
    response.fullname = `${user.firstName} ${user.lastName}`;
    response.userId = user.id
    response.orgName = user.orgName;
    res.json(response);
  } else {
    logger.debug('Failed to register the email %s for organization %s with::%s', `${firstName} ${lastName}`, orgName, response);
    res.json({ success: false, message: response });
  }
}

exports.Login = async (req, res, next) => {
  var email = req.body.email;
  var orgName = req.body.orgName;
  var password = req.body.password;
  logger.debug('End point : /users');
  logger.debug('User name : ' + email);
  logger.debug('Org name  : ' + orgName);

  if (!email) {
    res.json(getErrorMessage('\'email\''));
    return;
  }
  if (!orgName) {
    res.json(getErrorMessage('\'orgName\''));
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or Password "
    });
  }
  console.log(orgName, user.orgName)
  if (user.orgName != orgName) {
    return res.status(400).json({
      success: false,
      message: "email on this organization does not exits"
    });

  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  console.log(isPasswordMatched)

  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or Password"
    });

  }

  var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET,);

  if (orgName == "Admin") {

    return res.status(200).json({ success: true, token, email: user.email, orgName: user.orgName, userId: user.userId });


  }
  let isUserRegistered = await helper.isUserRegistered(user.walletHash, orgName);

  if (isUserRegistered) {

    res.status(200).json({ success: true, token, email: user.email, orgName: user.orgName, userId: user.id });

  } else {
    res.status(400).json({ success: false, message: `User with email ${email} is not registered with ${orgName}, Please register first.` });
  }

}

exports.getDoctorList = async (req, res) => {
  let ccp = await helper.getCCP('doctor');

  const caURL = await helper.getCaUrl('doctor', ccp);
  const ca = new FabricCAServices(caURL);

  const walletPath = await helper.getWalletPath('doctor');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  let adminIdentity = await wallet.get("admin");
  if (!adminIdentity) {
    console.log(
      'An identity for the admin user "admin" does not exist in the wallet'
    );
    await helper.enrollAdmin('doctor', ccp);
    adminIdentity = await wallet.get("admin");
    console.log("Admin Enrolled Successfully");
  }

  let respose = await query.query("main-channel1", "chaincode1", [], "getAllDoctors", 'admin', 'doctor');

  res.status(200).json({ success: true, data: respose });
  console.log(respose);
}

exports.getPatientList = async (req, res) => {
  let ccp = await helper.getCCP('patient');

  const caURL = await helper.getCaUrl('patient', ccp);
  const ca = new FabricCAServices(caURL);

  const walletPath = await helper.getWalletPath('patient');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  let adminIdentity = await wallet.get("admin");
  if (!adminIdentity) {
    console.log(
      'An identity for the admin user "admin" does not exist in the wallet'
    );
    await helper.enrollAdmin('patient', ccp);
    adminIdentity = await wallet.get("admin");
    console.log("Admin Enrolled Successfully");
  }

  let respose = await query.query("main-channel1", "chaincode1", [], "getAllPatients", 'admin', 'patient');

  res.status(200).json({ success: true, data: respose });
  console.log(respose);
}

exports.getFacilityList = async (req, res) => {
  let ccp = await helper.getCCP('facility');

  const caURL = await helper.getCaUrl('facility', ccp);
  const ca = new FabricCAServices(caURL);

  const walletPath = await helper.getWalletPath('facility');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  let adminIdentity = await wallet.get("admin");
  if (!adminIdentity) {
    console.log(
      'An identity for the admin user "admin" does not exist in the wallet'
    );
    await helper.enrollAdmin('facility', ccp);
    adminIdentity = await wallet.get("admin");
    console.log("Admin Enrolled Successfully");
  }

  let respose = await query.query("main-channel1", "chaincode1", [], "getAllFacilities", 'admin', 'facility');

  res.status(200).json({ success: true, data: respose });
  console.log(respose);
}

exports.getEntityList = async (req, res) => {
  let ccp = await helper.getCCP('entity');

  const caURL = await helper.getCaUrl('entity', ccp);
  const ca = new FabricCAServices(caURL);

  const walletPath = await helper.getWalletPath('entity');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  let adminIdentity = await wallet.get("admin");
  if (!adminIdentity) {
    console.log(
      'An identity for the admin user "admin" does not exist in the wallet'
    );
    await helper.enrollAdmin('entity', ccp);
    adminIdentity = await wallet.get("admin");
    console.log("Admin Enrolled Successfully");
  }

  let respose = await query.query("main-channel1", "chaincode1", [], "getAllEntities", 'admin', 'entity');

  res.status(200).json({ success: true, data: respose });
  console.log(respose);
}

exports.grantAccess = async (req, res) => {
  const {
    recordId,
    entityId,
    paymentTxId,
  } = req.body;
  let ccp = await helper.getCCP('entity');

  const caURL = await helper.getCaUrl('entity', ccp);
  const ca = new FabricCAServices(caURL);

  const walletPath = await helper.getWalletPath('entity');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  let adminIdentity = await wallet.get("admin");
  if (!adminIdentity) {
    console.log(
      'An identity for the admin user "admin" does not exist in the wallet'
    );
    await helper.enrollAdmin('entity', ccp);
    adminIdentity = await wallet.get("admin");
    console.log("Admin Enrolled Successfully");
  }

  let message = await invoke.invokeTransaction("main-channel1", "chaincode1", 'grantAccess', [recordId, entityId, paymentTxId], 'admin', 'entity', {});

  console.log("ledger message: ", message);

  if (typeof message != 'string') {
    logger.debug('Successfully grant access');
    res.status(201).json({ success: true, message: "Successfully grant access" });
  } else {
    logger.debug('Failed to grant access to entity');
    res.json({ success: false, message: 'Failed to grant access to entity' });
  }
}
