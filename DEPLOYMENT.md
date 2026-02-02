# Hướng Dẫn Triển Khai & Phát Triển

## Phần 0: Chạy thử ở Local (Development)
Trong quá trình code và sửa lỗi, bạn **KHÔNG** cần dùng Docker. Hãy chạy như bình thường để code cập nhật nhanh nhất:

1.  **Backend**:
    ```bash
    cd backend
    npm run start:dev
    # Server chạy tại: http://localhost:4000
    ```

2.  **Frontend**:
    ```bash
    cd web-admin
    npm run dev
    # Web chạy tại: http://localhost:3000
    ```

3.  **Database**:
    Bạn vẫn có thể dùng Docker để chỉ chạy riêng Database (cho sạch máy):
    ```bash
    docker compose up -d db pgadmin
    ```

---

## Phần 1: Chuẩn Bị VPS (Môi trường Release)

1.  **Thuê VPS**: Chọn nhà cung cấp (DigitalOcean, Vultr, CMC Cloud, Viettel IDC, v.v.).
    -   OS: **Ubuntu 22.04 LTS** hoặc **24.04 LTS**.
    -   RAM: Tối thiểu **2GB** (Khuyên dùng 4GB cho ổn định).
2.  **SSH vào VPS**:
    Mở CMD hoặc Terminal trên máy tính cá nhân và gõ:
    ```bash
    ssh root@<IP_CUA_VPS>
    # Nhập mật khẩu khi được hỏi
    ```

## Phần 2: Cài Đặt Môi Trường (Trên VPS)

Copy và chạy từng lệnh sau để cài Docker:

```bash
# 1. Cập nhật hệ thống
apt update && apt upgrade -y

# 2. Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Kiểm tra cài đặt thành công
docker --version
docker compose version
```

## Phần 3: Đưa Code Lên VPS

Cách đơn giản nhất là dùng Git.

1.  **Đẩy code từ máy cá nhân lên GitHub/GitLab** (Nếu chưa làm).

2.  **Clone về VPS**:

    ```bash
    # Tại thư mục /root hoặc /home/ubuntu
    git clone <LINK_GITHUB_CUA_BAN> quan-ly-nha-tro

    # Di chuyển vào thư mục dự án
    cd quan-ly-nha-tro
    ```

## Phần 4: Cấu Hình & Chạy

1.  **Tạo file .env**:
    Bạn cần cấu hình địa chỉ IP của VPS để Frontend có thể gọi được Backend.

    ```bash
    nano .env
    ```

    Dán nội dung sau vào (Thay `1.2.3.4` bằng IP thật của VPS):

    ```env
    # Cấu hình API URL cho Frontend
    NEXT_PUBLIC_API_URL=http://<IP_CUA_VPS>:4000

    # Các cấu hình khác (Nếu có)
    # JWT_SECRET=...
    ```

    Bấm `Ctrl+O` -> `Enter` để lưu, và `Ctrl+X` để thoát.

2.  **Chạy Docker Compose**:

    ```bash
    docker compose up -d --build
    ```

    *Lưu ý: Quá trình build lần đầu có thể mất 5-10 phút tùy tốc độ mạng của VPS.*

3.  **Setup Database**:

    ```bash
    # Chạy migration
    docker compose exec server npx prisma migrate deploy

    # Đổ dữ liệu mẫu
    docker compose exec server npx prisma db seed
    ```

## Phần 5: Hoàn Tất

Truy cập trình duyệt:
- **Web Admin**: `http://<IP_CUA_VPS>:3000`
- **Backend**: `http://<IP_CUA_VPS>:4000/api`

## Lệnh Thường Dùng

- Xem logs toàn bộ hệ thống: `docker compose logs -f`
- Xem logs backend: `docker compose logs -f server`
- Khởi động lại: `docker compose restart`
- Tắt hệ thống: `docker compose down`
- Cập nhật code mới:
    ```bash
    git pull
    docker compose up -d --build
    ```
