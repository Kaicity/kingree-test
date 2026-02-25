# Giới Thiệu Chung

Dự án này là một ứng dụng mô phỏng hệ thống Matching & Scheduling, nơi hai người dùng có thể:

- Like nhau
- Khi cả hai cùng Like → tạo Match
- Chọn thời gian rảnh (Availability)
- Hệ thống tự động tìm **slot trùng nhau đầu tiên**
- Nếu tìm được → hiển thị lịch hẹn

---

# 1. Tổ chức hệ thống (Architecture)

Hệ thống được tổ chức theo mô hình **Client–Server Architecture**, tách biệt rõ ràng giữa Frontend và Backend để đảm bảo dễ mở rộng và bảo trì.

## 🔹 Frontend (Next.js)

- React + Next.js (App Router)
- HeroUI (UI Components)
- React Hook Form + Zod (Form validation)
- Zustand (State Management)

Frontend chịu trách nhiệm:
- Hiển thị danh sách profile người dùng
- Thực hiện Like
- Nhập Availability
- Render trạng thái match (waiting / no_overlap / scheduled)

---

## 🔹 Backend (Node.js + Express)

Backend được tổ chức theo hướng clean structure:


### Phân tách trách nhiệm:

- **Controllers** → nhận request và trả response
- **Services** → xử lý business logic (match, overlap, schedule)
- **Models** → định nghĩa MongoDB schema
- **Utils** → chứa thuật toán tìm slot trùng

---

# 2. Lưu trữ dữ liệu (Data Storage)

Dữ liệu được lưu bằng:

👉 **MongoDB (Database thực tế)**
---

## 🟢 Users Collection

```js
{
  _id,
  email,
  gender,
  age,
  bio,
  likes: [userId],
  matches: [userId]
}
```
## 🟢 Availability Collection

```js
{
  userId,
  matchUserId,
  startTime,
  endTime
}
```

# 3. Logic match

Hệ thống match hoạt động dựa trên nguyên tắc **mutual like (like hai chiều)**, nghĩa là chỉ khi cả hai user đều like nhau thì mới được coi là match.

Quy trình xử lý khi một user thực hiện hành động like như sau:

- Backend kiểm tra dữ liệu đầu vào:
  - Không cho phép user like chính mình  
  - Đảm bảo cả user hiện tại và user target đều tồn tại  

- Nếu user chưa từng like target trước đó, hệ thống sẽ thêm `targetUserId` vào mảng `likes` của user hiện tại.

- Sau đó, hệ thống kiểm tra điều kiện match bằng cách:
  - Kiểm tra xem `target.likes` có chứa `userId` hay không  

- Nếu điều kiện này đúng (hai bên đã like nhau), hệ thống tạo match bằng cách:
  - Thêm `targetUserId` vào mảng `matches` của user hiện tại  
  - Thêm `userId` vào mảng `matches` của user target  


# 4. Logic tìm slot trùng nhau giữa hai người

Để tìm khoảng thời gian hẹn gặp chung giữa hai user đã match, hệ thống thực hiện quy trình sau:

- Trước hết, hệ thống lấy danh sách availability của:
  - User hiện tại dành cho user target  
  - User target dành cho user hiện tại  

- Hai danh sách này được sắp xếp theo `startTime` tăng dần để thuận tiện cho việc so sánh.

- Nếu một trong hai danh sách rỗng, hệ thống trả về:
  ```json
  { "status": "waiting" }
  ```
- Nếu một trong hai danh sách không tìm thấy lịch trống, hệ thống trả về:
  ```json
  { "status": "no_overlap" }
  ```

- Nếu một trong hai danh sách có lịch gần nhất, hệ thống trả về:
  ```json
  { "status": "scheduled" }
  ```

# 5. Nếu có thêm thời gian, tôi sẽ cải thiện gì

Nếu có thêm thời gian phát triển, tôi sẽ bổ sung các tính năng nhằm tăng trải nghiệm người dùng và hoàn thiện nghiệp vụ hệ thống, đặc biệt là cơ chế thông báo real-time khi match hoặc khi tìm được slot trùng, cũng như tối ưu thuật toán tìm lịch hẹn chung để trả về nhiều lựa chọn hơn thay vì chỉ một slot duy nhất.


# 6. 1–3 tính năng đề xuất thêm cho sản phẩm

### 1. Chat sau khi match  
Cho phép hai user nhắn tin trực tiếp sau khi match. Tính năng này giúp tăng tương tác, tạo kết nối trước khi gặp mặt và nâng cao khả năng giữ chân người dùng.

### 2. Gợi ý nhiều khung giờ hẹn  
Hệ thống trả về danh sách các khoảng thời gian trùng nhau thay vì chỉ slot đầu tiên. Điều này giúp người dùng linh hoạt lựa chọn lịch phù hợp nhất.

### 3. Cập nhật và hủy lịch hẹn  
Cho phép người dùng chỉnh sửa hoặc hủy lịch hẹn đã tạo. Tính năng này phản ánh đúng nhu cầu thực tế vì lịch cá nhân có thể thay đổi, giúp hệ thống linh hoạt và thực tế hơn.
