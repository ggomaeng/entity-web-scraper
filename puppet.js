const puppeteer = require("puppeteer");
const { analyzeEntitiesOfText } = require("./index");
const fs = require("fs");

async function scrape(keyword) {
  const browser = await puppeteer.launch({
    timeout: 120000,
    headless: false,
    args: ["--lang=en-US,en"]
  }); // default is true
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en"
  });
  await page.goto(`https://www.google.com/search?q=${keyword}`);
  const URLs = await page.$$eval(".r a", links => {
    return links.map(l => {
      return l.href;
    });
  });

  let listLength = URLs.length;
  let index = 0;
  let texts = [];

  for (let i = 0; i < URLs.length; i++) {
    const url = URLs[i];
    console.log("visiting url", url);

    try {
      await page.goto(`${url}`);
      page.waitForNavigation({ timeout: 0, waitUntil: "domcontentloaded" });
      const result = await page.evaluate(() => {
        console.log("scraping...");
        return Array.from(document.querySelectorAll("*"))
          .filter(
            el =>
              el.childElementCount === 0 &&
              !(
                el.tagName === "SCRIPT" ||
                el.tagName === "STYLE" ||
                el.tagName === "NOSCRIPT"
              )
          )
          .filter(el => el.textContent.replace(/\s/g, "").length > 200)
          .reduce((acc, curr) => acc + curr.textContent, "");
      });
      texts.push(result);
      console.log("finished page", i);
    } catch (err) {
      console.log(err);
    }
  }

  await browser.close();
  return texts;
}

//test
function test() {
  scrape("deep learning").then(value => {
    console.log(value); // Success!
    fs.writeFile("output.json", JSON.stringify(value));
  });
}

module.exports = {
    scrape
}