const { Contract } = require("fabric-contract-api");

class KVContract extends Contract {
  constructor() {
    super("KVContract");
  }

  async registerPatient(ctx, patientId, name) {
    const newPatient = {
      docType: "patient",
      name,
      recordId: null,
    };

    const buffer = Buffer.from(JSON.stringify(newPatient));
    await ctx.stub.putState(patientId, buffer);

    return { success: "OK" };
  }

  async getPatient(ctx, patientId) {
    const buffer = await ctx.stub.getState(patientId);

    if (!buffer || buffer.length === 0) {
      throw new Error(`The patient with ID ${patientId} does not exist`);
    }

    const patient = JSON.parse(buffer.toString());

    return patient;
  }

  async patientExists(ctx, patientId) {
    const isPatient = await ctx.stub.getState(patientId);

    return isPatient && isPatient.length > 0;
  }

  async getAllPatients(ctx) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'patient';
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
  }

  async registerDoctor(ctx, doctorId, name) {
    const newDoctor = {
      docType: "doctor",
      name,
      accessList: [],
    };

    const buffer = Buffer.from(JSON.stringify(newDoctor));
    await ctx.stub.putState(doctorId, buffer);

    return { success: "OK" };
  }

  async getDoctor(ctx, doctorId) {
    const buffer = await ctx.stub.getState(doctorId);

    if (!buffer || buffer.length === 0) {
      throw new Error(`The doctor with ID ${doctorId} does not exist`);
    }

    const doctor = JSON.parse(buffer.toString());

    return doctor;
  }

  async doctorExists(ctx, doctorId) {
    const isDoctor = await ctx.stub.getState(doctorId);

    return isDoctor && isDoctor.length > 0;
  }

  async getAllDoctors(ctx) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'doctor';
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
  }

  async createRecord(ctx, recordId, patientId, doctorId, metadata) {
    const newRecord = {
      docType: "record",
      patientId,
      doctorId,
      metadata,
      createdAt: this._getNow(ctx),
      updatedAt: this._getNow(ctx),
    };

    const [oldRecordBuffer, patient] = await Promise.all([ctx.stub.getState(recordId), this.getPatient(ctx, patientId)]);

    if (oldRecordBuffer && oldRecordBuffer.length > 0) {
      const oldRecord = JSON.parse(oldRecordBuffer.toString());
      newRecord.createdAt = oldRecord.createdAt;
    }

    if (!patient.recordId) {
      patient.recordId = recordId;
      await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
    }

    await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(newRecord)));
    return { success: "OK" };
  }

  async getRecord(ctx, recordId) {
    const recordAsBytes = await ctx.stub.getState(recordId);
    if (!recordAsBytes || recordAsBytes.length === 0) {
      throw new Error(`The record with ID ${recordId} does not exist`);
    }
    return JSON.parse(recordAsBytes.toString());
  }

  async getAllRecords(ctx) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'record';
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
  }

  async updateRecord(ctx, recordId, patientId, doctorId, metadata) {
    if (!await this.patientExists(ctx, patientId)) {
      throw new Error(`The patient with ID ${patientId} does not exist`);
    }

    if (!await this.doctorExists(ctx, doctorId)) {
      throw new Error(`The doctor with ID ${doctorId} does not exist`);
    }

    const recordAsBytes = await ctx.stub.getState(recordId);
    if (!recordAsBytes || recordAsBytes.length === 0) {
      throw new Error(`The record with ID ${recordId} does not exist`);
    }

    const record = JSON.parse(recordAsBytes.toString());
    record.metadata = metadata;
    record.updatedAt = this._getNow(ctx);

    await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));
    return { success: "OK" };
  }

  async GetQueryResultForQueryString(ctx, queryString) {
    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let results = await this._GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  _getNow(ctx) {
    const timestamp = ctx.stub.getTxTimestamp();
    const transactionTime = new Date(timestamp.getSeconds() * 1000).toISOString();
    return transactionTime;
  }

  async _GetAllResults(iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.txId;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
        } else {
          jsonRes.Key = res.value.key;
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }
}

module.exports = KVContract;