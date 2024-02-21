import {fetchItemCh, redirectBaoKho} from "../modules/bao-kho.js";

redirectBaoKho().then(() => {
    fetchItemCh().then(() => {});
})
