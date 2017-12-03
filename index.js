// Imports the Google Cloud client library
const language = require("@google-cloud/language");

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./yhacks2017-7710fb3505fc.json";

// Instantiates a client
const client = new language.LanguageServiceClient();

const fs = require("fs");

const { scrape } = require("./puppet");

// Detects the sentiment of the text
async function analyzeEntitiesOfText(array_text) {
  let result = [];
  try {
    for (let t of array_text) {
      const document = {
        content: t,
        type: "PLAIN_TEXT"
      };

      let results = await client.analyzeEntities({ document });

      const entities = results[0].entities;
      // console.log("Entities:", JSON.stringify(entities));
      for (let entity of entities) {
        if (isPronoun(entity.name)) {
          if (
            (result[entity.name] == null) |
            (result[entity.name] == undefined)
          ) {
            result[entity.name] = { name: entity.name, salience: new Array() };
            result[entity.name].salience.push(entity.salience);
            result[entity.name].type = entity.type;
          } else {
            result[entity.name].salience.push(entity.salience);
          }
          if (entity.metadata && entity.metadata.wikipedia_url) {
            result[entity.name].wiki = entity.metadata.wikipedia_url;
            // console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
          }
        }

        console.log(JSON.stringify(entity));
      }
    }
  } catch (err) {
    console.log(err);
  }

  return scoreAggregation(result);
}

function isPronoun(string) {
  const char = string.substring(0, 1);
  return char === char.toUpperCase();
}

function scoreAggregation(arr) {
  for (let i in arr) {
    arr[i].salience =
      arr[i].salience.reduce((prev, curr) => prev + curr ** 2) /
      arr[i].salience.length;
  }

  //   console.log("AGGR:", arr);
  arr.sort((a, b) => a - b);

  let result = {};
  for (let i in arr) {
    //   console.log(item);
    if (result[arr[i].type] === undefined) {
      result[arr[i].type] = new Array();
    }
    result[arr[i].type].push(arr[i]);
  }

  return result;
}

function calculate(keyword, index, depth) {
  scrape(keyword).then(value => {
    while (fs.existsSync(`${keyword}-output-${index}.json`)) {
      index++;
    }
    fs.writeFile(
      `./output/${keyword}-output-${index}.json`,
      JSON.stringify(value),
      err => {
        if (err) throw err;
        else {
          analyzeEntitiesOfText(value).then(v => {
            //   var vv = JSON.stringify(Object.assign({}, v));
            var vv = { ...v };

            //   for (var i = 0; i < depth; i++) {
            //     console.log("calculating depth", depth);
            //     for (let j in vv) {
            //       calculate(vv[j].name, index + 1, 0);
            //     }
            //   }
            //   console.log("THIS IS IT", vv);
            fs.writeFile(
              `./analysis/${keyword}-analysis-${index}.json`,
              JSON.stringify(vv),
              err => {
                if (err) throw err;
                else {
                  //   console.log("should write");
                }
              }
            );
          });
        }
      }
    );
  });
}

var args = process.argv.slice(2);
function main() {
  //   if (isNaN(args[0]))
  // throw "Query format: npm start <number of recursion depths> [keywords]";
  //   if (args[0] == 0) {
  // throw `Depth should not be 0`;
  //   }
  //   let depth = args[0];
  //   let keywords = args.splice(1);
  let keywords = args;
  const keywordsLength = keywords.length;
  console.log("SEARCHING KEYWORDS:", keywords);
  for (var i = 0; i < keywordsLength; i++) {
    // calculate(keywords[i], i, depth);
    calculate(keywords[i], i);
  }
}

main();

/*
const importedOutput = require("./output/blockchain-output-0.json")
analyzeEntitiesOfText(importedOutput).then(result => {
    let copy = {...result};
    console.log(JSON.stringify(copy, null, 4))
})
*/

module.exports = {
  analyzeEntitiesOfText
};
