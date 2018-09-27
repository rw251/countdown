const puppeteer = require('puppeteer');
const { expect } = require('chai');

const globalVariables = [global.browser, global.expect];

// puppeteer options
const opts = {
  headless: false,
  slowMo: 100,
  timeout: 10000,
};

// expose variables
before(async () => {
  global.expect = expect;
  global.browser = await puppeteer.launch(opts);
});

// close browser and reset global variables
after(() => {
  browser.close();

  global.browser = globalVariables.browser;
  global.expect = globalVariables.expect;
});
