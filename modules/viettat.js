export function viettat(vp) {
    vp = vp
        .replace('hạ phẩm', 'hp')
        .replace('trung phẩm', 'tp')
        .replace('thượng phẩm', 'thp')
        .replace('cực phẩm', 'cp');

    switch (vp) {
        case 'mtd1':
            return 'mảnh tàn đồ s1';
        case 'mtd2':
            return 'mảnh tàn đồ s2';
        case 'mtd3':
            return 'mảnh tàn đồ s3';
        case 'mtd4':
            return 'mảnh tàn đồ s4';
        case 'mtd5':
            return 'mảnh tàn đồ s5';
        case 'ntlntp':
            return 'ngọc tủy linh nhũ tp';
        case 'ntlnthp':
            return 'ngọc tủy linh nhũ thp';
        case 'ntlnhp':
            return 'ngọc tủy linh nhũ hp';
        case 'ttd':
            return 'tẩy tủy đan';
        case 'ktt':
            return 'khúc tương tư';
        case 'tcd':
            return 'trúc cơ đan';
        case 'lthp':
            return 'linh thạch hp';
        case 'bnd':
            return 'bổ nguyên đan';
        case 'lttp':
            return 'linh thạch tp';
        case 'ltthp':
            return 'linh thạch thp';
        case 'bad':
            return 'bổ anh đan';
        case 'hnd':
            return 'hóa nguyên đan';
        case 'ltcp':
            return 'linh thạch cp';
        case 'ltd':
            return 'luyện thần đan';
        case 'tlhp':
            return 'tinh linh hp';
        case 'tltp':
            return 'tinh linh tp';
        case 'tlthp':
            return 'tinh linh thp';
        case 'tlcp':
            return 'tinh linh cp';
        case 'lbbh':
            return 'lệnh bài bang hội';
        case 'btt':
            return 'bánh trung thu';
        case 'hkd':
            return 'huyết khí đan';
        case 'htd':
            return 'huyết tinh đan';
        case 'bhd':
            return 'bổ huyết đan';
        case 'tlc':
            return 'tị lôi châu';
        case 'hltr':
            return 'hộ linh trận';
        case 'hộ':
            return 'hộ linh trận';
        case 'hkl':
            return 'hoàng kim lệnh';
        case 'hnc':
            return 'hỏa ngọc châu';
        case 'tnc':
            return 'thải ngọc châu';
        case 'snc':
            return 'sa ngọc châu';
        case 'tlt':
            return 'tán lôi trận';
        case 'tán':
            return 'tán lôi trận';
        case 'dgt':
            return 'đê giai thuẫn';
        case 'đgt':
            return 'đê giai thuẫn';
        case 'ntc':
            return 'ngọc tủy chi';
        case 'ttt':
            return 'trích tinh thảo';
        case 'hlt':
            return 'hóa long thảo';
        case 'tlq':
            return 'thiên linh quả';
        case 'tnt':
            return 'thiên nguyên thảo';
        case 'ukt':
            return 'uẩn kim thảo';
        case 'att':
            return 'anh tâm thảo';
        case 'hnt':
            return 'hóa nguyên thảo';
        case 'ltt':
            return 'luyện thần thảo';
        case 'kt':
            return 'kim thuổng';
        case 'tthp':
            return 'tinh thiết hp';
        case 'gn':
            return 'gạo nếp';
        case 'dx':
            return 'đậu xanh';
        case 'đx':
            return 'đậu xanh';
        case 'ld':
            return 'lá dong';
        case 'gv':
            return 'gia vị';
        case 'tm':
            return 'thịt mỡ';
        case 'ls':
            return 'lông sói';
        case 'tcdp':
            return 'trúc cơ đan phương';
        case 'hkdp':
            return 'huyết khí đan phương';
        case 'ttdp':
            return 'tẩy tủy đan phương';
        case 'tdl':
            return 'thiên địa lô';
        case 'hmd':
            return 'hắc ma đỉnh';
        case 'tdd':
            return 'thánh diệu đỉnh';
        case 'tnd':
            return 'thần nông đỉnh';
        case 'tttp':
            return 'tinh thiết tp';
        case 'ndc1':
            return 'nội đan c1';
        case 'nd1':
            return 'nội đan c1';
        case 'ndc2':
            return 'nội đan c2';
        case 'nd2':
            return 'nội đan c2';
        case 'ndc3':
            return 'nội đan c3';
        case 'nd3':
            return 'nội đan c3';
        case 'ndc4':
            return 'nội đan c4';
        case 'nd4':
            return 'nội đan c4';
        case 'ndc5':
            return 'nội đan c5';
        case 'nd5':
            return 'nội đan c5';
        case 'ndc6':
            return 'nội đan c6';
        case 'nd6':
            return 'nội đan c6';
        case 'ndc7':
            return 'nội đan c7';
        case 'nd7':
            return 'nội đan c7';
        case 'ndc8':
            return 'nội đan c8';
        case 'nd8':
            return 'nội đan c8';
        case 'ndc9':
            return 'nội đan c9';
        case 'nd9':
            return 'nội đan c9';
        case 'cs':
            return 'chu sa';
        case 'pmtc1':
            return 'phụ ma thạch c1';
        case 'pmt1':
            return 'phụ ma thạch c1';
        case 'pmtc2':
            return 'phụ ma thạch c2';
        case 'pmt2':
            return 'phụ ma thạch c2';
        case 'pmtc3':
            return 'phụ ma thạch c3';
        case 'pmt3':
            return 'phụ ma thạch c3';
        case 'pmtc4':
            return 'phụ ma thạch c4';
        case 'pmt4':
            return 'phụ ma thạch c4';
        case 'pmtc5':
            return 'phụ ma thạch c5';
        case 'pmt5':
            return 'phụ ma thạch c5';
        case 'pmtc6':
            return 'phụ ma thạch c6';
        case 'pmt6':
            return 'phụ ma thạch c6';
        case 'pmtc7':
            return 'phụ ma thạch c7';
        case 'pmt7':
            return 'phụ ma thạch c7';
        case 'pmtc8':
            return 'phụ ma thạch c8';
        case 'pmt8':
            return 'phụ ma thạch c8';
        case 'pmtc9':
            return 'phụ ma thạch c9';
        case 'pmt9':
            return 'phụ ma thạch c9';
        case 'bhn':
            return 'băng hỏa ngọc';
        case 'utd':
            return 'uẩn thiên đan';
        case 'utdp':
            return 'uẩn thiên đan phương';
        case 'bndp':
            return 'bổ nguyên đan phương';
        case 'htdp':
            return 'huyết tinh đan phương';
        case 'ttthp':
            return 'tinh thiết thp';
        case 'qb':
            return 'quyên bạch';
        case 'vtd':
            return 'vạn thú đỉnh';
        case 'ttv':
            return 'túi trữ vật';
        case 'cptq':
            return 'công pháp tàn quyển';
        case 'ptd':
            return 'phá thiên đan';
        case 'thl':
            return 'tạo hóa lô';
        case 'badp':
            return 'bổ anh đan phương';
        case 'ttcp':
            return 'tinh thiết cp';
        case 'lb':
            return 'la bàn';
        case 'qg':
            return 'quy giáp';
        case 'ngtc':
            return 'ngọc giản truyền công';
        case 'ctd':
            return 'cố thần đan';
        case 'hndp':
            return 'hóa nguyên đan phương';
        case 'tdl':
            return 'thiên địa lô';
        case 'vthp':
            return 'vẫn thiết hp';
        case 'bhdp':
            return 'bổ huyết đan phương';
        case 'ntd':
            return 'ngưng thần đan';
        case 'vttp':
            return 'vẫn thiết tp';
        case 'tkl':
            return 'thiên kiếm lệnh';
        case 'hmd':
            return 'hắc ma đỉnh';
        case 'nsvn':
            return 'nhân sâm vạn năm';
        case 'dtd':
            return 'dung thần đan';
        case 'vtthp':
            return 'vẫn thiết thp';
        case 'hdc':
            return 'hoán diện châu';
        case 'vtcp':
            return 'vẫn thiết cp';
        case 'ltdp':
            return 'luyện thần đan phương';
        case 'kttt':
            return 'khai thiên thần thạch';
        case 'vht':
            return 'vĩnh hằng thạch';
        case 'htb':
            return 'hòa thị bích';
        case 'tbb':
            return 'tụ bảo bài';
        case 'ktc':
            return 'kim thủ chỉ';
        case 'nbt':
            return 'nguyệt bạch thạch';
        case 'hpt':
            return 'hổ phách thạch';
        case 'hdt':
            return 'hắc diệu thạch';
        case 'bdtc':
            return 'bất diết thiên công';
        case 'ntls':
            return 'Ngọc Tuyết Linh Sâm';
        case 'thll':
            return 'Tuyết Hải Lam Lăng';
        case 'vtlb':
            return 'Vô Thiên Lăng Ba';
        case 'dmc':
            return 'Dạ Minh Châu';
        case 'đào':
            return 'Bàn Đào Quả';
        case 'đề':
            return 'Bồ Đề Quả';
        case 'tpb':
            return 'Túi Phân Bón';
        case 'nhũ tp':
            return 'ngọc tủy linh nhũ tp';
        case 'nhũ thp':
            return 'ngọc tủy linh nhũ thp';
        case 'nhũ hp':
            return 'ngọc tủy linh nhũ hp';
        case 'dlt':
            return 'Đại Linh Thảo';
        case 'nhũ cp':
            return 'ngọc tủy linh nhũ cp';
        case 'tstl':
            return 'Thiên Sơn Tuyết Liên';
        case 'tsv':
            return 'Túi Sủng Vật';
        case 'thanh':
            return 'Thanh Tâm Đan';
        case 'đê':
            return 'Đê Giai Thuẫn';
        case 'tị':
            return 'Tị Lôi Châu';
        case 'ttb':
            return 'Thông Thiên Bội';
        case 'bt':
            return 'Bái Thiếp';
        case 'vcmk':
            return 'Vô Cực Ma Kinh';
        case 'ltbk':
            return 'Lô Tô Bờ Kè';
        case 'lsh':
            return 'Lục San Hô';
        case 'dcbn':
            return 'Dương Chi Bạch Ngọc';
        case 'ngô':
            return 'Ngô Đồng Quả';
        case 'tử hp':
            return 'Tử Tinh HP';
        case 'tử tp':
            return 'Tử Tinh TP';
        case 'tử thp':
            return 'Tử Tinh THP';
        case 'hhd':
            return 'Hồi Huyết Đan';
        case 'thủy':
            return 'Thời Gian Chi Thủy';
        case 'tta':
            return 'Túi Thức Ăn';
        case 'hkct':
            return 'Hư Không Chi Thạch';
        case 'lt':
            return 'Linh Tuyền';
        case 'btg':
            return 'Bàn Tính Gẩy Abacus';
        case 'tlong':
            return 'Thanh Long Quả';
        case 'đại':
            return 'Đại Linh Đan';

        default:
            return vp;
    }

    return vp;
}

export function cap(x, sup = true) {
    while (x.includes('_')) {
        x = x.replace('_', ' ');
    }

    let y = '';

    for (let loop = 0; loop < x.split(' ').length; loop++) {
        let string = x.split(' ')[loop].toLowerCase();
        if (string == 'hp' || string == 'tp' || string == 'thp' || string == 'cp') {
            if (sup) {
                y = y + ' [sup]' + string.toUpperCase() + '[/sup]';
            } else {
                y = y + ' ' + string.toUpperCase();
            }
        } else {
            if (string == 'hp,' || string == 'tp,' || string == 'thp,' || string == 'cp,') {
                if (sup) {
                    y = y + ' [sup]' + string.toUpperCase().split(0, string.length - 1) + '[/sup],';
                } else {
                    y = y + ' ' + string.toUpperCase().split(0, string.length - 1) + ',';
                }
            } else {
                y = y + ' ' + string.charAt(0).toUpperCase() + string.slice(1);
            }
        }

    }

    // const r = y.slice(1);
    // if (r == "Lượt Quay") {
    //     return "[color=#00cc99]Lượt Quay[/color]" ;
    // }
    //
    // return r;
    return y.slice(1);
}
