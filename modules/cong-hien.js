import fetch from "node-fetch";
import { CM_COOKIE } from "./constant.js";
import { getUserInfo } from "./member.js";
import { chat, getBasic, parse_chuc, setBasic, setItem, snake_case } from "../helper.js";

export async function changeChucVu(args, cboxId) {
    const memberId = args[1];
    const chucVu = args[2];
    const quyenHan = parse_chuc(chucVu.toLowerCase());
    await changeCongHien(memberId, 0, quyenHan);
    const basic = await getBasic(memberId);
    basic.chucVu = chucVu;
    await setBasic(basic);
    chat("Xong!");
}

export async function congCongHien(args, cboxId) {
    const memberId = args[1];
    const amount = args[2];
    const accountInfo = await getUserInfo(memberId, true);
    const chucVu = accountInfo.chucVu ? accountInfo.chucVu.toLowerCase() : '';
    const quyenHan = parse_chuc(chucVu);
    await changeCongHien(memberId, amount, quyenHan);
    chat("Xong!");
}

export async function kickBang(userid) {
    const body = "btnKickBang=1&member_id=" + userid;
    const referrer = "https://tutien.net/account/bang_phai/chap_su_duong/?txtMember=" + userid;
    const response = await fetch("https://tutien.net/account/bang_phai/chap_su_duong/", {
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
        referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        body,
        "method": "POST",
        "mode": "cors"
    });
    chat('Đã Kick !!!')
    return await response.text();
}

export async function inviteDongThien(userid) {
    const body = "btnDoiMemberBang=1&member_id=" + userid + "&txtTenMoi=&txtCongHien=0&selQuyenHan=0&chkDongThien=1";
    const referrer = "https://tutien.net/account/bang_phai/chap_su_duong/?txtMember=" + userid;
    const response = await fetch("https://tutien.net/account/bang_phai/chap_su_duong/", {
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
        referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        body,
        "method": "POST",
        "mode": "cors"
    });
    const res = await response.text();
    if (res == 1) {
        chat(`[b][color=Red]Đã cho id ${userid} vào động[/color][/b]`);
    } else {
        chat(res);
    }
}

export async function changeCongHien(userid, amount, quyenHan) {
    const body = "btnDoiMemberBang=1&member_id=" + userid + "&txtTenMoi=&txtCongHien=" + amount + "&selQuyenHan=" + quyenHan + "&chkDongThien=0";
    const referrer = "https://tutien.net/account/bang_phai/chap_su_duong/?txtMember=" + userid;
    const response = await fetch("https://tutien.net/account/bang_phai/chap_su_duong/", {
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
        referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        body,
        "method": "POST",
        "mode": "cors"
    });
    return await response.text();
}

export async function searchPk(itemName, isReturnCh = false) {
    const body = `btnTimPhapKhi=1&txtTenPhapKhi=${itemName}`;
    const response = await fetch("https://tutien.net/account/bang_phai/chap_su_duong/", {
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
        "referrer": "https://tutien.net/account/bang_phai/chap_su_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });

    const res = await response.text();
    if (!res.includes("txtVatPham_")) {
        return null;
    }

    // txtVatPham_32408_nhap
    const itemId = res.split("_nhap")[0].split("txtVatPham_")[1];
    const chs = res.split('value="');
    const nhap = chs[1].split('"')[0];
    const xuat = chs[2].split('"')[0];

    const key = 'bk_' + snake_case(itemName);
    await setItem(key, JSON.stringify({ name: itemName, nhap, xuat, itemId }));
    if (isReturnCh) {
        return { name: itemName, nhap, xuat, itemId };
    }

    await setCh(itemId);
    chat("Xong!");
}

export async function setCh(itemId) {
    const body = `txtVatPham[${itemId}][nhap]=1&txtVatPham[${itemId}][xuat]=1`
    const response = await fetch("https://tutien.net/account/bang_phai/chap_su_duong/", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,ja;q=0.5",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": CM_COOKIE
        },
        "referrer": "https://tutien.net/account/bang_phai/chap_su_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });
}

export default {
    changeCongHien
}
