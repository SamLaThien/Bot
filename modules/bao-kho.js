import fetch from 'node-fetch';
import { CM_COOKIE } from "./constant.js";
import cheerio from 'cheerio';
import { chat, pmCbox, delKey, getItem, getKeys, parseCookies, setItem, snake_case, } from '../helper.js'
import { cap } from "./viettat.js";

export async function fetchBaoKho(COOKIE, txtKho) {
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong", {
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
            "cookie": COOKIE,
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    });

    const body = await response.text();
    const $ = cheerio.load(body);
    await nhap(COOKIE, txtKho);
}
const nhap = async (CM_COOKIE, txtKho) => {
    const data = "btnLoginBaoKho=1&txtPassword=" + txtKho;
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "x-requested-with": "XMLHttpRequest",
            "cookie": CM_COOKIE,
        },
        "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong",
        "body": data,
        "method": "POST",
    });
    const body = await response.text();
    if (body === '1') {
        console.log(`[success] Đã Nhập`);
        return;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchItemCh() {
    const response = await fetch("https://tutien.net/account/bang_phai/chap_su_duong/", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
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
    const ids = ['tangexp', 'tanghp', 'congphap', 'dotpha', 'binhkhi', 'linhthao', 'phutro'];
    ids.forEach(itemId => {
        const rows = $('#' + itemId + ' > table > tbody > tr').toArray();
        for (let i = 0; i < rows.length; i++) {
            const tds = $(rows[i]).find('td');
            const name = $(tds[0]).text();
            const nhapInput = $(tds[1]).find('input').first();
            const nhap = nhapInput.val();
            const xuat = $(tds[2]).find('input').first().val();
            const itemId = nhapInput.attr('id').replace("txtVatPham_", "").replace("_nhap", "");

            const key = 'bk_' + snake_case(name);
            setItem(key, JSON.stringify({ name, nhap, xuat, itemId }));
        }
    });
}

export async function moveND(memberName) {
    const itemName = parseName('Nội Đan');
    const key = "bk_*" + snake_case(itemName) + "*";
    const matches = await getKeys(key);
    if (matches.length === 0) {
        await chat(`@${memberName} Không tìm thấy kết quả với từ khóa: [b]${cap(itemName)}[/b]`);
        return;
    }
    const items = [];
    for (let i = 0; i < matches.length; i++) {
        let item = await getItem(matches[i]);
        if (item === "{}" || item === "") {
            await delKey(matches[i]);
            continue;
        }

        item = JSON.parse(item);
        const itemName = item['name'];
        items[itemName] = {
            name: itemName,
            id: item['itemId']
        }
    }
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong/", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.text();
    const $ = cheerio.load(body);
    const itemNames = Object.keys(items);
    for (let i = 0; i < itemNames.length; i++) {
        const itemName = itemNames[i];
        const item = items[itemName];
        const amount = $('#shopnum' + item.id).text();
        if (parseInt(amount) > 0) {
            const formEncoded = `btnChuyenVatPham=1&shop=${item.id}&txtNumber=${amount}&txtMember=228826`;
            const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong/", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
                    "x-requested-with": "XMLHttpRequest",
                    "cookie": CM_COOKIE
                },
                "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong/",
                "body": formEncoded,
                "method": "POST",
            });
            const body = await response.text();
            if (body === '1') {
                console.log(`Chuyển ${itemName} cho 228826 thành công`);
            } else {
                chat(body);
                return;
            }
        }
        await delay(2000);
    }
    chat('Done!!!');
}

export async function checkBaoKho(searchText, cboxId) {
    const itemName = parseName(searchText);
    const key = "bk_*" + snake_case(itemName) + "*";
    const matches = await getKeys(key);

    if (matches.length === 0) {
        pmCbox(cboxId, `Không tìm thấy kết quả với từ khóa: [b]${cap(itemName)}[/b]`);
        return;
    }


    const items = [];
    for (let i = 0; i < matches.length; i++) {
        let item = await getItem(matches[i]);
        if (item === "{}" || item === "") {
            await delKey(matches[i]);
            continue;
        }

        item = JSON.parse(item);
        const itemName = item['name'];
        items[itemName] = {
            name: itemName,
            id: item['itemId']
        }
    }
    await checkBkItems(cboxId, items);
    return 1;
}

export async function checkKho(cboxId, items) {
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong/", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.text();
    const $ = cheerio.load(body);
    const messages = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = item.split(' ')[0];
        const itemName = item.split(`${itemId} `)[1];
        const amount = $('#shopnum' + itemId).text();
        if (parseInt(amount) > 0) {
            messages.push(`✦ [b][ID item : ${itemId}] ${itemName}[/b]: ${amount}`);
        }
    }
    pmCbox(cboxId, `[br] ${messages.join("[br]")}`);
}


export async function checkBkItems(cboxId, items) {
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong/", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const body = await response.text();
    const $ = cheerio.load(body);
    const itemNames = Object.keys(items);
    const messages = [];
    for (let i = 0; i < itemNames.length; i++) {
        const itemName = itemNames[i];
        const item = items[itemName];
        const amount = $('#shopnum' + item.id).text();
        if (parseInt(amount) > 0) {
            messages.push(`✦ [b][ID item : ${item.id}] ${itemName}[/b]: ${amount}`);
        }
    }

    pmCbox(cboxId, `[br] ${messages.join("[br]")}`);
}

export async function loginBaoKho() {
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong/", {
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
        "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "btnLoginBaoKho=1&txtPassword=123456987",
        "method": "POST",
        "mode": "cors"
    });

    const newCookie = parseCookies(response);
    await setItem('R_CM_COOKIE', newCookie);
}

export async function redirectBaoKho() {
    const response = await fetch("https://tutien.net/account/bang_phai/bao_kho_duong", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrer": "https://tutien.net/account/bang_phai/bao_kho_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });
}

function parseName(name) {
    const vps = {
        'att': 'Anh Tâm Thảo',
        'bdq': 'Bàn Đào Quả',
        'bdt': 'Bàn Đào Thụ',
        'btt': 'Bánh Trung Thu',
        'bhn': 'Băng Hỏa Ngọc',
        'bad': 'Bổ Anh Đan',
        'badp': 'Bổ Anh Đan Phương',
        'bhd': 'Bổ Huyết Đan',
        'bhdp': 'Bổ Huyết Đan Phương',
        'bnd': 'Bổ Nguyên Đan',
        'bndp': 'Bổ Nguyên Đan Phương',
        'cs': 'Chu Sa',
        'cptq': 'Công Pháp Tàn Quyển',
        'ctd': 'Cố Thần Đan',
        'dtd': 'Dung Thần Đan',
        'dmc': 'Dạ Minh Châu',
        'hkl': 'Hoàng Kim Lệnh',
        'hdc': 'Hoán Diện Châu',
        'hkd': 'Huyết Khí Đan',
        'hkdp': 'Huyết Khí Đan Phương',
        'htt': 'Huyết Tinh Thảo',
        'htd': 'Huyết Tinh Đan',
        'htdp': 'Huyết Tinh Đan Phương',
        'htb': 'Hòa Thị Bích',
        'hlt': 'Hóa Long Thảo',
        'hlt2': 'Hộ Linh Trận',
        'hnt': 'Hóa Nguyên Thảo',
        'hnd': 'Hóa Nguyên Đan',
        'hndp': 'Hóa Nguyên Đan Phương',
        'hkct': 'Hư Không Chi Thạch',
        'hdt': 'Hắc Diệu Thạch',
        'hmd': 'Hắc Ma Đỉnh',
        'hnc': 'Hỏa Ngọc Châu',
        'hhd': 'Hồi Huyết Đan',
        'hhthp': 'Hồng Hoang Thạch HP',
        'hht': 'Hồng Hoang Thạch HP',
        'hpt': 'Hổ Phách Thạch',
        'hnt2': 'Hợp Nguyên Thảo',
        'hnd2': 'Hợp Nguyên Đan',
        'hndp2': 'Hợp Nguyên Đan Phương',
        'kttt': 'Khai Thiên Thần Thạch',
        'kt': 'Kim Thuổng',
        'ktc': 'Kim Thủ Chỉ',
        'lb': 'La Bàn',
        'ltcp': 'Linh Thạch CP',
        'lthp': 'Linh Thạch HP',
        'ltthp': 'Linh Thạch THP',
        'lttp': 'Linh Thạch TP',
        'lt': 'Linh Tuyền',
        'ltt': 'Luyện Thần Thảo',
        'ltd': 'Luyện Thần Đan',
        'ltdp': 'Luyện Thần Đan Phương',
        'ls': 'Lông Sói',
        'nbt ': 'Nguyệt Bạch Thạch',
        'ntd': ['Ngưng Thần Đan', 'Nhân Tiên Đan'],
        'ngtc': 'Ngọc Giản Truyền Công',
        'ntls': 'Ngọc Tuyết Linh Sâm',
        'ntc': 'Ngọc Tủy Chi',
        'ndc1': 'Nội Đan C1',
        'ndc2': 'Nội Đan C2',
        'ndc3': 'Nội Đan C3',
        'ndc4': 'Nội Đan C4',
        'ndc5': 'Nội Đan C5',
        'ndc6': 'Nội Đan C6',
        'ndc7': 'Nội Đan C7',
        'ndc8': 'Nội Đan C8',
        'ndc9': 'Nội Đan C9',
        'nd1': 'Nội Đan C1',
        'nd2': 'Nội Đan C2',
        'nd3': 'Nội Đan C3',
        'nd4': 'Nội Đan C4',
        'nd5': 'Nội Đan C5',
        'nd6': 'Nội Đan C6',
        'nd7': 'Nội Đan C7',
        'nd8': 'Nội Đan C8',
        'nd9': 'Nội Đan C9',
        'ptd': 'Phá Thiên Đan',
        'pmt c1': 'Phụ Ma Thạch C1',
        'pmt c2': 'Phụ Ma Thạch C2',
        'pmt c3': 'Phụ Ma Thạch C3',
        'pmt c4': 'Phụ Ma Thạch C4',
        'pmt c5': 'Phụ Ma Thạch C5',
        'pmt c6': 'Phụ Ma Thạch C6',
        'pmt c7': 'Phụ Ma Thạch C7',
        'pmt c8': 'Phụ Ma Thạch C8',
        'pmtc1': 'Phụ Ma Thạch C1',
        'pmtc2': 'Phụ Ma Thạch C2',
        'pmtc3': 'Phụ Ma Thạch C3',
        'pmtc4': 'Phụ Ma Thạch C4',
        'pmtc5': 'Phụ Ma Thạch C5',
        'pmtc6': 'Phụ Ma Thạch C6',
        'pmtc7': 'Phụ Ma Thạch C7',
        'pmtc8': 'Phụ Ma Thạch C8',
        'pmt1': 'Phụ Ma Thạch C1',
        'pmt2': 'Phụ Ma Thạch C2',
        'pmt3': 'Phụ Ma Thạch C3',
        'pmt4': 'Phụ Ma Thạch C4',
        'pmt5': 'Phụ Ma Thạch C5',
        'pmt6': 'Phụ Ma Thạch C6',
        'pmt7': 'Phụ Ma Thạch C7',
        'pmt8': 'Phụ Ma Thạch C8',
        'qg': 'Quy Giáp',
        'qb': 'Quyên Bạch',
        'snc': 'Sa Ngọc Châu',
        'ttd2': 'Thanh Tâm Đan',
        'ttd': 'Tẩy Tủy Đan',
        'tkl': 'Thiên Kiếm Lệnh',
        'tlq': 'Thiên Linh Quả',
        'tld': 'Thiên Linh Đỉnh',
        'tnt': 'Thiên Nguyên Thảo',
        'tdl': 'Thiên Địa Lô',
        'tdd': 'Thánh Diệu Đỉnh',
        'tnc': 'Thải Ngọc Châu',
        'tnd': 'Thần Nông Đỉnh',
        'tgct': 'Thời Gian Chi Thủy',
        'tlcp': 'Tinh Linh CP',
        'tlhp': 'Tinh Linh HP',
        'tlthp': 'Tinh Linh THP',
        'tltp': 'Tinh Linh TP',
        'ttcp': 'Tinh Thiết CP',
        'tthp': 'Tinh Thiết HP',
        'ttthp': 'Tinh Thiết THP',
        'tttp': 'Tinh Thiết TP',
        'ttt': 'Trích Tinh Thảo',
        'tcd': 'Trúc Cơ Đan',
        'tcdp': 'Trúc Cơ Đan Phương',
        'tlt': 'Tán Lôi Trận',
        'tnlp': 'Tân Niên Lễ Phục',
        'tpb': 'Túi Phân Bón',
        'ttv': 'Túi Trữ Vật',
        'thl': 'Tạo Hóa Lô',
        'ttdp': 'Tẩy Tủy Đan Phương',
        'tlc': 'Tị Lôi Châu',
        'tbb': 'Tụ Bảo Bài',
        'ukt': 'Uẩn Kim Thảo',
        'utd': 'Uẩn Thiên Đan',
        'utdp': 'Uẩn Thiên Đan Phương',
        'vht': 'Vĩnh Hằng Thạch',
        'vtd': 'Vạn Thú Đỉnh',
        'vtcp': 'Vẫn Thiết CP',
        'vthp': 'Vẫn Thiết HP',
        'vtthp': 'Vẫn Thiết THP',
        'vttp': 'Vẫn Thiết TP',
        'dgt': 'Đê Giai Thuẫn',
        'dlktd': 'Đại La Kim Tiên Đan',
        'dlt': 'Đại Linh Thảo',
        'dld': 'Đại Linh Đan',
        'dpd': 'Đại Phá Đan',
        'dhd': 'Độ Hư Đan',
        'nhũ cp': 'Ngọc Tủy Linh Nhũ CP',
        'nhũ thp': 'Ngọc Tủy Linh Nhũ THP',
        'nhũ tp': 'Ngọc Tủy Linh Nhũ TP',
        'nhũ hp': 'Ngọc Tủy Linh Nhũ HP',
        'tstl': 'Thiên Sơn Tuyết Liên',
        'ktt': 'Khúc Tương Tư'
    };

    if (vps.hasOwnProperty(name)) {
        return vps[name];
    }

    return name;
}

export default {
    // checkBaoKho,
    loginBaoKho,
    fetchBaoKhoItems: fetchItemCh
}
