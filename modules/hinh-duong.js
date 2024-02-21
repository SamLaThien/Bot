import fetch from "node-fetch";
import {ADMIN, CM_COOKIE} from "./constant.js";
import {chat} from "../helper.js";

export async function camNgon(args, cboxName, doId) {
    const memberId = args[1];
    const time = args[2];
    let body = `btnHinhDuong=1&txtMember=${memberId}&txtCamNgon=${time}&txtBeQuan=&txtLyDo=Theo yêu cầu của ${cboxName}`;
    if (ADMIN.includes(memberId)) {
        chat("Bạn đang vượt quyền để ban người không nên ban. RIP!");
        body = `btnHinhDuong=1&txtMember=${doId}&txtCamNgon=${time}&txtBeQuan=&txtLyDo=vượt quyền`;
    }
    const response = await fetch("https://tutien.net/account/bang_phai/hinh_duong/", {
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
        "referrer": "https://tutien.net/account/bang_phai/hinh_duong/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });

    chat("Xong!");
}
