const axios = require("axios").default;
require("dotenv").config();

var notify = false;

async function getCurrencyConversions() {
    try {
        const fixerApiUrl = "https://api.apilayer.com/fixer/convert";
        let message = "";

        //USD to INR
        await axios.get(fixerApiUrl, {
            headers: { apiKey: process.env.FIXER_API_KEY },
            params: {
                amount: "1",
                from: "USD",
                to: "INR"
            }
        }).then((response) => {
            if (response.data.success) {
                const usd = parseFloat(response.data.result).toFixed(2);
                console.log(`The conversion rate for USD today is ${usd} INR`);
                message += `1 USD = ${usd} INR, `;
            } else {
                console.error(response.data.error.info);
            }
        });

        //SEK to INR
        await axios.get(fixerApiUrl, {
            headers: { apiKey: process.env.FIXER_API_KEY },
            params: {
                amount: "1",
                from: "CAD",
                to: "INR"
            }
        }).then((response) => {
            if (response.data.success) {
                const cad = parseFloat(response.data.result).toFixed(2);
                console.log(`The conversion rate for CAD today is ${cad} INR`);
                message += `1 SEK = ${cad} INR`;
            } else {
                console.error(response.data.error.info);
            }
        });

        sendIftttNotification(message);

    } catch (error) {
        console.error(error);
    }
}

async function getCryptoPrices() {
    try {
        const coinMarketCapApiUrl = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest";

        await axios.get(coinMarketCapApiUrl, {
            headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY },
            params: {
                symbol: "BTC,LTC"
            }
        }).then((response) => {
            if (response) {
                const btcPrice = response.data.data.BTC[0].quote.USD.price.toFixed(2);
                const ltcPrice = response.data.data.LTC[0].quote.USD.price.toFixed(2);
                console.log(`The current price of BTC is ${btcPrice} USD`);
                console.log(`The current price of LTC is ${ltcPrice} USD`);

                sendIftttNotification(`1 BTC = ${btcPrice} USD, 1 LTC = ${ltcPrice} USD`);

            } else {
                console.error(response.status.error_message);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function sendIftttNotification(message) {
    try {
        const iftttApiUrl = "https://maker.ifttt.com/trigger/notify_app/json/with/key/" + process.env.IFTTT_API_KEY;

        if (notify) {
            await axios.post(iftttApiUrl, {
                notification: message
            })
                .then(function (response) {
                    if (response) {
                    } else {
                        console.error("Could not send notification to IFTTT");
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    } catch (error) {
        console.error(error);
    }
}

switch (process.argv[2]) {
    case "true": notify = true;
    default: getCurrencyConversions().then(getCryptoPrices);
}
