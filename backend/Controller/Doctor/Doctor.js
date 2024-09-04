const User = require('../../Model/Users');
const Record = require('../../Model/PaitientRecords');
const constants = require('../../config/constants.json')
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const helper = require('../../app/helper')
const invoke = require('../../app/invoke')
const qscc = require('../../app/qscc')
const query = require('../../app/query')
const jwt = require('jsonwebtoken');
logger.level = 'debug';
function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

exports.prescription = async (req, res, next) => {
    console.log("req.body: ", req.body);
    const {
        patientId,
        metadata,
    } = req.body;
    let username;
    let orgName;

    const userdata = await User.findOne({ userId: req.session.uid }).then(
        async (result) => {
            username = result.userName;
            orgName = result.orgName;
            if (!result.access.includes(patientId)) {
                return res.status(400).json({ success: false, message: `Doctor do not have right to write prescription for this user` });
            }
        }
    )

    let recordId;

    while (true) {
        recordId = Math.floor(10000 + Math.random() * 90000);
        const us = await Record.findOne({ recordId }).select("+password");
        if (us) {
            continue
        } else {
            break
        }
    }

    logger.debug("req.body: ", req.body);

    const args = [recordId, patientId, req.session.uid, metadata];
    const transient = {};

    // check user has access or not
    logger.debug("args: ", args);

    args.push(new Date().toISOString());

    let response = await invoke.invokeTransaction("main-channel1", "chaincode1", "createRecord", args, username, orgName, transient);

    console.log("ledger message: ", response);

    const records = await Record.create({
        doctorId: req.session.uid, patientId, RecordId: recordId

    })

    res.status(200).json({ success: true, message: "Record Added Successfully", records });
}

exports.getPrescription = async (req, res, next) => {

    const patientId = req.query.patientId;
    var username;

    const patientUsername = await User.findOne({ userId: patientId }).then((result) => {
        console.log("patientId: ", patientId);
        console.log("result: ", result);

        username = result.userName;
    })

    var recordsData = [];

    const records = await Record.find({ doctorId: req.session.uid, patientId }).then(async (result) => {

        console.log("result: ", result);

        await Promise.all(Object.keys(result).map(async (item) => {

            let message = await query.query("main-channel1", "chaincode1", [result[item].RecordId], "getPrescriptionRecord", username, "patient");

            console.log("message: ", message);

            message.medicines = JSON.parse(JSON.parse(message.medicines));
            message.labTests = JSON.parse(JSON.parse(message.labTests));

            recordsData.push(message);

        }))

    })

    console.log("response");

    res.status(200).json({ success: true, recordsData });
}

exports.createRecord = async (req, res) => {
    const {
        patientId,
        recordId,
        metadata,
    } = req.body;

    const {
        userName,
        orgName,
        userId
    } = req.user;

    // create random record id
    let record_id;
    const transient = {};
    while (true) {
        record_id = recordId || Math.floor(10000 + Math.random() * 90000);
        const us = await Record.findOne({ record_id }).select("+password");
        if (us) {
            continue
        } else {
            break
        }
    }

    let response = await invoke.invokeTransaction("main-channel1", "chaincode1", "createRecord", [record_id, patientId, userId, JSON.stringify(metadata)], userName, orgName, transient);
    console.log("ledger message: ", response);
    res.status(200).json({ success: true, message: "Record Added Successfully" });
}

exports.getRecord = async (req, res) => {
    const {
        userName,
        orgName
    } = req.user;

    console.log(req.user);
    const { recordId } = req.params;
    let response = await query.query("main-channel1", "chaincode1", [recordId], "getRecord", userName, orgName);
    res.status(200).json({ success: true, response });
    console.log("response: ", response);
}
