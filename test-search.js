const https = require("https");
const internalAgent = new https.Agent({ rejectUnauthorized: false });
https.get("https://172.19.1.11:9870/api/healthcare-search-projections/data?query=cardio&type=4", { agent: internalAgent }, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => console.log(body.substring(0, 1500)));
}).on("error", console.error);
