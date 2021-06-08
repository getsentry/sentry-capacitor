const replace = require("replace-in-file");

const pjson = require("../package.json");

replace({
  files: ["src/version.ts"],
  from: /\d+\.\d+.\d+(?:-\w+(?:\.\w+)?)?/g,
  to: pjson.version,
})
  .then((changedFiles) => {
    console.log("Modified files:", changedFiles.join(", "));
  })
  .catch((error) => {
    console.error("Error occurred:", error);
  });
