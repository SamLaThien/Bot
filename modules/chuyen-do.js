import fetch from "node-fetch";
import {
    capitalize_words,
    chat,
    delKey,
    getBasic,
    getCboxIdFromTcvId,
    getItem, getKeys, getTcvIdFromCboxId,
    getTcvNameFromTcvId, getTtl,
    parse_chuc,
    pmCbox, pmTcv,
    setExpire,
    setItem,
    snake_case
} from '../helper.js';
import { changeCongHien, searchPk } from './cong-hien.js'
import { CHUYEN_DO_IDS, CM_COOKIE, ITEM_EXPIRE_IN, QUEUE_MAX_RETRY, CD_PRICE, ADMIN } from "./constant.js";
import { getUserInfo } from "./member.js";
import { chuyenDoQueue } from "./queue.js";
import { cap, viettat } from "./viettat.js";

export async function chuyenDoHacDiem(name, amount, toUserId) {
    const items = [{ name, amount }];
    const user = { id: toUserId, toId: toUserId }
    await chuyenNhieuDo(user, items, false);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Nhan lenh chuyen do tu code (function khac)
async function chuyenNhieuDo(user, items, cboxId = null) {
    let totalCh = 0;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const name = cap(viettat(item.name), false);
        const itemName = "bk_" + snake_case(name);
        const reply = await getItem(itemName);
        let rItem = JSON.parse(reply);
        if (!rItem) {
            rItem = await searchPk(name, true);
            if (!rItem) {
                chat("Vật phẩm [color=blue][b]" + item.name + "[/b][/color] không có trong bảo khố.")
                continue;
            }
        }
        item.itemId = rItem.itemId;
        totalCh += item.amount * parseInt(rItem.xuat);
    }

    if (totalCh === 0) {
        if (cboxId !== null) {
            pmCbox(cboxId, "Xong!");
        }
        getCboxIdFromTcvId(user.id).then(cbox => {
            pmCbox(cbox, "Xong!");
        });
        return;
    }

    if (cboxId) {
        const tcvId = await getTcvIdFromCboxId(cboxId)
        user.id = tcvId;
        getTcvNameFromTcvId(tcvId).then(name => {
            chat(name + " - Chờ tý đang chuyển /xga  ");
        });
    } else {
        getTcvNameFromTcvId(user.id).then(name => {
            chat(name + " - Chờ tý đang chuyển /xga  ");
        });
    }


    try {
        let userInfo = await getBasic(user.toId);
        if (!userInfo) {
            userInfo = await getUserInfo(user.toId);
        }

        user.chucVu = userInfo.chucVu;
        user.toName = userInfo.name;
    } catch (error) {
        console.log(error)
    }

    // if (user.id == 52780 || user.id == 300200 || user.id == 600600) {
    //     // Skip change CH
    //     for (let i = 0; i < items.length; i++) {
    //         const item = items[i];
    //         await chuyenDoQueue.createJob({ user, item }).retries(QUEUE_MAX_RETRY).backoff("fixed", 2000).save();
    //     }
    //
    //     return;
    // }
    const quyenHan = parse_chuc(user.chucVu);
    await changeCongHien(user.toId, totalCh, quyenHan);

    await delay(2000);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await chuyenDoQueue.createJob({ user, item }).retries(QUEUE_MAX_RETRY).backoff("fixed", 2000).save();
        //await chuyenDo(user, item);
        await delay(2000)
    }
}

async function chuyenDo(user, item) {
    const formEncoded = `btnChuyenVatPham=1&shop=${item.itemId}&txtNumber=${item.amount}&txtMember=${user.toId}`;
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
        const cboxId = await getCboxIdFromTcvId(user.id);
        console.log(`Đã chuyển ${item.amount} ${item.name} cho ${user.toName} `);
        pmCbox(cboxId, `Đã chuyển ${item.amount} ${item.name} cho ${user.toName} ([url=https://tutien.net/member/${user.toId}]${user.toId}[/url])`);
    } else {
        chat(body);
    }

    return body;
}

function chuyenDoFromBot2(content = '', args, userid) {
    const cdi = parseInt(userid);
    const listItems = parseItemToTrans(content.replace(`${args[0]} `, ''));
    const items = [];
    for (let keys of listItems) {
        let sxj = [];
        if (cap(keys[0]).toLowerCase() == 'bộ tàng siêu') {
            sxj = ["1 Mảnh Tàn Đồ S1", "1 Mảnh Tàn Đồ S2", "1 Mảnh Tàn Đồ S3", "1 Mảnh Tàn Đồ S4", "1 Mảnh Tàn Đồ S5", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'bts') {
            sxj = ["1 Mảnh Tàn Đồ S1", "1 Mảnh Tàn Đồ S2", "1 Mảnh Tàn Đồ S3", "1 Mảnh Tàn Đồ S4", "1 Mảnh Tàn Đồ S5", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ tàng cao') {
            sxj = ["1 La Bàn", "1 Quy Giáp", "1 Quyên Bạch", "1 Lông Sói", "1 Chu Sa", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'btc') {
            sxj = ["1 La Bàn", "1 Quy Giáp", "1 Quyên Bạch", "1 Lông Sói", "1 Chu Sa", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ') {
            sxj = ["1 Thanh Tâm Đan", "1 Tị Lôi Châu", "1 Đê Giai Thuẫn"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò bad' || cap(keys[0]).toLowerCase() == 'lo bad') {
            sxj = ["3 Anh Tâm Thảo", "1 Trích Tinh Thảo", "13 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò dld' || cap(keys[0]).toLowerCase() == 'lo dld') {
            sxj = ["2 Uẩn Kim Thảo", "2 Hóa Long Thảo", "1 Trích Tinh Thảo", "3 Luyện Thần Thảo", "3 Hợp Nguyên Thảo", "6 Đại Linh Thảo", "32 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò ltd' || cap(keys[0]).toLowerCase() == 'lo ltd') {
            sxj = ["1 Anh Tâm Thảo", "2 Hóa Long Thảo", "1 Hóa Nguyên Thảo", "3 Luyện Thần Thảo", "1 Trích Tinh Thảo", "23 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò bnd' || cap(keys[0]).toLowerCase() == 'lo bnd') {
            sxj = ["2 Thiên Nguyên Thảo", "2 Trích Tinh Thảo", "8 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò hnd' || cap(keys[0]).toLowerCase() == 'lo hnd') {
            sxj = ["2 Anh Tâm Thảo", "3 Hóa Nguyên Thảo", "1 Trích Tinh Thảo", "2 Uẩn Kim Thảo", "18 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò tcd' || cap(keys[0]).toLowerCase() == 'lo tcd') {
            sxj = ["1 Hóa Long Thảo", "2 Ngọc Tủy Chi", "1 Thiên Linh Quả", "1 Trích Tinh Thảo", "3 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò ttd' || cap(keys[0]).toLowerCase() == 'lo ttd') {
            sxj = ["2 Thiên Linh Quả", "1 Trích Tinh Thảo", "3 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'kd') {
            sxj = ["1 Đê Giai Thuẫn ", "1 Tị Lôi Châu", "1 Thanh Tâm Đan", "1 Phá Thiên Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'tc') {
            sxj = ["1 Tị Lôi Châu", "1 Uẩn Thiên Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'lk') {
            sxj = ["1 Trúc Cơ Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'na') {
            sxj = ["1 Đê Giai Thuẫn", "1 Tị Lôi Châu", "1 Thanh Tâm Đan", "1 Hộ Linh Trận", "1 Linh Thạch THP", "1 Cố Thần Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ châu') {
            sxj = ["1 Sa Ngọc Châu", "1 Thải Ngọc Châu", "1 Hỏa Ngọc Châu"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ dp') {
            sxj = ["1 Thanh Tâm Đan", "1 Tị Lôi Châu", "1 Đê Giai Thuẫn", "1 Tán Lôi Trận", "1 Hộ Linh Trận"];
        }


        if (sxj.length === 0) {
            sxj = ['1 ' + cap(keys[0])];
        }

        for (const juo of sxj) {
            const amount = parseInt(juo.split(" ")[0]);
            const name = juo.slice((amount + " ").length);

            // chat("Start: " + Date.now());
            items.push({
                "name": name,
                "amount": +parseInt(keys[1]) * amount
            });
        }
    }

    const user = { id: userid, toId: cdi }
    chuyenNhieuDo(user, items).then(response => {
    });
}

// Chuyen do 1 id
function chuyenDoFromBot(content = '', args, userid) {
    const cdi = parseInt(args[1]);
    //if (!CHUYEN_DO_IDS.includes(userid)) {
    //    chat("Bạn không có quyền chuyển đồ 1 ID /tat");
    //    return;
    //}

    const listItems = parseItemToTrans(content.replace(`${args[0]} ${cdi}`, ''));
    const items = [];
    for (let keys of listItems) {
        let sxj = [];
        if (cap(keys[0]).toLowerCase() == 'bộ tàng siêu') {
            sxj = ["1 Mảnh Tàn Đồ S1", "1 Mảnh Tàn Đồ S2", "1 Mảnh Tàn Đồ S3", "1 Mảnh Tàn Đồ S4", "1 Mảnh Tàn Đồ S5", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'bts') {
            sxj = ["1 Mảnh Tàn Đồ S1", "1 Mảnh Tàn Đồ S2", "1 Mảnh Tàn Đồ S3", "1 Mảnh Tàn Đồ S4", "1 Mảnh Tàn Đồ S5", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ tàng cao') {
            sxj = ["1 La Bàn", "1 Quy Giáp", "1 Quyên Bạch", "1 Lông Sói", "1 Chu Sa", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'btc') {
            sxj = ["1 La Bàn", "1 Quy Giáp", "1 Quyên Bạch", "1 Lông Sói", "1 Chu Sa", "1 Kim Thuổng"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ') {
            sxj = ["1 Thanh Tâm Đan", "1 Tị Lôi Châu", "1 Đê Giai Thuẫn"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò bad' || cap(keys[0]).toLowerCase() == 'lo bad') {
            sxj = ["3 Anh Tâm Thảo", "1 Trích Tinh Thảo", "13 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò dld' || cap(keys[0]).toLowerCase() == 'lo dld') {
            sxj = ["2 Uẩn Kim Thảo", "2 Hóa Long Thảo", "1 Trích Tinh Thảo", "3 Luyện Thần Thảo", "3 Hợp Nguyên Thảo", "6 Đại Linh Thảo", "32 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò ltd' || cap(keys[0]).toLowerCase() == 'lo ltd') {
            sxj = ["1 Anh Tâm Thảo", "2 Hóa Long Thảo", "1 Hóa Nguyên Thảo", "3 Luyện Thần Thảo", "1 Trích Tinh Thảo", "23 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò bnd' || cap(keys[0]).toLowerCase() == 'lo bnd') {
            sxj = ["2 Thiên Nguyên Thảo", "2 Trích Tinh Thảo", "8 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò hnd' || cap(keys[0]).toLowerCase() == 'lo hnd') {
            sxj = ["2 Anh Tâm Thảo", "3 Hóa Nguyên Thảo", "1 Trích Tinh Thảo", "2 Uẩn Kim Thảo", "18 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò tcd' || cap(keys[0]).toLowerCase() == 'lo tcd') {
            sxj = ["1 Hóa Long Thảo", "2 Ngọc Tủy Chi", "1 Thiên Linh Quả", "1 Trích Tinh Thảo", "3 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'lò ttd' || cap(keys[0]).toLowerCase() == 'lo ttd') {
            sxj = ["2 Thiên Linh Quả", "1 Trích Tinh Thảo", "3 Linh Thạch HP"];
        }
        if (cap(keys[0]).toLowerCase() == 'kd') {
            sxj = ["1 Đê Giai Thuẫn ", "1 Tị Lôi Châu", "1 Thanh Tâm Đan", "1 Phá Thiên Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'tc') {
            sxj = ["1 Tị Lôi Châu", "1 Uẩn Thiên Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'lk') {
            sxj = ["1 Trúc Cơ Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'na') {
            sxj = ["1 Đê Giai Thuẫn", "1 Tị Lôi Châu", "1 Thanh Tâm Đan", "1 Hộ Linh Trận", "1 Linh Thạch THP", "1 Cố Thần Đan"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ châu') {
            sxj = ["1 Sa Ngọc Châu", "1 Thải Ngọc Châu", "1 Hỏa Ngọc Châu"];
        }
        if (cap(keys[0]).toLowerCase() == 'bộ dp') {
            sxj = ["1 Thanh Tâm Đan", "1 Tị Lôi Châu", "1 Đê Giai Thuẫn", "1 Tán Lôi Trận", "1 Hộ Linh Trận"];
        }


        if (sxj.length === 0) {
            sxj = ['1 ' + cap(keys[0])];
        }

        for (const juo of sxj) {
            const amount = parseInt(juo.split(" ")[0]);
            const name = juo.slice((amount + " ").length);

            // chat("Start: " + Date.now());
            items.push({
                "name": name,
                "amount": +parseInt(keys[1]) * amount
            });
        }
    }

    const user = { id: userid, toId: cdi }
    chuyenNhieuDo(user, items).then(response => {
    });
}

// Chuyen do tinh phi
async function chuyenDoFromUser(fromId, args, msg = '') {
    const toId = args[1];
    const listItems = parseItemToTrans(msg.replace(`${args[0]} ${toId}`, ''));
    const ruong = await getRuong(fromId);
    const total = listItems.size;
    console.log('======================= chuyen do tinh phi =======================')
    console.log(ruong)
    let currentBac = ruong['bạc'];
    if (!currentBac) {
        await pmTcv(fromId, "Bạc không đủ để chuyển!");
        return;
    }

    currentBac = parseInt(currentBac);
    const bacPhi = total * CD_PRICE;
    if (currentBac < bacPhi) {
        await pmTcv(fromId, "Bạc không đủ để chuyển!");
        return;
    }

    await updateRuong(fromId, 'bạc', -1 * bacPhi);
    await chuyenDo2Id(listItems, fromId, toId);
}

// Chuyen do 2 id
async function chuyenDoFromAdmin(args, msg = '', cboxId = '') {
    const fromUser = parseInt(args[1]);
    const toUser = parseInt(args[2]);
    const listItems = parseItemToTrans(msg.replace(`${args[0]} ${fromUser} ${toUser}`, ''));
    await chuyenDo2Id(listItems, fromUser, toUser, cboxId);
}

async function chuyenDo2Id(listItems, fromUser, toUser, cboxId = '') {
    const ruong = await getRuong(fromUser);
    const items = [];
    for (let keys of listItems) {
        const name = keys[0];
        const amount = parseInt(keys[1]);
        if (ruong.hasOwnProperty(name)) {
            const currentAmount = parseInt(ruong[name]);
            if (currentAmount < amount) {
                await pmTcv(cboxId, "Số lượng không đủ để chuyển!");
                return;
            }
        } else {
            await pmTcv(cboxId, "Số lượng không đủ để chuyển!");
            return;
        }

        await updateRuong(fromUser, name, -1 * amount);
        items.push({
            name,
            amount
        });
    }

    const user = { id: fromUser, toId: toUser }
    chuyenNhieuDo(user, items, cboxId).then();
}

const updateRuong = async (memberId, item, amount, pmUser = false) => {
    const key = "ruong_do_ao_" + memberId + "_" + snake_case(item);
    let ruong = JSON.parse(await getItem(key));
    if (!ruong) {
        ruong = {};
    }

    if (ruong.hasOwnProperty(item)) {
        ruong[item] = parseInt(ruong[item]) + parseInt(amount);
        if (!ruong[item] || isNaN(ruong[item])) {
            delete ruong[item];
            await delKey(key);
            return;
        }
    } else {
        ruong[item] = amount;
    }

    const currentTtl = await getTtl(key);
    await setItem(key, JSON.stringify(ruong));
    if (item === "bạc") {
        const cboxId = await getCboxIdFromTcvId(memberId);
        if (cboxId && pmUser) {
            pmCbox(cboxId, "+" + amount + " " + item)
        }
        return;
    }

    // Tru ruong
    if (amount < 0) {
        if (currentTtl > 0) {
            await setExpire(key, currentTtl);
        }

        return;
    }

    await setExpire(key, ITEM_EXPIRE_IN);
    if (amount > 0 && pmUser) {
        const cboxId = await getCboxIdFromTcvId(memberId);
        if (cboxId) {
            pmCbox(cboxId, "+" + amount + " " + item)
        }
        // else {
        //     chat("[TEST] [b]@" + memberName + "[/b]: +" + amount + " " + item);
        // }
    }
}

/**
 *
 * @param itemText
 * @returns {Map<any, any>}
 */
function parseItemToTrans(itemText) {
    let listItems = new Map();
    const splitText = itemText.split(",")
    for (let o = 0; o < splitText.length; o++) {
        const item = splitText[o].trim().replace(/\s\s+/g, ' ');
        let amount = item.split(' ')[0];
        if (!isNaN(amount)) {
            let itemName = item.replace(amount + " ", '').replace(/\s\s+/g, ' ');
            if (itemName == null) {
                continue;
            }

            itemName = cap(viettat(itemName), false);
            let preAmount = parseInt(listItems.has(itemName) ? listItems.get(itemName) : 0);
            amount = preAmount + parseInt(amount);
            listItems.set(itemName, amount);
        }
    }

    return listItems;
}

const getRuong = async memberId => {
    const key = "ruong_do_ao_" + memberId + "_*";
    const itemKeys = await getKeys(key);
    if (itemKeys.length === 0) {
        return null;
    }

    const items = {};
    for (let i = 0; i < itemKeys.length; i++) {
        let item = await getItem(itemKeys[i]);
        if (item === "{}" || item === "") {
            await delKey(itemKeys[i]);
            continue;
        }

        item = JSON.parse(item);
        Object.assign(items, item);
    }

    return items;
}
const xoaRuong = async (memberId) => {
    const key = "ruong_do_ao_" + memberId + "_*";
    const itemKeys = await getKeys(key);
    for (let i = 0; i < itemKeys.length; i++) {
        await delKey(itemKeys[i]);
    }

    chat("Xong!");
}

const showMyRuong = async (member) => {
    await showRuong(member, null, false);
}

const checkRuong = async (memberId, memberCboxId) => {
    await showRuong(memberId, memberCboxId, true);
}

const checkMemberRuong = async (memberId, adminCboxId) => {
    await showRuong(memberId, adminCboxId, true);
}

const showRuong = async (memberId, toCboxId, isPm = true) => {
    const key = "ruong_do_ao_" + memberId + "_*";
    const itemKeys = await getKeys(key);
    if (itemKeys.length === 0) {
        if (!toCboxId) {
            chat("Rương trống!");
            return;
        }

        if (isPm) {
            pmCbox(toCboxId, "Rương trống!")
            return null;
        }

        return null;
    }

    const items = ["Rương:"];
    for (let i = 0; i < itemKeys.length; i++) {
        let item = await getItem(itemKeys[i]);
        if (item === "{}" || item === "") {
            await delKey(itemKeys[i]);
            continue;
        }

        item = JSON.parse(item);
        const itemName = Object.keys(item)[0];
        const amount = parseInt(item[itemName]);
        const ttl = await getTtl(itemKeys[i]);
        if (itemName === "bạc") {
            items.push(`✦ [color=blue][b]${amount} ${itemName}[/b][/color]`);
        } else {
            items.push(`✦ [b]${amount} ${itemName}[/b]: [color=gray]Hết hạn sau ${parseInt(ttl / 60)} phút[/color]`);
        }
    }

    if (!toCboxId) {
        chat(items.join("[br]"));
        return;
    }

    if (toCboxId) {
        await pmCbox(toCboxId, items.join("[br]"))
        return null;
    }

    await pmTcv(memberId, items.join("[br]"));
    return null;
}

const napRuong = async (fromCbox, args) => {
    const toId = args[2];
    const amount = parseInt(args[3]);
    let item = cap(viettat(args.splice(4).join(" ")), false);

    if (item === 'Bạc') {
        item = 'bạc';
    }

    if (item !== 'bạc') {
        chat("Chỉ có thể nạp bạc /tat");
        return;
    }
    await updateRuong(toId, item, amount);

    let toName = await getTcvNameFromTcvId(toId);
    if (!toName) {
        toName = toId;
    }

    await pmCbox(fromCbox, `Đã nạp ${amount} ${item} cho ${toName}`);
}

export {
    chuyenDoFromBot,
    chuyenDoFromBot2,
    chuyenDoFromAdmin,
    chuyenDoFromUser,
    chuyenDo,
    chuyenNhieuDo,
    updateRuong,
    showRuong,
    showMyRuong,
    napRuong,
    checkMemberRuong,
    checkRuong,
    xoaRuong
}
