import fetch from "node-fetch";
import cheerio from "cheerio";
import { chuyenBac } from "../modules/chuyen-bac.js";
import { checkBank } from "../modules/member.js";
import { updateRuong } from "../modules/chuyen-do.js";
import { getItem, setExpire, setItem } from "../helper.js";

const TAY_TUY_DAN = 'btnLuyenDan=1&radLuyenDan=9&radDanLo=67&radPhuTro=50';
const TRUC_CO_DAN = 'btnLuyenDan=1&radLuyenDan=13&radDanLo=67&radPhuTro=50';
const BO_NGUYEN_DAN = 'btnLuyenDan=1&radLuyenDan=14&radDanLo=67&radPhuTro=50';
const BO_ANH_DAN = 'btnLuyenDan=1&radLuyenDan=40&radDanLo=32226&radPhuTro=50';
const LUYEN_THAN_DAN = 'btnLuyenDan=1&radLuyenDan=77&radDanLo=67&radPhuTro=50';
const HOP_NGUYEN_DAN = 'btnLuyenDan=1&radLuyenDan=30497&radDanLo=67&radPhuTro=50';
const HOA_NGUYEN_DAN = 'btnLuyenDan=1&radLuyenDan=32226&radDanLo=67&radPhuTro=51';
const DAI_LINH_DAN = 'btnLuyenDan=1&radLuyenDan=605&radDanLo=67&radPhuTro=53';


const ACCOUNTS = [
  {
    id: 228826,
    cookie: 'USER=pHbGFsqqDrVz%3ApqHCQ6S%2Bwr%2Bv2CXwAa2v%2FNYSWZlHftUMy7EY1r1EOvOY',
    type: [HOA_NGUYEN_DAN]
  }, {
    id: 102180,
    cookie: 'USER=Ei02ARyVndbg%3AtpT2dBBDg2rEHVLdhjm8O0hCMX38izsNd10vPsNB0RQn',
    type: [BO_NGUYEN_DAN]
  },/* {
    id: 305001,
    cookie: 'USER=c1Wz7%2F9H0FoX%3AiJ1AA%2BeXDnGUoTgCce5JIylxsEnH%2BBjIFDBImTm5HSSa',
    type: [LUYEN_THAN_DAN]
  },*/ {
    id: 393039,
    cookie: 'USER=wKJG9IxCxGqY:HfuumRPlivM5lY0634viz3h9436ausacSXjYF1i2BXaN',
    type: [TAY_TUY_DAN]
  }, /*{
    id: 618888,
    cookie: 'USER=EAUXxBPJrkhk%3AWCAgnTzZiouI%2FZQxlz2zzeMZLLGfDseGJucN%2FX5tZb3l',
    type: [TAY_TUY_DAN]
  },*/ {
    id: 166728,
    cookie: 'USER=en4H4ON4srmi%3AwG6Oubl%2Bk1OlwzI8eLPTNz%2FFO4zISRg0AmjFw7al7bLx',
    type: [TRUC_CO_DAN]
  }, {
    id: 636074,
    cookie: 'USER=AAGI%2BwoJ2JPz%3ABpI8c%2BuvUva6%2FXO%2Fpo3GLcBKyxOh9lNACeECHUBhPGe4',
    type: [TRUC_CO_DAN]
  }, {
    id: 181633,
    cookie: 'USER=1aYNc796RrAj%3AIEXEvK9IZl5eRHLkjwZsqHEmLH%2BghYIFiZoG3IDP%2BotG',
    type: [TAY_TUY_DAN]
  }, {
    id: 636279,
    cookie: 'USER=xO7brYP6QlhO%3A4Qqz1QaxOhFI8IG88xLZfI%2BIxZCru7zKNINMx1Meedwl',
    type: [BO_ANH_DAN]
  }, {
    id: 575758,
    cookie: 'USER=jfbkpGgWbi2b%3Ajvd2Bl2cYHHfqiWSWwrISV9ssdft9V0QPVgZkTBF959B',
    type: [TRUC_CO_DAN]
  }, {
    id: 666669,
    cookie: 'USER=dHjcx5Sc%2FfKR%3AaUlPraq6HOc60WUKM0aYnIxRYgdDejOqAylbJDA%2BFWdH',
    type: [TRUC_CO_DAN]
  }, {
    id: 619999,
    cookie: 'USER=hKWO4VW2xYjp%3AGAcG7ZF0siVlYu%2FcLJ6dvv1A4WCXWmMZMeZfgWBpIGdw',
    type: [TRUC_CO_DAN]
  }, {
    id: 719444,
    cookie: 'USER=tWoNHj4vv0ip%3AMwMzLmcL62J74lMI%2FsNJCvft0JlSj0c50zjMMktixRx4',
    type: [TAY_TUY_DAN]
  }, {
    id: 666206,
    cookie: 'USER=4cencKVL8kP%2B%3AeAE1VWsKzCTod%2BXKFwv%2BC7Mz1JpoVEu8pqta%2Bp4i3n3u',
    type: [TAY_TUY_DAN]
  },/* {
    id: 666666,
    cookie: 'USER=tWDu1o2sJOuR%3AQ9FUCRcJVdBbwiKH9uU2VDRhn62ZyNfbA%2BbmqLmxItU%2B',
    type: [BO_NGUYEN_DAN]
  }, {
    id: 21497,
    cookie: 'USER=6jKXeTXlsPC8%3A7%2FatVraJ81ezOORCWkXoNiy7TWasdAUy8aa5THMjHhr0',
    type: [TAY_TUY_DAN]
  }, */{
    id: 3495,
    cookie: 'USER=09rZhfuCVpBf%3A9YBPGEGILvxvqgqsbI5bsfHuyCrOMpS3dGnvCN%2Bp2bxP',
    type: [HOA_NGUYEN_DAN]
  }
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchTienPhu = async (accountId, cookie, types) => {
  const response = await fetch("https://tutien.net/account/tu_luyen/luyen_dan_that/", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "cache-control": "max-age=0",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": cookie
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET"
  });

  const body = await response.text();
  const $ = cheerio.load(body);
  let skipCheckDangLuyen = false;

  const availableDanDuoc = $('div.progress-bar-striped').first().text();
  if (!availableDanDuoc) {
    await luyenDan(accountId, types, cookie);
    console.log(accountId, 'Luyện Đan');
    skipCheckDangLuyen = true;
  } else {
    console.log(accountId, availableDanDuoc);
  }
}


const luyenDan = async (accountId, types, cookie) => {
  const body = types;
  const res = await fetch("https://tutien.net/account/tu_luyen/luyen_dan_that/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": cookie,
      "Referer": "https://tutien.net/account/tu_luyen/tien_phu/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": body,
    "method": "POST"
  });

}

setInterval(async () => {
  console.log("=================" + (new Date()).toString() + "==================");
  for (let i = 0; i < ACCOUNTS.length; i++) {
    const account = ACCOUNTS[i];
    //const isDangTrong = await getItem(`${account.id}_countdown`);
    // console.log("===================================");
    //if (isDangTrong) {
    //  await delay(1000);
    //  console.log(account.id, 'Chờ thu hoạch');
    //  continue;
    //}
    await fetchTienPhu(account.id, account.cookie, account.type);
    //await delay(5000);
  }
}, 2 * 60 * 1000); // every 2 minutes