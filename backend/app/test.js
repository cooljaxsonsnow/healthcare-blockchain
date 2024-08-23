const { query } = require("./query");

(async () => {
  const result = await query(
    "main-channel1",
    "chaincode1",
    [],
    "getAllDoctors",
    "Doctor2",
    "doctor"
  );
  console.log(result);
})();
