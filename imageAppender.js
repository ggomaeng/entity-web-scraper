const path = "./analysis/trending education technologies-analysis-0.json";
let a = require(path);
const fs = require("fs");
const { getThumbnail } = require("./thumb");
process.setMaxListeners(0);

async function something() {
  let result = {};
  for (var topic of Object.keys(a)) {
    if (topic == "OTHER") {
      for (var item of a[topic]) {
        if (result[topic] === undefined) result[topic] = new Array();
        const image = await getThumbnail(item.name);
        const obj = { ...item, image };
        console.log(obj);
        result[topic].push(obj);
      }
    }
  }
  return result;
}

something().then(v => {
  fs.writeFile(path, JSON.stringify(v));
});
