const puppeteer = require("puppeteer");

async function getThumbnail(keyword){
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${keyword}&tbm=isch`);
    return await page.$eval(`img[alt^="Image result"]`, el => el.src);
}

getThumbnail("basketball").then(href => {
    console.log(`href:`, href);
})