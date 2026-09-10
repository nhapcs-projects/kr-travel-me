/* =====================================================================
   Service worker — để trang dùng được khi mất mạng.

   Ba nhóm khác nhau, ba cách xử lý khác nhau:

   1. Bản thân trang (index.html)
      Mạng trước, hỏng thì lấy bản đã lưu. Nhờ vậy sửa lịch xong push lên
      là lần mở sau thấy ngay, mà mất mạng vẫn còn bản cũ để đọc.

   2. Thư viện và font (cdnjs, Google Fonts)
      Bản đã lưu trước. Chúng có gắn số phiên bản trong địa chỉ nên không
      đổi; lấy từ máy vừa nhanh vừa chạy được offline.

   3. Ô bản đồ (OpenFreeMap, CARTO)
      Lưu dần trong lúc dùng, giới hạn số lượng. Vùng nào đã xem rồi thì
      lần sau mất mạng vẫn hiện. Không tải trước cả Hàn Quốc — quá nặng.
   ===================================================================== */

const V         = 'kr-travel-v1';
const SHELL     = V + '-shell';   // trang
const ASSET     = V + '-asset';   // thư viện, font
const TILE      = V + '-tile';    // ô bản đồ
const TILE_MAX  = 400;            // đủ cho Seoul + Busan ở mức zoom hay dùng

const SHELL_URLS = ['./', './index.html'];

const isAsset = u =>
  /cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u);
const isTile = u =>
  /tiles\.openfreemap\.org|basemaps\.cartocdn\.com/.test(u);

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())   // hỏng một file cũng không chặn cài đặt
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => !k.startsWith(V)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* giữ số ô bản đồ trong giới hạn, xoá bớt cái cũ nhất */
async function trimTiles(){
  const c = await caches.open(TILE);
  const keys = await c.keys();
  if (keys.length <= TILE_MAX) return;
  await Promise.all(keys.slice(0, keys.length - TILE_MAX).map(k => c.delete(k)));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  // --- 3. ô bản đồ: lấy từ máy trước, không có thì tải rồi lưu lại
  if (isTile(url)){
    e.respondWith(
      caches.open(TILE).then(c =>
        c.match(req).then(hit => hit || fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')){ c.put(req, res.clone()); trimTiles(); }
          return res;
        }).catch(() => hit))
      )
    );
    return;
  }

  // --- 2. thư viện và font: lấy từ máy trước
  if (isAsset(url)){
    e.respondWith(
      caches.open(ASSET).then(c =>
        c.match(req).then(hit => hit || fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
          return res;
        }))
      )
    );
    return;
  }

  // --- 1. trang: mạng trước, hỏng thì dùng bản đã lưu
  if (req.mode === 'navigate' || /\/$|\.html$/.test(new URL(url).pathname)){
    e.respondWith(
      fetch(req)
        .then(res => {
          caches.open(SHELL).then(c => c.put('./index.html', res.clone()));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
  }
});
