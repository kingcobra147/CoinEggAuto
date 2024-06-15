const axios = require('axios');
const TG_WEB_APP_DATA = ''; // Copy TG_WEB_APP_DATA trong mục Application của DevTools bỏ vào đây
let TOKEN = "";
const DATA = JSON.stringify({
    "token": TOKEN,
    "egg_uid": '',
    "init_data": TG_WEB_APP_DATA,
    "referrer": ""
});
const HEADER = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'vi;q=0.8',
    'content-type': 'application/json',
    'origin': 'https://app-coop.rovex.io',
    'priority': 'u=1, i',
    'referer': 'https://app-coop.rovex.io/',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
}
const CONFIG = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '',
    headers: HEADER,
    data: DATA
};

async function getToken() {
    CONFIG.url = 'https://egg-api.hivehubs.app/api/login/tg';
    try {
        const response = await axios.request(CONFIG);
        const rsObject = response.data;
        TOKEN = rsObject.data.token.token;
    } catch (error) {
        console.log("Lỗi Token!!!", error);
        throw error;
    }
}

function getAssets() {
    const updatedData = JSON.stringify({
        "token": TOKEN
    });
    const updatedConfig = {
        ...CONFIG,
        url: 'https://egg-api.hivehubs.app/api/user/assets',
        data: updatedData
    };
    axios.request(updatedConfig)
    .then((response) => {
        console.log("Trong ví có: " + response.data.data['diamond'].amount + "💎 | " + response.data.data['egg'].amount + "🥚 | " 
        +  response.data.data['usdt'].amount + "💲" )
    })
    .catch((error) => {
        console.log("Lỗi getAsset. Bỏ qua"+error);
    });
}
function collect(eggsID, isLast=false) {
    const updatedData = JSON.stringify({
        "token": TOKEN,
        "egg_uid": eggsID
    });
    const updatedConfig = {
        ...CONFIG,
        url: 'https://egg-api.hivehubs.app/api/scene/egg/reward',
        data: updatedData
    };
    DATA.egg_uid = eggsID;
    axios.request(updatedConfig)
        .then((response) => {
            let icon = (response.data['data'].a_type ==='egg') ? "🥚" : (response.data['data'].a_type ==='diamond') ? "💎" : "💲"
            console.log("Đã nhặt Trứng "+ eggsID +" thành công! Nhận được: " + JSON.stringify(response.data['data'].amount) + icon);
            if(isLast) {
                getAssets() 
            } 
        })
        .catch((error) => {
            console.log("Lỗi khi nhặt trứng. Bỏ qua"+error);
        });

}
function getEggs() {
    const updatedData = JSON.stringify({
        "token": TOKEN
    });
    const updatedConfig = {
        ...CONFIG,
        data: updatedData,
        url: 'https://egg-api.hivehubs.app/api/scene/info'
    };
    axios.request(updatedConfig)
        .then((response) => {
            let parsedData =  JSON.parse(JSON.stringify(response.data));
            parsedData.data.forEach((element, index, array)  => {
                element.eggs.forEach((egg, eggIndex, eggArray) =>{
                    var eggObjects = JSON.parse(JSON.stringify(egg))
                    collect(eggObjects.uid,(index === array.length - 1 && eggIndex === eggArray.length - 1))
                })
            });
        })
        .catch((error) => {
            if (error.message.includes('token')){
                startCollecting();
            }
        });
}
async function startCollecting() {
    try {
        await getToken();
        getEggs();
        setInterval(async () => {
            await getToken();
            getEggs();
        }, 30000);
        
    } catch (error) {
        console.error('Có lỗi khi khởi động!!!', error);
    }
}

startCollecting();
