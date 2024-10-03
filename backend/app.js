'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const bodyParser = require('body-parser');
const http = require('http')
const util = require('util');
const express = require('express')
const app = express();
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const constants = require('./config/constants.json')
const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;
const session = require('express-session');
const { isAuthenticatedUser, authorizeRoles } = require('./middleware/auth')

const helper = require('./app/helper')
const invoke = require('./app/invoke')
const qscc = require('./app/qscc')
const query = require('./app/query')

require('dotenv').config();


// app.options('*', cors());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(bearerToken());

logger.level = 'debug';

var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 240000;

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

const admin = require('./routes/Admin/Admin');
const patient = require('./routes/Paitient/Patient')
const doctor = require('./routes/Doctor/Doctor')
const chaincode = require('./routes/chaincode/chaincode');
const Record = require('./routes/Record/Record');

app.use('/api', admin);
app.use('/api', patient);
app.use('/api', doctor);
app.use('/api', chaincode);
app.use('/api', Record)
