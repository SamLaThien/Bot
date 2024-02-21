import { chat, } from "../helper.js";
export async function replyText(msg, username) {
    if (msg.includes("sirin ơi") || msg.includes("Hey Sirin")) {
        chat('' + username + '[b][color=BlueViolet] Xin chào, ta là Sirin~desu [/color][/b]');
        return;
    }
    if (msg.includes("sirin ơi") || msg.includes("Sirin ơi")) {
        chat('' + username + '[b][color=BlueViolet] Sirin đây. Làm bạn với Sirin không? Sirin sẽ dùng phép thuật để giúp ngươi~desu [/color][/b]');
        return;
    }
    if (msg.includes("dp lk") || msg.includes("tl lk")) {
        chat('' + username + '[b][color=BlueViolet] Đây nhé~desu [/color][/b]' + '[br][IMG]https://i.imgur.com/EURapEO.png[/IMG]');
        return;
    }
    if (msg.includes("dp tc") || msg.includes("tl tc")) {
        chat('' + username + '[b][color=BlueViolet] Đây nhé~desu [/color][/b]' + '[br][IMG]https://i.imgur.com/YAxq8SG.png[/IMG]');
        return;
    }
    if (msg.includes("dp kd") || msg.includes("tl kd")) {
        chat('' + username + '[b][color=BlueViolet] Đây nhé~desu [/color][/b]' + '[br][IMG]https://i.imgur.com/jNLPXWW.png[/IMG]');
        return;
    }
    if (msg.includes("dp na") || msg.includes("tl na")) {
        chat('' + username + '[b][color=BlueViolet] Đây nhé~desu [/color][/b]' + '[br][IMG]https://i.imgur.com/WQh1kyg.png[/IMG]');
        return;
    }
    if (msg.includes("bank sâm") || msg.includes("Bank sâm")) {
        chat(username + '[b][color=BlueViolet] Đây nhé~desu [/color][/b]' + '[br]Lê Nguyễn Anh Huy.[br]Ngân Hàng Sacombank.[br]Số TK: 070096802437.[br] Momo: 0334321310.');
        return;
    }
    if (msg.includes("ds đan") || msg.includes("Ds đan")) {
        chat(username + '[b][color=BlueViolet] Đây nhé~desu [/color][/b]' + '[br][img]https://img.upanh.tv/2023/01/15/2023-01-15-2.png[/img]');
        return;
    }
}
