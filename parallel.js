const { Builder, By, Key, until } = require('selenium-webdriver');
const http = require('http');
const axios = require('axios');

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'abhisingh5';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'E9yopbnGog6knndmwTnL';

let HttpAgent = new http.Agent({
    keepAlive: true,
});

let capabilities = [
    {
        browserName: 'Firefox',
        name: 'Firefox Test',
        os: 'Windows',
        build: process.env.BROWSERSTACK_BUILD_NAME || 'Test Build 01',
        project: 'My Awesome App',
        'browserstack.debug': true,
        'browserstack.console': 'errors',
        'browserstack.networkLogs': true
    },
    {
        browserName: 'Chrome',
        name: 'Chrome Test',
        os: 'Windows',
        build: process.env.BROWSERSTACK_BUILD_NAME || 'Test Build 01',
        project: 'My Awesome App',
        'browserstack.debug': true,
        'browserstack.console': 'errors',
        'browserstack.networkLogs': true
    },
    {
        browserName: 'Android',
        name: 'Android Test',
        os_version : "9.0",
        device : "Samsung Galaxy S10",
        real_mobile : "true",
        build: process.env.BROWSERSTACK_BUILD_NAME || 'Test Build 01',
        project: 'My Awesome App',
        'browserstack.debug': true,
        'browserstack.console': 'errors',
        'browserstack.networkLogs': true
    }
]

for (let index in capabilities) {
    let driver = new Builder()
        .usingHttpAgent(HttpAgent)
        .withCapabilities(capabilities[index])
        .usingServer(`http://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub.browserstack.com/wd/hub`)
        .build();

    driver.get('http://www.google.com/ncr').then(() => {
        driver.findElement(By.name('q')).then((element) => {
            element.sendKeys('BrowserStack', Key.RETURN).then(() => {
                driver.wait(until.titleContains('BrowserStack')).then(() => driver.getTitle().then((title) => {
                    driver.getSession().then((session)=>{
                        let sessionId = session.getId();
                        let session_url = `https://api.browserstack.com/automate/sessions/${sessionId}.json`;
                        let status = 'passed';
                        if(!title.includes('BrowserStack')){
                            status = 'failed';
                        }
                        axios.put(session_url, {
                            "status": status,
                            "reason": "reason"
                        }, {
                            headers: {
                                "Content-Type": "application/json"
                            },
                            auth: {
                              username: BROWSERSTACK_USERNAME,
                              password: BROWSERSTACK_ACCESS_KEY
                            }
                          });
                    });
                    console.log(title);
                    driver.quit();
                }));
            })
        });
    });
}