# kr-travel-me

Lịch trình Seoul / Busan 3–10/10/2026. Một file `index.html` tĩnh, mở thẳng bằng
trình duyệt hoặc host trên GitHub Pages, không cần build, không cần cài gì.

## Muốn sửa lịch thì sửa ở đâu

Toàn bộ chuyến đi nằm trong **một hằng số `TRIP`** ở khối `<script>` đầu tiên của
`index.html`. Lịch từng ngày, bản đồ, bảng chi phí, tổng tiền, quãng đường và các
link Naver/Kakao đều được dựng ra từ đó, nên **sửa một chỗ là cả trang đổi theo** —
không còn phải sửa lặp ở nhiều nơi rồi tự cộng lại tổng bằng tay.

Một điểm dừng:

```js
{ t:'14:30', name:'Làng Huinnyeoul',
  desc:'Mô tả hiện dưới tên trong lịch.',
  lat:35.0782798, lng:129.0453198,   // có toạ độ thì hiện trên bản đồ + tính km
  q:'Huinnyeoul Culture Village',    // từ khoá cho nút Naver / Kakao
  read:'làng Huinnyeoul Busan kinh nghiệm',  // từ khoá cho nút "Bài viết"
  tip:'Câu ngắn hiện trong bong bóng trên bản đồ.',
  links:[{t:'Trang chính thức', u:'https://...'}] }
```

Bỏ `lat`/`lng` thì việc đó vẫn nằm trong lịch nhưng không lên bản đồ — dùng cho
những mục như "ăn trưa", "nhận phòng".

Một khoản chi: `{ label:'Ăn uống', krw:[90000,120000] }` — `krw` nhận một số hoặc
khoảng `[thấp, cao]`; dùng `vnd` nếu khoản đó trả bằng tiền Việt (trang tự quy ra
₩ theo tỷ giá); dùng `text` nếu không quy ra số được.

Sửa xong, mở lại trang và xem mục **Kiểm tra lịch** ở cuối: nó tự dò giờ đi lùi,
giờ trùng nhau, và những chặng mà thời gian chừa ra ít hơn thời gian di chuyển
ước lượng.

## Vài điều cần biết

- Quãng đường là đường chim bay nhân 1,3, thời gian là ước lượng thô. Cần chỉ
  đường thật thì bấm nút **Naver** hoặc **Kakao** ở từng điểm — Google Maps không
  có chỉ đường đi bộ và ô tô trong nước Hàn.
- Ghi chú, đánh dấu việc đã làm và số tiền thực chi lưu trong trình duyệt
  (`localStorage`), không gửi đi đâu.
- Trang công khai với bất kỳ ai có link, đừng ghi thông tin nhạy cảm vào ô ghi chú.
