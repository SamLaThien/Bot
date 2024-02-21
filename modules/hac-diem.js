import { getItem, pmTcv, pmCbox, chat, setItem, snake_case } from "../helper.js";
import { updateRuong, chuyenDoHacDiem } from "./chuyen-do.js";
import { cap, viettat } from "./viettat.js";

const HE_THONG = 1; // Vật phẩm hệ thống, có thể chuyển về acc
const HAC_DIEM = 2; // Vật phẩm hắc điểm, chỉ có thế chuyển rương

const SELL_ITEMS = [
  {
    name: 'Băng Hỏa Ngọc',
    type: HE_THONG,
  },
  {
    name: 'Bổ Anh Đan',
    type: HE_THONG,
  },
  {
    name: 'Bàn Đào Quả',
    type: HE_THONG,
  },
  {
    name: 'Bái Thiếp',
    type: HE_THONG,
  },
];
const BUY_ITEMS = [
  //'Linh Tuyền',
  //'Đê Giai Thuẫn',
  //'Tị Lôi Châu',
  //'Thanh Tâm Đan',
  //'Tinh Linh CP',
  //'Tinh Linh THP',
  //'Tử Tinh HP',
  //'Tử Tinh TP',
  'Ngọc Tủy Chi',
  'Trích Tinh Thảo',
  //'Hóa Long Thảo',
  'Thiên Linh Quả',
  //'Thiên Nguyên Thảo',
  //'Uẩn Kim Thảo',
  //'Anh Tâm Thảo',
  //'Hóa Nguyên Thảo',
  //'Luyện Thần Thảo',
  //'Hợp Nguyên Thảo',
  //'Đại Linh Thảo',
  'Hắc Diệu Thạch',
  'Hổ Phách Thạch',
  'Nguyệt Bạch Thạch',
  //'Bồ Đề Quả',
  //'Túi Phân Bón',
  //'Túi Sủng Vật',
  //'Ngọc Giản Truyền Công',
  //'Túi Thức Ăn',
  //'Thời Gian Chi Thủy',
  'Trúc Cơ Đan',
  'Tẩy Tủy Đan',
  'Hỏa Ngọc Châu',
  'Sa Ngọc Châu',
  'Thải Ngọc Châu',
];

export async function setPrice(itemName, price) {
  const name = viettat(itemName);
  const redisKey = `hac_diem_${snake_case(name)}_price`;
  await setItem(redisKey, price);
}

export async function setAmount(itemName, amount) {
  const name = viettat(itemName);
  const redisKey = `hac_diem_${snake_case(name)}_amount`;
  await setItem(redisKey, amount);
}


export async function getPrice(itemName) {
  const name = viettat(itemName);
  const redisKey = `hac_diem_${snake_case(name)}_price`;
  const price = await getItem(redisKey);
  return price ? parseInt(price) : 0;
}

export async function getAmount(itemName) {
  const name = viettat(itemName);
  const redisKey = `hac_diem_${snake_case(name)}_amount`;
  const amount = await getItem(redisKey);
  return amount ? parseInt(amount) : 0;
}

// Member mua vật phẩm
export async function buyItem(accountId, itemName, amount) {
  const name = cap(viettat(itemName));
  const item = SELL_ITEMS.find((buyItem) => buyItem.name === name);
  if (!item) { // Hệ thống không thu mua ${name}
    return;
  }

  const hacDiemAmount = await getAmount(itemName);
  const price = await getPrice(itemName);

  // Chưa set giá hoặc số lượng vật phẩm
  if (!hacDiemAmount || !price) {
    // Hắc điếm không mua vật phẩm
    return;
  }

  if (hacDiemAmount < amount) {
    // Hắc điếm chỉ còn hacDiemAmount vật phẩm
    return;
  }

  const redisItem = await getItem("ruong_do_ao_" + accountId + "_bac");
  // Rương không có bạc
  if (!redisItem) {
    return;
  }

  const ruongItem = JSON.parse(redisItem);
  const bacAmount = parseInt(`${Object.values(ruongItem)[0]}`);
  const totalPrice = amount * price;
  if (bacAmount < totalPrice) {
    // Không đủ bạc để mua
    return;
  }

  if (item.type === HE_THONG) {
    // Chuyển đồ về account
    //await updateRuong(accountId, name, -1*amount);
    await chuyenDoHacDiem(name, amount, accountId)
  } else {
    // Nạp rương
    await updateRuong(accountId, name, amount);
  }

  await updateRuong(accountId, 'bạc', -1 * amount * price);
  await setAmount(name, hacDiemAmount - amount);
  await chat('Xong!'); ``
}

// Member bán vật phẩm
export async function sellItem(accountId, itemName, amount) {
  const name = cap(viettat(itemName), false);
  const key = "ruong_do_ao_" + accountId + "_" + snake_case(name);
  const hacDiemAmount = await getAmount(itemName);
  const price = await getPrice(itemName);

  // Chưa set giá hoặc số lượng vật phẩm
  if (!hacDiemAmount || !price) {
    // Hắc điếm không mua vật phẩm
    return;
  }

  if (amount > hacDiemAmount) {
    // Hắc điếm chỉ thu mua hacDiemAmount cái
    return;
  }

  const redisItem = await getItem(key);
  if (!redisItem) {
    // Rương không có vật phẩm
    return;
  }

  const ruongItem = JSON.parse(redisItem);
  const itemAmount = parseInt(`${Object.values(ruongItem)[0]}`);
  if (itemAmount < amount) {
    // Không đủ vật phẩm để bán
    return;
  }

  await updateRuong(accountId, name, -1 * amount);
  await updateRuong(accountId, 'bạc', amount * price);
  await setAmount(name, hacDiemAmount - amount);
  await chat('Done! /bee131 ');
}

export async function listBuy(cboxId) {
  const list = ['Gian thương Tiểu Sâm đang thu các món sao đây /xga :'];
  for (let i = 0; i < BUY_ITEMS.length; i++) {
    const vietTat = snake_case(BUY_ITEMS[i]);
    const amount = await getAmount(BUY_ITEMS[i]);
    const price = await getPrice(BUY_ITEMS[i]);
    if (!amount || !price) {
      continue;
    }

    list.push(`✦ [b]${BUY_ITEMS[i]}[/b] [color=grey](${amount})[/color]: [b]${price}[/b] bạc`);
  }
  list.push(`[b][color=Red]Sử dụng lệnh .ban [số lượng] [tên vật phẩm] để BÁN.[br] Ví dụ: .ban 1 lthp [/color][/b]`);

  const message = list.join('[br]');
  await pmCbox(cboxId, message);
}

export async function listSell(accountId) {
  const list = ['Hắc điếm đang bán:'];
  for (let i = 0; i < SELL_ITEMS.length; i++) {
    const item = SELL_ITEMS[i];
    const amount = await getAmount(item.name);
    const price = await getPrice(item.name)
    if (!amount || !price) {
      continue;
    }

    list.push(`✦ [b]${item.name}[/b] [color=grey](còn ${amount})[/color]: [b]${price}[/b] bạc`);
  }

  const message = list.join('[br]');
  await pmCbox(accountId, message);
}
