const { PrismaClient } = require('@prisma/client');
const invoke = require('../../app/invoke')
const { generateHash } = require('../../utils/hash');

const prisma = new PrismaClient();

exports.createRecord = async (req, res) => {
  const {
    patientId,
    facilityId,
    metadata,
  } = req.body;

  const {
    walletHash,
    orgName,
  } = req.user;

  // create random record id
  let recordId = generateHash();
  const transient = {};

  let response = await invoke.invokeTransaction("main-channel1", "chaincode1", "createRecord", [recordId, patientId, walletHash, facilityId, JSON.stringify(metadata)], walletHash, orgName, transient);
  console.log("ledger message: ", response);
  res.status(200).json({ success: true, message: "Record Added Successfully" });
}
