import fetch from "node-fetch";
import { BANK_COOKIE, MAX_CHUYEN_BAC, ADMIN } from "./constant.js";
import {chat, getBasic, getItem, getTcvNameFromTcvId, pmCbox} from "../helper.js";
import {updateRuong} from "./chuyen-do.js";
import {getUserInfo} from "./member.js";

export async function chuyenRuong(fromId, fromCboxId, toId, amount) {
    const key = "ruong_do_ao_" + fromId + "_bac";
    let ruong = await getItem(key);
    if (ruong === "") {
        await pmCbox(fromCboxId, "Bạc không đủ để chuyển.");
        return;
    }

    ruong = JSON.parse(ruong);
    const currentAmount = parseInt(ruong["bạc"]);
    if (currentAmount < amount) {
        await pmCbox(fromCboxId, "Bạc không đủ để chuyển.");
        return;
    }

    await updateRuong(fromId, "bạc", -1 * amount);
    await updateRuong(toId, "bạc", amount);
    chat("Xong /xga");
}

export async function chuyenBacFromUser(fromId, fromCboxId, toId, amount) {
    if (amount < 1000) {
        await pmCbox(fromCboxId, '[b][color=red]Chuyển tối thiểu 1000 bạc[/color][/b] :@');
        return;
    }

    if (amount > MAX_CHUYEN_BAC && !ADMIN.includes(fromId)) {
        await pmCbox(fromCboxId, `[b][color=red]Chuyển tối đa ${MAX_CHUYEN_BAC} bạc[/color][/b] :@`);
        return;
    }

    const key = "ruong_do_ao_" + fromId + "_bac";
    let ruong = await getItem(key);
    if (ruong === "") {
        await pmCbox(fromCboxId, "Bạc không đủ để chuyển.");
        return;
    }

    ruong = JSON.parse(ruong);
    const currentAmount = parseInt(ruong["bạc"]);
    let total = amount;
    if (amount < 50000) {
        total *= 1.02;
        total += 500;
    } else {
        total *= 1.03;
    }
    if (currentAmount < total) {
        await pmCbox(fromCboxId, "Bạc không đủ để chuyển.");
        return;
    }

    const fromName = await getTcvNameFromTcvId(fromId);
    await updateRuong(fromId, "bạc", -1 * total);
    const isSuccess = await chuyenBac(fromId, toId, amount);
    if (isSuccess) {
        let toName = await getTcvNameFromTcvId(toId);
        if (!toName) {
            const basic = await getUserInfo(toId);
            toName = basic.name;
        }

        chat(`@${fromName} Đã chuyển ${amount} bạc cho ${toName} ([url=https://tutien.net/member/${toId}]${toId}[/url])`);
        return;
    }

    chat(`@${fromName} Có lỗi xảy ra, bạn được nhận lại bạc!`);
    await updateRuong(fromId, "bạc", total);
}

export async function chuyenBac(fromId, toId, amount) {
    const referrer = `https://tutien.net/member/${toId}`;
    const body = `btntangNganLuong=1&txtMoney=${amount}&member=${toId}`;
    const response = await fetch("https://tutien.net/index.php", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": BANK_COOKIE
        },
        referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        body,
        "method": "POST",
        "mode": "cors"
    });

    const res = await response.text();
    return res === '1';
}

export default {
    chuyenBac
}
