const { PrismaClient } = require('@prisma/client');
const query = require('../../app/query')

const prisma = new PrismaClient();

exports.getRecord = async (req, res) => {
  const {
    walletHash,
    orgName
  } = req.user;

  const { recordId } = req.params;
  let response = await query.query("main-channel1", "chaincode1", [recordId], "getRecord", walletHash, orgName);
  res.status(200).json({ success: true, response });
  console.log("response: ", response);
};