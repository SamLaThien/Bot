import { decode } from 'html-entities';
import {
    chuyenDoFromBot,
    chuyenDoFromBot2,
    chuyenDoFromAdmin,
    chuyenDoFromUser,
    napRuong,
    showRuong,
    showMyRuong,
    checkRuong,
    checkMemberRuong, xoaRuong
} from "./chuyen-do.js";
import { checkPhapKhi, suaPhapKhi, checkBank, checkMem, duyetMem, xinVaoBang, nopVatPham } from "./member.js";
import { chuyenBacFromUser, chuyenRuong } from "./chuyen-bac.js";
import { ADMIN, CHUYEN_DO_IDS, BANK_ID, BAN_IDS, DUYET_IDS, CD_PRICE, USER_COOKIES } from "./constant.js";
import {
    getTcvIdFromCboxId,
    mapCboxTcv,
    mapTcvCbox,
    pmTcv,
    chat,
    setBasic,
    setTcvUsername,
    is_numeric, getTcvNameFromTcvId, pmCbox, getBasic,
    resetMember,
    getCboxIdFromTcvId
} from "../helper.js";
import { checkBaoKho, fetchItemCh, fetchBaoKho, moveND, checkKho } from "./bao-kho.js";
import { changeChucVu, congCongHien, searchPk, kickBang, inviteDongThien } from "./cong-hien.js";
import { camNgon } from "./hinh-duong.js";
import { replyText } from "./text-reply.js";
import { setPrice, setAmount, buyItem, sellItem, listBuy, listSell } from "./hac-diem.js";


export async function parseMessage(parsed) {
    const fromCboxId = parsed[9];
    let fromTcvName = decode(parsed[3]);
    let chucVu = fromTcvName;

    // cc_sm: vtt
    if (fromTcvName.includes("cc_sm")) {
        chucVu = chucVu.split("<sup>")[1].split("</sup>")[0].trim();
    } else {
        chucVu = "";
    }

    if (fromTcvName.includes(">")) {
        fromTcvName = fromTcvName.split(">")[1].split("<")[0];
    }

    const fromTcvId = parsed[5].split("member/")[1];
    const content = decode(parsed[6]);
    await mapTcvCbox(fromTcvId, fromCboxId);
    await mapCboxTcv(fromTcvId, fromCboxId);
    await setTcvUsername(fromTcvId, fromTcvName);
    if (chucVu) {
        await setBasic({
            id: fromTcvId,
            name: fromTcvName,
            cboxId: fromCboxId,
            chucVu
        });
    }



    try {
        await xuLyChat(content, parseInt(fromTcvId), fromCboxId, fromTcvName);
    } catch (error) {
        console.log(error);
    }
}


export async function xuLyChat(content = '', tcvId = 0, cboxId = '', tcvName = '') {
    if (!content.startsWith(".")) {
        await replyText(content, tcvName);
        return;
    }

    const msg = await parseMessageContent(content);
    const args = msg.split(' ');
    const text = msg.toLowerCase();
    console.log(args);
    console.log(text);

    // ======================= START HẮC ĐIẾM ===========================
    // Lưu ý: không thể vừa bán - vừa mua cùng 1 vật phẩm
    if (args[0] == '.hd') {
        if (args.length == 2 && args[1] == 'm') {
            await listBuy(cboxId);
            return;
        }

        if (args.length == 2 && args[1] == 'b') {
            await listSell(cboxId);
            return;
        }

        // format: .hd set giá tinh linh cp 30000
        if (text.startsWith('.hd giá') && ADMIN.includes(tcvId)) {
            const price = parseInt(args[args.length - 1]);
            const itemName = content.toLowerCase().replace('.hd giá ', '').replace(` ${price}`, '').trim();
            console.log(price);
            console.log(itemName);
            await setPrice(itemName, price);
            await pmCbox(cboxId, 'Done! /bee131 ');
            return;
        }

        // format: .hd set số lượng tinh linh cp 30000
        if (text.startsWith('.hd add') && ADMIN.includes(tcvId)) {
            const amount = parseInt(args[args.length - 1]);
            const itemName = content.toLowerCase().replace('.hd add ', '').replace(` ${amount}`, '').trim();
            await setAmount(itemName, amount);
            await pmCbox(cboxId, 'Done! /bee131 ');
            return;
        }

    }
    // format: mua 1 
    if (args.length >= 3 && text.startsWith('.mua')) {
        const amount = parseInt(args[1]);
        const itemName = content.toLowerCase().replace(`.mua ${amount} `, '').trim();
        await buyItem(tcvId, itemName, amount);
        return;
    }

    // format: bán 1 tinh linh cp
    if (args.length >= 3 && text.startsWith('.ban')) {
        const amount = parseInt(args[1]);
        const itemName = content.toLowerCase()
            .replace(`.ban${amount} `, '')
            .replace(`.ban ${amount} `, '')
            .trim();
        await sellItem(tcvId, itemName, amount);
        return;
    }
    // ======================= END HẮC ĐIẾM ===========================

    // Chuyen do (admin / TL)
    if (args[0] === ".cd" || args[0] === ".chuyendo") {
        //if (!ADMIN.includes(tcvId) && !CHUYEN_DO_IDS.includes(tcvId)) {
        //    chat("Bạn không có quyền chuyển đồ");
        //    return;
        //}

        if (!is_numeric(args[3])) {
            chuyenDoFromBot(msg, args, tcvId);
        } else {
            //await chuyenDoFromAdmin(args, msg, cboxId);
        }
        return 1;
    }

    if (args[0] === '.xin') {
        if (!is_numeric(args[2])) {
            chuyenDoFromBot2(msg, args, tcvId);
        } else {
            //await chuyenDoFromAdmin(args, msg, cboxId);
        }
        return 1;
    }

    // Them quyen
    if (args[0] === '.quyen') {
        // if (content.includes('<')) {
        //     parseTag(content).then(tag => {
        //         args = tag.split(" ");
        //         setPermission(args, tcvId).then(async () => {
        //             await pmTcv(cboxId, 'Xong /xga');
        //         });
        //     });
        // }
        //
        // setPermission(args, tcvId).then(async () => {
        //     await pmTcv(cboxId, 'Xong /xga');
        // });

        return;
    }

    // Chuyen bac
    if (args[0] === '.cb' || args[0] === '.chuyenbac') {

    }

    // update bao kho
    if (args[0] === '.updatebk' && ADMIN.includes(tcvId)) {
        await fetchItemCh();
        await fetchBaoKho("PHPSESSID=eeiksksgp38h72vm7rk60dtnvp; USER=LFvcd8nVBson%3A1hRzSg8iZZgYhr5lPpvuV8E7AJF2Vg%2FzNBnLHL5tnwt4; reada=1", 'nuoisamhamga');
        await delay(2000);
        await fetchBaoKho("PHPSESSID=1aeqhcrjkop33u754asjlt8iej; USER=%2FXPxkg1yaSLJ%3AFcGE1xXdWniG1S5ew7Qq821bEYAIMJll7qTmo7NM6Q59; reada=376", 'nuoisamhamga');
        await delay(2000);
        await fetchBaoKho("USER=QRhPfJMd3ecw%3Avxjd6tgrL9QU%2BMSm6g18xYEezF7aouOdp1%2BuLRyaMtIL; PHPSESSID=ha63ukuhcl447upac04ouhs87b; reada=11", '123456987');
        chat("Done!");
    }

    // Chuyen do (member)
    if (args[0] === '.c' || args[0] === '.chuyen') {
        // [chuyen, 300200, 1000, bac]
        if (args.length === 4 && args[3] === 'bạc') {
            await chuyenBacFromUser(tcvId, cboxId, args[1], parseInt(args[2]));
            return;
        }


        if (msg.toLowerCase().includes('bạc')) {
            chat('Không chuyển lẫn bạc với đồ /tat');
            return;
        }

        await chuyenDoFromUser(tcvId, args, msg);
        return;
    }

    // Chuyen ruong (member)
    if (args[0] === '.cr' || args[0] === '.chuyenruong') {
        // [".cr", "300200", "200 bạc"]
        if (args.length !== 3) {
            return;
        }

        chuyenRuong(tcvId, cboxId, args[1], args[2]).then();
        return;
    }

    if (args[0] === '.move') {
        if (ADMIN.includes(tcvId) && args.length >= 3) {
            const memberId = args[1];
            const bangPhai = msg.replace(`${args[0]} ${args[1]}`, '').trim();
            xinVaoBang(memberId, bangPhai).then();
            return;
        }
    }

    if (args[0] === '.update') {
        if (ADMIN.includes(tcvId) && args.length >= 2) {
            const memberId = args[1];
            resetMember(memberId);
            chat('Done!');
            return;
        }
    }

    if (args[0] === '.nop') {
        if (ADMIN.includes(tcvId)) {
            const memberId = args[1];
            await nopVatPham(memberId);
            return;
        }
    }

    // Check ruong (member)
    if (args[0] === '.ruong') {
        if (args.length === 1) {
            checkRuong(tcvId, cboxId).then();
            return;
        }

        if (args.length === 2 && is_numeric(args[1]) && ADMIN.includes(tcvId)) {
            const targetId = parseInt(args[1]);
            checkMemberRuong(targetId, cboxId).then();
            return;
        }

        if ((args[1] === 'nạp' || args[1] === 'nap') && ADMIN.includes(tcvId)) {
            await napRuong(cboxId, args);
            return;
        }

        if (args[1] == 'xoa' || args[1] == 'xóa') {
            if (args.length === 2) {
                xoaRuong(tcvId).then();
                return;
            }

            if (args.length === 3 && is_numeric(args[2]) && ADMIN.includes(tcvId)) {
                xoaRuong(args[2]).then();
            }
        }
    }


    // Show ruong (member)
    if (args[0] === '.show') {
        await showMyRuong(tcvId).then();
    }

    // Check bao kho
    if (args[0].startsWith('.sl') || args[0].startsWith('.cbk')) {
        const cboxId = await getCboxIdFromTcvId(tcvId);
        const ds_dan = ['9 Tẩy Tủy Đan', '13 Trúc Cơ Đan', '14 Bổ Nguyên Đan', '40 Bổ Anh Đan', '62 Hóa Nguyên Đan', '77 Luyện Thần Đan', '603 Hợp Nguyên Đan', '605 Đại Linh Đan'];
        const ds_duoc = ['25 Ngọc Tủy Chi', '32 Trích Tinh Thảo', '24 Hóa Long Thảo', '26 Thiên Linh Quả', '33 Thiên Nguyên Thảo', '23 Uẩn Kim Thảo', '103 Huyết Tinh Thảo', '63 Anh Tâm Thảo', '65 Hóa Nguyên Thảo', '7906 Luyện Thần Thảo', '30497 Hợp Nguyên Thảo', '33204 Đại Linh Thảo'];
        if (args[1] === 'danduoc') {
            checkKho(cboxId, ds_dan).then(() => { });
        } else
            if (args[1] === 'duocthao') {
                checkKho(cboxId, ds_duoc).then(() => { });
            }
            else {
                checkBaoKho(msg.replace(`${args[0]} `, '').trim().replace(/\s\s+/g, " "), cboxId).then(() => { });
            }
        return;
    }

    if (args[0].startsWith('.chuyennd')) {
        moveND(tcvName).then(() => { });
        return;
    }

    // Check phap khi
    if (args[0] === '.cpk') {
        checkPhapKhi(tcvId).then(() => {
        });
    }


    // Sua phap khi
    if (args[0] === '.spk') {
        return;
        suaPhapKhi(tcvId, []).then(() => {
        });
    }

    // Chuc
    if (args[0] === '.chuc') {
        if (ADMIN.includes(tcvId) && args.length === 3) {
            changeChucVu(args, cboxId).then();
            return;
        }
    }

    if (args[0] === '.dong') {
        //if (ADMIN.includes(tcvId) && args.length === 2) {
        const memberId = args[1];
        inviteDongThien(memberId).then();
        return;
        // }
    }

    // Cong cong hien
    if (args[0] === '.cch') {
        if (ADMIN.includes(tcvId) && args.length === 3) {
            congCongHien(args, cboxId).then();
            return;
        }
    }

    if (args[0] === '.kick') {
        if (ADMIN.includes(tcvId) && args.length === 2) {
            const memberId = args[1];
            await kickBang(memberId).then();
            return;
        }
    }

    // Tru cong hien
    if (args[0] === '.cn') {
        if ((ADMIN.includes(tcvId) || BAN_IDS.includes(tcvId)) && args.length === 3) {
            camNgon(args, tcvName, tcvId).then();
            return;
        }
    }

    if (args[0] === '.cb') {
        checkBank(tcvId).then(r => {
            chat('[color=blue]Bạn đang có: [b]' + r + " bạc [/b][/color]")
        });
        return 1;
    }


    // Check bank
    if (args[0] === '.bank') {
        checkBank(BANK_ID).then(r => {
            chat('[color=blue]Ngân quỹ bang: [b]' + r + " bạc [/b][/color]")
        });
        return 1;
    }

    // Check bank
    if (args[0] === '.cmem' && args.length === 1) {
        checkMem().then();
        return 1;
    }

    // Check bank
    if (args[0] === '.duyet' && args.length === 2 && (DUYET_IDS.includes(tcvId) || ADMIN.includes(tcvId))) {
        duyetMem(args[1]).then();
        return 1;
    }

    // Check bank
    if (args[0] === '.clear' && ADMIN.includes(tcvId)) {
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("[br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br][br]");
        chat("Xong!");
        return 1;
    }

    // Set CH
    if (args[0] === '.setch') {
        const itemName = msg.replace('.setch', '');
        searchPk(itemName).then();
        return;
    }

    if (args[0] === '.help') {
        const messages = [
            'Các tính năng đang được hỗ trợ:',
            `✦ Chuyển đồ từ rương: [b].c 1234 1 linh thạch hp[/b]. Lưu ý: ${CD_PRICE} bạc/vật phẩm, không có confirm`,
            `✦ Chuyển bạc từ rương: [b].c 1234 10000 bạc[/b]. Lưu ý: chuyển tối đa 200k bạc/lần, không có confirm nên các bạn cẩn thận`,
            `✦ Chuyển bạc từ rương qua rương: [b].cr[/b]`,
            `✦ Kiểm tra rương bản thân: [b].ruong[/b]`,
            `✦ Check bảo khố: [b].cbk[/b]`,
            `✦ Check đơn vào bang: [b].cmem[/b]`,
            `✦ Duyệt member: [b].duyet[/b]`,
            `✦ Set cống hiến: [b].setch[/b]`,
            `✦ Kiểm tra ngân quỹ của bang: [b].bank[/b]`,
            `✦ Kiểm tra bạc của bản thân: [b].cb[/b]`,
        ];

        if (ADMIN.includes(tcvId) || CHUYEN_DO_IDS.includes(tcvId)) {
            messages.push(`✦ Chuyển đồ 2 ID: [b].cd 123 456 1 lthp[/b]`);
        }

        if (ADMIN.includes(tcvId)) {
            messages.push(`✦ Nạp bạc: [b].ruong nạp 1234 10000 bạc[/b]`);
            messages.push(`✦ Chuyển đồ 1 ID: [b].cd 123 1 lthp[/b]`);
            messages.push(`✦ Cấm ngôn: [b].cn 123 1[/b]`);
            messages.push(`✦ Cộng cống hiến: [b].cch 123 1000[/b]`);
            messages.push(`✦ Kiểm tra rương của member: [b].show 123[/b]`);
            messages.push(`✦ Set chức cho member: [b].chuc 123 nm[/b]`);
        }

        pmCbox(cboxId, messages.join("[br]"));
        return 1;
    }
}

async function parseTag(str) {
    const tag = str.slice(str.indexOf('<'), str.lastIndexOf('>') + 1);
    const cboxId = tag.split('uid="')[1].split('"')[0];
    const tcvId = await getTcvIdFromCboxId(cboxId);
    return str.replace(tag, tcvId);
}

async function parseMessageContent(message) {
    let replaced = message.replace(/<(.+?)[\s]*\/?[\s]*>/g, '')
        .replaceAll('CM', '')
        .replaceAll('ĐTL', '')
        .replaceAll('TL', '')
        .replaceAll('HP', '')
        .replaceAll('HT', '')
        .replaceAll('NM', '')
        .replaceAll('NGM', '')
        .replaceAll('Top 1', '')
        .replaceAll('Top 2', '')
        .replaceAll('Top 3', '')
        .replace(/\s\s+/g, " ");

    const ids = message.split('data-uid="');
    if (ids.length === 1) {
        return replaced;
    }

    const cboxId1 = ids[1].split('"')[0];
    const memberId1 = await getTcvIdFromCboxId(cboxId1);
    const cboxName1 = await getTcvNameFromTcvId(memberId1);
    if (ids.length === 2) { // 1 id
        return replaced.replace(cboxName1, memberId1);
    }

    // 2 id
    const cboxId2 = ids[2].split('"')[0];
    const memberId2 = await getTcvIdFromCboxId(cboxId2);
    const cboxName2 = await getTcvNameFromTcvId(memberId2);
    return replaced.replace(cboxName1, memberId1)
        .replace(cboxName2, memberId2);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}