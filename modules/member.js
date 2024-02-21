import fetch from "node-fetch";
import { CM_COOKIE, USER_COOKIES } from "./constant.js";
import cheerio from 'cheerio';
import {
    capitalize_words,
    chat,
    delKey,
    setBasic,
    getBasic,
    setTcvUsername,
    getCboxIdFromTcvId,
    getItem, getKeys, getTcvIdFromCboxId,
    getTcvNameFromTcvId, getTtl,
    parse_chuc,
    pmCbox, pmTcv,
    setExpire,
    setItem,
    snake_case
} from '../helper.js';
import { cap, viettat } from "./viettat.js";
import { changeCongHien, searchPk } from './cong-hien.js'

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get user info
export async function getUserInfo(userid, basicOnly = true) {
    const url = "https://tutien.net/member/" + userid;
    const response = await fetch(url, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.text();
    const $ = cheerio.load(body);

    let bangPhai = '';
    let chucVu = '';
    const name = $('h2.name').text().trim();
    const bac = $($('.statistic .item-value')[2]).text().trim();
    //const bac = $('.statistic .item-value').text().trim();
    const overviews = $('.block-detail-sidebar-author .overview');
    if (overviews.length === 4) {
        bangPhai = $(overviews[1]).text().trim();
        chucVu = $(overviews[2]).text().trim();
    }

    if (!chucVu) {
        chucVu = 'Tạp Dịch';
    }
    const basic = { id: userid, name, bac, bangPhai, chucVu };
    await setBasic(basic);
    await setTcvUsername(userid, name);
    if (basicOnly) {
        return basic;
    }

    const items = $('[id^="suaphapkhi"]');
    const pks = [];
    items.each((index, item) => {
        const j = $(item);
        const name = j.find('.text-warning').text().trim();
        const chkItem = j.find('input[name="chkItem"]').first().val();
        const price = j.find('p > small').first().text().trim();
        pks.push({ name, chkItem, price });
    });

    basic.pks = pks;
    await setPks(userid, pks);
    return basic;
}

// Check phap khi
export async function checkPhapKhi(userid) {
    const userDetail = await getUserInfo(userid, false);
    const pks = userDetail.pks;
    const messages = ["Danh sách pháp khí đang sử dụng:"];
    for (let i = 0; i < pks.length; i++) {
        const pk = pks[i];
        messages.push(`༶ [b]${pk.name}[/b]: ${pk.price}`);
    }

    const response = messages.join("[br]");
    const cboxId = await getCboxIdFromTcvId(userid);
    pmCbox(cboxId, response);
    return 1;
}

// Sua phap khi
export async function suaPhapKhi(userid, items) {
    const pks = await getPks(userid);
}

export async function checkBank(memberId) {
    const data = await getUserInfo(memberId);
    return data.bac;
    const url = `http://api.mottruyen.com/member?user_id=${memberId}`;
    const response = await fetch(url, {
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.json();
    if (body['success'] == 1) {
        return body['data']['BAC'];
    }

    return 0;
}

export async function checkMem() {
    const response = await fetch("https://tutien.net/account/bang_phai/", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.text();
    const $ = cheerio.load(body);
    const listRequest = [];
    const requests = $('li[id^="don_"]');
    requests.each((index, request) => {
        const requestId = $(request).attr("id").replace("don_", "");
        const memberName = $(request).text().split(" (")[0];
        listRequest.push(`✦ ${memberName} [${requestId}]`);
    });

    if (listRequest.length === 0) {
        chat("Không có đơn xin gia nhập bang nào!");
        return;
    }

    listRequest.unshift("Danh sách đơn:");
    chat(listRequest.join("[br]"));
}

export async function duyetMem(donId, sendMessage = true) {
    const body = `btnDuyetMem=1&don_id=${donId}&act=1`;
    const response = await fetch("https://tutien.net/account/bang_phai/", {
        "headers": {
            "accept": "*/*",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": CM_COOKIE
        },
        "referrer": "https://tutien.net/account/bang_phai/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });

    if (sendMessage) {
        chat("Xong!");
    }
}

export async function xinVaoBang(memberId, bangPhai = 'vtt') {
    const member = USER_COOKIES.find(data => data.user_id == memberId);
    if (!member) {
        chat("Chưa cài đặt cookie cho ID: [b]" + memberId + "[/b]");
        return;
    }

    const bangId = getBangId(bangPhai);
    if (bangId === 0) {
        chat("Không tìm thấy bang [b]" + bangPhai + "[/b]. Vui lòng sử dụng tên đầy đủ hoặc viết tắt đầy đủ");
        return;
    }

    const body = "btnXinVaoBang=1&txtBang=" + bangId;
    const res = await fetch("https://tutien.net/account/bang_phai/", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": member.cookie
        },
        "referrer": "https://tutien.net/account/bang_phai",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });

    chat('Done!');
}

export async function nopVatPham(memberId) {
    const member = USER_COOKIES.find(data => data.user_id == memberId);
    if (!member) {
        chat("Chưa cài đặt cookie cho ID: [b]" + memberId + "[/b]");
        return;
    }

    const response = await fetch('https://tutien.net/account/vat_pham/', {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": member.cookie
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.text();
    const $ = cheerio.load(body);
    $('#binhkhi').remove();
    $('#khaigiap').remove();
    $('#trangsuc').remove();
    let items = $('span[id^="shopnum"]');
    chat("Done!!!")
    for (let i = 0; i < items.length; i++) {
        let item = $(items[i]);
        const itemId = item.attr('id').replace('shopnum', '').trim();
        let itemAmount = item.text();
        if (itemId == '57' || itemId == '34609' || itemId == '6852' || itemId == '6851' || itemId == '50335' || itemId == '50336' || itemId == '6851' || itemId == '67' || itemId == '12287' || itemId == '12288' || itemId == '32226') {
            continue;
        } else {
            await nopKho(member.cookie, itemId, itemAmount);
            await delay(2000);
        }
    }
    chat('Đã nộp !!!');
}

const nopKho = async (cookie, itemId, amount) => {
    const body = 'btnDongGop=1&shop=' + itemId + '&txtNumber=' + amount;
    const response = await fetch("https://tutien.net/account/vat_pham/", {
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
            "Referer": "https://tutien.net/account/vat_pham/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": body,
        "method": "POST"
    });
}

function getBangId(bangPhai = '') {
    let bangId = 0;
    let vietTat = snake_case(bangPhai)
    switch (vietTat) {
        case 'vtt':
            bangId = 27;
            break;
        case 'avt':
            bangId = 28;
            break;
        case 'add':
            bangId = 29;
            break;
        case 'tnng':
            bangId = 30;
            break;
        case 'tnhg':
            bangId = 37;
            break;
        case 'mtd':
            bangId = 36;
            break;
        case 'tlmd':
        case 'tl':
            bangId = 38;
            break;
        case 'vc':
        case 'vcmt':
            bangId = 39;
            break;
        case 'mn':
            bangId = 40;
            break;
        case 'dtm':
            bangId = 34;
            break;
        default:
            break;
    }

    if (bangId == 0) {
        vietTat = convert_vnese_2_eng(str).toLowerCase();
        switch (vietTat) {
            case 'vo ta':
            case 'vo ta team':
                bangId = 27;
                break;
            case 'an vu':
            case 'an vu thon':
                bangId = 28;
                break;
            case 'am duong':
            case 'am duong diem':
                bangId = 29;
                break;
            case 'tieu ngao':
            case 'tieu ngao nhan gian':
                bangId = 30;
                break;
            case 'thien nhai':
            case 'thien nhai hai giac':
                bangId = 37;
                break;
            case 'ma than thien':
                bangId = 36;
                break;
            case 'tu la ma dien':
            case 'tu la':
                bangId = 38;
                break;
            case 'vo cuc':
            case 'vo cuc ma tong':
                bangId = 39;
                break;
            case 'my nhan':
                bangId = 40;
                break;
            case 'de thien':
            case 'de thien mon':
                bangId = 34;
                break;
            default:
                break;
        }
    }

    return bangId;
}

export default {
    getUserInfo
}
