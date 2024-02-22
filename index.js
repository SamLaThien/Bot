import WebSocket from 'ws';
import { parseMessage } from "./modules/socket-listener.js";
import { chat } from "./helper.js";
import { duyetMem } from './modules/member.js';
import { fetchBaoKho } from './modules/bao-kho.js';

const LH_WS_URL = "wss://flr-eu0.cbox.ws:4430/?pool=2-2397766-14";
const ws = new WebSocket(LH_WS_URL);

ws.on('open', function open() {
    ws.send('test');
});

const IGNORE_ID = [
    '6550468', // bot
    '5095765', // truyencv bot
];

const AUTO_DUYET = [
    "Vα̣η Tɦε̂́ Đε̂̀υ Yε̂υ Eм",
    "Khổng Minh Tiên Sinh",
    "Lô Tô Bờ Kè",
    "Gà xích Lô",
    "Mukuro Hoshimiya",
    "____Quân-Mạc______",
    "๖ۣۜBạch๖ۣۜ† Dạ☠Đế † Vương",
    "✰Ťɦεɾεşα Ąρøċαℓүρşε✰",
    "๖ۣۜthánh๖nhây",
    "__DiepThu__",
    "︵✿ ๖ۣۜCô‿Độ¢ ‿✿",
    "Trồng Đào 1",
    "ɮαвүᴮᵒˢˢ‿ ☸",
    "☆Nhất•Diệp•Chi•Thu☆",
];

ws.on('message', async function incoming(data) {
    const parsed = data.split("\t");
    if (parsed.length < 9) {
        return;
    }

    const fromCboxId = parsed[9];
    if (IGNORE_ID.includes(fromCboxId)) {
        return;
    }

    if (fromCboxId == '6311236') {
        const content = parsed[6];
        if (content.includes('Có ai không, duyệt')) {
            const memberName = content.split('Có ai không, duyệt ')[1].split(' (')[0].trim();
            const requestId = content.split('(')[1].split(')')[0].trim();
            for (let i = 0; i < AUTO_DUYET.length; i++) {
                if (memberName.includes(AUTO_DUYET[i])) {
                    await duyetMem(requestId, false);
                    chat('Đã duyệt: [b]' + AUTO_DUYET[i] + '[/b]!');
                }
            }
        }
        return;
    }

    await parseMessage(parsed);
})
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
chat('[b][color=BlueViolet]Bot đã online lúc ' + (new Date()).toString() + '[/color][/b]');
