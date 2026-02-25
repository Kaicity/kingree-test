# Giới Thiệu Chung

Đây là một ứng dụng mô phỏng hệ thống Matching & Scheduling với các chức năng sau:

# Chức năng chính

Ứng dụng mô phỏng hệ thống **Matching & Scheduling** với các chức năng:

- Tạo profile người dùng mới  
- Giả lập đăng nhập đơn giản bằng email  
- Cho phép người dùng **Like** nhau  
- Khi cả hai cùng **Like** → tạo **Match**  
- Người dùng có thể chọn **thời gian rảnh (Availability)**  
- Hệ thống tự động tìm **slot trùng nhau đầu tiên**  
- Nếu tìm được → hiển thị thời gian **lịch hẹn**  

---

# Luồng nghiệp vụ (Business Flow)

### Bước 1: Tạo Profile
- Người dùng tạo profile gồm:
  - Tên  
  - Tuổi  
  - Giới tính  
  - Bio  
  - Email  
- Profile được lưu lại trong hệ thống.

---

### Bước 2: Đăng nhập
- Người dùng đăng nhập bằng email (giả lập, không có password).
- Sau khi đăng nhập, hệ thống xác định user hiện tại.

---

### Bước 3: Like người dùng khác
- Người dùng xem danh sách user khác.
- Khi bấm **Like**:
  - Hệ thống lưu trạng thái Like.

---

### Bước 4: Tạo Match
- Khi:
  - User A Like User B  
  - User B cũng Like lại User A  
→ Hệ thống tạo **Match** giữa hai user.

---

### Bước 5: Chọn Availability
- Sau khi Match, mỗi user có thể:
  - Chọn các khoảng thời gian rảnh (startTime – endTime).
- Availability được lưu riêng theo từng Match.

---

### Bước 6: Tìm slot trùng nhau
- Hệ thống lấy:
  - Danh sách Availability của User A dành cho User B  
  - Danh sách Availability của User B dành cho User A  
- Hai danh sách được sắp xếp theo thời gian bắt đầu tăng dần.
- So sánh từng slot để tìm **khoảng thời gian trùng nhau đầu tiên**.

---

### Bước 7: Hiển thị kết quả slot trùng nhau đầu tiên
- Nếu tìm được slot trùng: 
  - Hiển thị lịch hẹn cho cả hai người dùng.
- Nếu không tìm được:
  - Thông báo chưa có thời gian phù hợp.
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

👉 **MongoDB (Database)**
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

- Frontend xử lý điều kiện đối với user:
  - Yêu cầu đăng nhập hoặc tạo profile user trước khi thực hiện thao tác like và match với user khác
  - Không cho phép user like chính mình
  - Nếu ấn like đến user khác thì lưu lại kết quả `liked` để nhận biết bạn đang like user nào
  - So sánh user hiện tại có các matchs xem có tồn tại user được like, nếu có -> hiển thị trạng thái `It's a Match` theo yêu cầu và đồng thời cho phép cả 2 user đến màn hình chọn thời gian rảnh
     
- Backend kiểm tra dữ liệu đầu vào:
  - Đảm bảo cả user hiện tại và user target đều tồn tại  
  - Nếu user chưa từng like target trước đó, hệ thống sẽ thêm `targetUserId` vào mảng `likes` của user hiện tại.
  - Sau đó, hệ thống kiểm tra điều kiện match bằng cách:
  - Kiểm tra xem `target.likes` có chứa `userId` hay không  
  - Nếu điều kiện này đúng (hai bên đã like nhau), hệ thống tạo match bằng cách:
  - Thêm `targetUserId` vào mảng `matches` của user hiện tại  
  - Thêm `userId` vào mảng `matches` của user target  


# 4. Logic tìm slot trùng nhau giữa hai người

Để tìm khoảng thời gian hẹn gặp chung giữa hai user đã match, hệ thống thực hiện quy trình sau:

- Backend xử lý điều kiện đối với user:
  - Trước hết, hệ thống lấy danh sách availability của 2 user khi đã tạo lịch rảnh:
   - Tìm các lịch rảnh của user hiện tại và user đối diện
   - Thực hiện thuật toán overlap tìm khoảng thời gian có trong 2 user:
     + Lấy Max mốc thời gian bắt đầu của userA và userB
     + Lấy Min mốc thời gian kết thúc của userA và userB
     + so sánh nếu: thời gian bắt đầu < thời gian kết thúc => có lịch hẹn trong khoảng thời gian này, ngược lại không có lịch hẹn

  - Hai danh sách này được sắp xếp theo `startTime` tăng dần để thuận tiện cho việc so sánh và trả ra kết quả cho từng trường hợp sau:

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

- Frontend xử lý điều kiện đối với user:
  - Khi availability được chọn bởi 2 user gọi đến thuật toán tìm lịch trống từ backend sau đó nhận kết quả theo từng trạng thái và hiển thị lên màn hình

# 5. Nếu có thêm thời gian, tôi sẽ cải thiện gì

Nếu có thêm thời gian phát triển, tôi sẽ bổ sung các tính năng nhằm tăng trải nghiệm người dùng và hoàn thiện nghiệp vụ hệ thống, đặc biệt là cơ chế thông báo real-time khi match hoặc khi tìm được slot trùng, cũng như tối ưu thuật toán tìm lịch hẹn chung để trả về nhiều lựa chọn hơn thay vì chỉ một slot duy nhất.


# 6. 1–3 tính năng đề xuất thêm cho sản phẩm

### 1. Chat sau khi match  
Cho phép hai user nhắn tin trực tiếp sau khi match. Tính năng này giúp tăng tương tác, tạo kết nối trước khi gặp mặt và nâng cao khả năng giữ chân người dùng.

### 2. Lịch hẹn giữa các người dùng  
Cho phép người dùng xem lịch hẹn đã tạo và cập nhật thời gian nằm trong phạm vi cho phép hoặc có thể hủy lịch hẹn.

### 3. Gợi ý lịch hẹn yêu thích  
Thay vì phải chọn lịch hẹn, nếu người dùng thường dùng lịch hẹn trong khoảng thời gian cố định từ 3-5 lần hệ thống sẽ ghi nhớ và gợi ý chọn nhanh lịch hẹn của bạn.
