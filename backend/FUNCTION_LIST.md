# DANH SÁCH FUNCTIONS - SMART RENTAL BACKEND

## 1. AUTH MODULE

### CODE: AUTH-101
**FUNCTION:** LOGIN
**DESCRIPTION:**
1. Input Email/Password từ client
2. Validation Email/Password format
3. Check User tồn tại trong database
4. Check User isActive = true
5. Compare Password hash với bcrypt
6. Generate JWT Access Token (15 min expiry)
7. Generate Refresh Token (7 days expiry)
8. Hash và lưu Refresh Token vào database
9. Trả về Access Token + Refresh Token
10. Frontend lưu tokens vào Local Storage

**MODEL:** User
**TABLE NAME:** users
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: AUTH-102
**FUNCTION:** REGISTER
**DESCRIPTION:**
1. Input Email/Password/Name từ client
2. Validation Email format, Password strength
3. Check Email đã tồn tại chưa (unique constraint)
4. Hash Password với bcrypt (10 rounds)
5. Create User mới với role = ADMIN/TENANT
6. Generate JWT Access Token
7. Generate Refresh Token
8. Hash và lưu Refresh Token vào database
9. Trả về Access Token + Refresh Token + User info

**MODEL:** User
**TABLE NAME:** users
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: AUTH-103
**FUNCTION:** REFRESH-TOKEN
**DESCRIPTION:**
1. Lấy Refresh Token từ request body
2. Check User ID từ token payload
3. Get User từ database
4. Compare Refresh Token hash với token trong database
5. Check Token chưa expire
6. Generate JWT Access Token mới
7. Generate Refresh Token mới
8. Update Refresh Token hash trong database
9. Trả về Access Token + Refresh Token mới

**MODEL:** User
**TABLE NAME:** users
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: AUTH-104
**FUNCTION:** FORGOT-PASSWORD
**DESCRIPTION:**
1. Input Email từ client
2. Validation Email format
3. Check User tồn tại
4. Generate random Reset Token (40 ký tự)
5. Set Reset Token Expiry = current time + 1 hour
6. Lưu resetToken + resetTokenExp vào database
7. Send Email với link reset password (chứa token)
8. Trả về success message

**MODEL:** User
**TABLE NAME:** users
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: AUTH-105
**FUNCTION:** RESET-PASSWORD
**DESCRIPTION:**
1. Input Reset Token + New Password từ client
2. Find User by resetToken trong database
3. Check resetTokenExp > current time (chưa hết hạn)
4. Validation New Password strength
5. Hash New Password với bcrypt
6. Update User password
7. Clear resetToken và resetTokenExp (set null)
8. Trả về success message

**MODEL:** User
**TABLE NAME:** users
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: AUTH-106
**FUNCTION:** LOGOUT
**DESCRIPTION:**
1. Lấy User ID từ JWT token
2. Find User trong database
3. Set refreshToken = null
4. Frontend xóa tokens khỏi Local Storage
5. Trả về success message

**MODEL:** User
**TABLE NAME:** users
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 2. BUILDINGS MODULE

### CODE: BLD-201
**FUNCTION:** CREATE-BUILDING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã (chứa ID, Role)
2. Check Role = ADMIN
3. Input name, address từ client
4. Validation name không trống, address hợp lệ
5. CREATE Building mới
6. Trả về Building info

**MODEL:** Building
**TABLE NAME:** buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: BLD-202
**FUNCTION:** GET-ALL-BUILDINGS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Query all Buildings từ database
4. Với mỗi Building:
   - Count total rooms
   - Count rooms by status (AVAILABLE, RENTED, MAINTENANCE)
   - Sum revenue từ rented rooms
5. Aggregate statistics
6. Trả về danh sách Buildings với stats

**MODEL:** Building, Room
**TABLE NAME:** buildings, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: BLD-203
**FUNCTION:** GET-BUILDING-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Building ID từ params
4. Check Building tồn tại
5. Query Building với include rooms
6. Calculate room statistics
7. Trả về Building detail + rooms list

**MODEL:** Building, Room
**TABLE NAME:** buildings, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: BLD-204
**FUNCTION:** UPDATE-BUILDING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Building ID + update data (name, address)
4. Check Building tồn tại
5. Validation update data
6. UPDATE Building
7. Trả về updated Building

**MODEL:** Building
**TABLE NAME:** buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: BLD-205
**FUNCTION:** DELETE-BUILDING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Building ID
4. Check Building tồn tại
5. Check Building KHÔNG có rooms (cascade protection)
6. DELETE Building
7. Trả về success message

**MODEL:** Building
**TABLE NAME:** buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 3. ROOMS MODULE

### CODE: ROOM-301
**FUNCTION:** CREATE-ROOM
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input name, floor, area, price, depositPrice, maxTenants, buildingId, gender, assets
4. Validation all fields
5. Check Building tồn tại
6. Set status = AVAILABLE (default)
7. Parse assets JSON (danh sách nội thất)
8. CREATE Room
9. Trả về Room info

**MODEL:** Room, Building
**TABLE NAME:** rooms, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-302
**FUNCTION:** GET-ALL-ROOMS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Query all Rooms với include Building
4. Trả về danh sách Rooms

**MODEL:** Room, Building
**TABLE NAME:** rooms, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-303
**FUNCTION:** GET-ROOMS-BY-BUILDING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Building ID từ params
4. Check Building tồn tại
5. Query Rooms where buildingId = input
6. Trả về danh sách Rooms

**MODEL:** Room, Building
**TABLE NAME:** rooms, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-304
**FUNCTION:** GET-ROOM-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Room ID
4. Check Room tồn tại
5. Query Room với include:
   - Building
   - Active Contract (isActive = true)
   - Contract include Tenant info
6. Trả về Room detail + active contract

**MODEL:** Room, Building, Contract, Tenant
**TABLE NAME:** rooms, buildings, contracts, tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-305
**FUNCTION:** UPDATE-ROOM
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Room ID + update data
4. Check Room tồn tại
5. Validation update data
6. Parse assets JSON nếu có update
7. UPDATE Room
8. Trả về updated Room

**MODEL:** Room
**TABLE NAME:** rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-306
**FUNCTION:** UPDATE-ROOM-STATUS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Room ID + new status (AVAILABLE/RENTED/MAINTENANCE)
4. Check Room tồn tại
5. Validation status value
6. UPDATE Room status
7. Trả về updated Room

**MODEL:** Room
**TABLE NAME:** rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-307
**FUNCTION:** DELETE-ROOM
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Room ID
4. Check Room tồn tại
5. Check Room KHÔNG có active contract (cascade protection)
6. DELETE Room
7. Trả về success message

**MODEL:** Room
**TABLE NAME:** rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-308
**FUNCTION:** BULK-UPDATE-PRICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input array of {roomId, newPrice}
4. Validation tất cả roomIds tồn tại
5. Sử dụng For Loop để UPDATE từng Room price
6. Aggregate results
7. Trả về số lượng rooms updated

**MODEL:** Room
**TABLE NAME:** rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-309
**FUNCTION:** BULK-CREATE-ISSUES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input array of roomIds + issue title + description
4. Validation tất cả roomIds tồn tại
5. Sử dụng For Loop để CREATE Issue cho từng Room
6. Set status = OPEN (default)
7. Trả về số lượng issues created

**MODEL:** Room, Issue
**TABLE NAME:** rooms, issues
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ROOM-310
**FUNCTION:** GET-ROOM-STATS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Building ID
4. Query Rooms where buildingId = input
5. Aggregate statistics:
   - Total rooms
   - Available rooms (status = AVAILABLE)
   - Rented rooms (status = RENTED)
   - Maintenance rooms (status = MAINTENANCE)
   - Occupancy rate (%)
   - Total revenue
6. Trả về statistics object

**MODEL:** Room
**TABLE NAME:** rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 4. TENANTS MODULE

### CODE: TNT-401
**FUNCTION:** CREATE-TENANT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input fullName, phone, cccd, info (JSON)
4. Validation phone unique
5. Parse info JSON (address, ID photos URLs)
6. CREATE Tenant
7. Trả về Tenant info

**MODEL:** Tenant
**TABLE NAME:** tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TNT-402
**FUNCTION:** GET-ALL-TENANTS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Query all Tenants
4. Include contract count
5. Trả về danh sách Tenants

**MODEL:** Tenant
**TABLE NAME:** tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TNT-403
**FUNCTION:** GET-TENANT-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Tenant ID
4. Check Tenant tồn tại
5. Query Tenant với include:
   - All Contracts (active + inactive)
   - Contracts include Room info
6. Trả về Tenant detail + contract history

**MODEL:** Tenant, Contract, Room
**TABLE NAME:** tenants, contracts, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TNT-404
**FUNCTION:** UPDATE-TENANT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Tenant ID + update data
4. Check Tenant tồn tại
5. Validation update data
6. Check phone unique nếu update phone
7. Parse info JSON nếu có update
8. UPDATE Tenant
9. Trả về updated Tenant

**MODEL:** Tenant
**TABLE NAME:** tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TNT-405
**FUNCTION:** DELETE-TENANT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Tenant ID
4. Check Tenant tồn tại
5. Check Tenant KHÔNG có active contract
6. DELETE Tenant
7. Trả về success message

**MODEL:** Tenant
**TABLE NAME:** tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 5. CONTRACTS MODULE

### CODE: CTR-501
**FUNCTION:** CREATE-CONTRACT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input tenantId, roomId, startDate, endDate, deposit, price, paymentDay, numTenants, initialIndexes
4. Check Tenant tồn tại
5. Check Room tồn tại và status = AVAILABLE
6. Validation dates (endDate > startDate)
7. Parse initialIndexes JSON (chỉ số điện nước đầu kỳ)
8. BEGIN TRANSACTION:
   - CREATE Contract với isActive = true
   - UPDATE Room status = RENTED
   - CREATE initial ServiceReadings cho INDEX services
9. COMMIT TRANSACTION
10. Trả về Contract info

**MODEL:** Contract, Tenant, Room, ServiceReading
**TABLE NAME:** contracts, tenants, rooms, service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-502
**FUNCTION:** GET-ALL-CONTRACTS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input filter: isActive (true/false/all)
4. Query Contracts với filter
5. Include Tenant, Room, Building info
6. Trả về danh sách Contracts

**MODEL:** Contract, Tenant, Room, Building
**TABLE NAME:** contracts, tenants, rooms, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-503
**FUNCTION:** GET-CONTRACT-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Contract ID
4. Check Contract tồn tại
5. Query Contract với include:
   - Tenant info
   - Room info (+ Building)
   - Invoices list
   - Transactions list
6. Trả về Contract detail

**MODEL:** Contract, Tenant, Room, Building, Invoice, Transaction
**TABLE NAME:** contracts, tenants, rooms, buildings, invoices, transactions
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-504
**FUNCTION:** UPDATE-CONTRACT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Contract ID + update data (endDate, deposit, price, paymentDay, numTenants)
4. Check Contract tồn tại
5. Validation update data
6. UPDATE Contract
7. Trả về updated Contract

**MODEL:** Contract
**TABLE NAME:** contracts
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-505
**FUNCTION:** TERMINATE-CONTRACT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Contract ID + newRoomStatus (AVAILABLE/MAINTENANCE)
4. Check Contract tồn tại và isActive = true
5. BEGIN TRANSACTION:
   - UPDATE Contract: set isActive = false, set endDate = current date
   - UPDATE Room: set status = newRoomStatus
6. COMMIT TRANSACTION
7. Trả về success message

**MODEL:** Contract, Room
**TABLE NAME:** contracts, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-506
**FUNCTION:** MOVE-CONTRACT (COMPLEX)
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input contractId, newRoomId, moveDate, settlementOption (IMMEDIATE/DEFER), oldRoomStatus
4. Check Contract tồn tại và isActive = true
5. Check New Room tồn tại và status = AVAILABLE
6. Get latest ServiceReadings cho old room
7. Calculate pro-rata rent (tiền thuê theo ngày ở room cũ)
8. Calculate utility settlement (điện nước từ số cuối)
9. Calculate deposit adjustment (chênh lệch cọc old vs new room)
10. BEGIN TRANSACTION:
    - CREATE closing ServiceReadings cho old room
    - IF settlementOption = IMMEDIATE: CREATE settlement Invoice
    - CREATE Transaction cho deposit adjustment
    - UPDATE Contract: roomId = newRoomId, price = newRoomPrice, deposit = newDeposit
    - CREATE opening ServiceReadings cho new room (từ initialIndexes mới)
    - UPDATE Old Room: status = oldRoomStatus
    - UPDATE New Room: status = RENTED
11. COMMIT TRANSACTION
12. Trả về Contract updated + Invoice created

**MODEL:** Contract, Room, ServiceReading, Invoice, Transaction
**TABLE NAME:** contracts, rooms, service_readings, invoices, transactions
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-507
**FUNCTION:** DELETE-CONTRACT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Contract ID
4. Check Contract tồn tại
5. Check Contract KHÔNG có Invoices (cascade protection)
6. DELETE Contract
7. Trả về success message

**MODEL:** Contract
**TABLE NAME:** contracts
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: CTR-508
**FUNCTION:** GET-CONTRACT-STATS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Query all Contracts
4. Aggregate statistics:
   - Total contracts
   - Active contracts (isActive = true)
   - Inactive contracts
   - Total deposit collected
   - Average contract duration
5. Trả về statistics object

**MODEL:** Contract
**TABLE NAME:** contracts
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 6. SERVICES MODULE

### CODE: SVC-601
**FUNCTION:** CREATE-SERVICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input name, price, unit, type (INDEX/FIXED), calculationType (PER_ROOM/PER_PERSON/PER_USAGE)
4. Validation all fields
5. Set isActive = true (default)
6. CREATE Service
7. Trả về Service info

**MODEL:** Service
**TABLE NAME:** services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: SVC-602
**FUNCTION:** GET-ALL-SERVICES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Query all Services where isActive = true
4. Trả về danh sách Services

**MODEL:** Service
**TABLE NAME:** services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: SVC-603
**FUNCTION:** GET-SERVICES-BY-TYPE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input type (INDEX/FIXED)
4. Query Services where type = input AND isActive = true
5. Trả về danh sách Services

**MODEL:** Service
**TABLE NAME:** services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: SVC-604
**FUNCTION:** UPDATE-SERVICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Service ID + update data
4. Check Service tồn tại
5. Validation update data
6. UPDATE Service
7. Trả về updated Service

**MODEL:** Service
**TABLE NAME:** services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: SVC-605
**FUNCTION:** DELETE-SERVICE (SOFT DELETE)
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Service ID
4. Check Service tồn tại
5. UPDATE Service: set isActive = false (soft delete)
6. Trả về success message

**MODEL:** Service
**TABLE NAME:** services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: SVC-606
**FUNCTION:** SEED-DEFAULT-SERVICES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Define default services array:
   - Điện (INDEX, PER_USAGE)
   - Nước (INDEX, PER_USAGE)
   - Wifi (FIXED, PER_ROOM)
   - Rác (FIXED, PER_ROOM)
   - Gửi xe (FIXED, PER_ROOM)
4. For each default service:
   - Check tên service chưa tồn tại
   - CREATE Service
5. Trả về số lượng services created

**MODEL:** Service
**TABLE NAME:** services
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 7. READINGS MODULE

### CODE: RDG-701
**FUNCTION:** PREPARE-SINGLE-READING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input contractId, serviceId, month (MM-YYYY)
4. Check Contract tồn tại
5. Check Service tồn tại
6. Query previous reading (tháng trước cùng contract + service)
7. IF found: lấy newIndex làm oldIndex
8. ELSE: lấy từ Contract.initialIndexes
9. Get Service.price làm unitPrice
10. Trả về {oldIndex, unitPrice, serviceInfo}

**MODEL:** Contract, Service, ServiceReading
**TABLE NAME:** contracts, services, service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-702
**FUNCTION:** CREATE-SINGLE-READING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input contractId, serviceId, month, newIndex, readingDate, isMeterReset, note
4. Get oldIndex từ PREPARE-SINGLE-READING
5. Validation newIndex >= oldIndex (trừ khi isMeterReset = true)
6. Calculate usage = newIndex - oldIndex
7. Get unitPrice từ Service
8. Calculate totalCost = usage × unitPrice
9. Check unique constraint (contractId + serviceId + month)
10. CREATE ServiceReading với isBilled = false
11. Trả về Reading info

**MODEL:** ServiceReading, Contract, Service
**TABLE NAME:** service_readings, contracts, services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-703
**FUNCTION:** PREPARE-BULK-READING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input buildingId, month, serviceId
4. Check Building tồn tại
5. Check Service tồn tại
6. Query all active Contracts trong Building
7. For each Contract:
   - Get Room info
   - Get oldIndex từ tháng trước hoặc initialIndexes
   - Prepare row data {contractId, roomName, tenantName, oldIndex}
8. Trả về array of rows (dạng spreadsheet)

**MODEL:** Building, Room, Contract, Tenant, ServiceReading, Service
**TABLE NAME:** buildings, rooms, contracts, tenants, service_readings, services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-704
**FUNCTION:** CREATE-BULK-READING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input array of {contractId, serviceId, month, newIndex, readingDate, note}
4. Validation tất cả contractIds và serviceId tồn tại
5. BEGIN TRANSACTION:
   - For each row:
     - Get oldIndex từ PREPARE-SINGLE-READING
     - Validate newIndex >= oldIndex
     - Calculate usage và totalCost
     - CREATE ServiceReading với isBilled = false
6. COMMIT TRANSACTION
7. Trả về số lượng readings created

**MODEL:** ServiceReading, Contract, Service
**TABLE NAME:** service_readings, contracts, services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-705
**FUNCTION:** GET-READINGS-LIST
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input filters: month, buildingId, serviceId, isBilled
4. Query ServiceReadings với filters
5. Include Contract, Room, Tenant, Service info
6. Sort by readingDate DESC
7. Trả về danh sách Readings

**MODEL:** ServiceReading, Contract, Room, Tenant, Service
**TABLE NAME:** service_readings, contracts, rooms, tenants, services
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-706
**FUNCTION:** GET-UNREAD-ROOMS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input buildingId, month, serviceId
4. Query all active Contracts trong Building
5. Query all Readings cho month + serviceId
6. Filter Contracts chưa có Reading
7. Include Room, Tenant info
8. Trả về danh sách unread contracts

**MODEL:** Contract, Room, Tenant, ServiceReading
**TABLE NAME:** contracts, rooms, tenants, service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-707
**FUNCTION:** UPDATE-READING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Reading ID + update data (newIndex, note, isMeterReset)
4. Check Reading tồn tại
5. Check isBilled = false (không cho sửa nếu đã bill)
6. Validation newIndex >= oldIndex
7. Recalculate usage và totalCost
8. UPDATE ServiceReading
9. Trả về updated Reading

**MODEL:** ServiceReading
**TABLE NAME:** service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-708
**FUNCTION:** DELETE-READING
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Reading ID
4. Check Reading tồn tại
5. Check isBilled = false (không cho xóa nếu đã bill)
6. DELETE ServiceReading
7. Trả về success message

**MODEL:** ServiceReading
**TABLE NAME:** service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: RDG-709
**FUNCTION:** GET-READING-STATS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input month, buildingId
4. Query all ServiceReadings for month + building
5. Aggregate statistics:
   - Total readings count
   - Total electricity usage
   - Total water usage
   - Total cost
   - Average usage per room
6. Trả về statistics object

**MODEL:** ServiceReading, Contract, Room
**TABLE NAME:** service_readings, contracts, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 8. INVOICES MODULE (MOST COMPLEX)

### CODE: INV-801
**FUNCTION:** PREVIEW-INVOICE (CALCULATION)
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input contractId, month (MM-YYYY)
4. Validation month format
5. Check Contract tồn tại và isActive = true
6. Query all ServiceReadings cho contract + month
7. Validate INDEX services có readings
8. Calculate room charge:
   - IF full month: roomCharge = contract.price
   - ELSE: calculate pro-rata (số ngày × giá theo ngày)
9. Calculate service charges:
   - INDEX services: sum totalCost from readings
   - FIXED services: calculate based on calculationType (PER_ROOM/PER_PERSON × price)
10. Query previous unpaid Invoices (status = PUBLISHED/PARTIAL/OVERDUE)
11. Calculate previousDebt = sum(totalAmount - paidAmount)
12. Check missing deposit (contract.deposit - contract.paidDeposit)
13. Create line items array:
    - {type: RENT, description, quantity, unitPrice, amount}
    - {type: ELECTRIC, ...}
    - {type: WATER, ...}
    - {type: FIXED, ...} for each fixed service
    - {type: DEBT, ...} if previousDebt > 0
    - {type: EXTRA, ...} for missing deposit
14. Calculate totals:
    - roomCharge = RENT items
    - serviceCharge = ELECTRIC + WATER + FIXED
    - debtAmount = DEBT + EXTRA
    - totalAmount = roomCharge + serviceCharge + debtAmount
15. Trả về preview object (KHÔNG save database)

**MODEL:** Contract, ServiceReading, Service, Invoice
**TABLE NAME:** contracts, service_readings, services, invoices
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-802
**FUNCTION:** GENERATE-DRAFT-INVOICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input contractId, month, lineItems (từ Preview), dueDate
4. Check unique constraint (contractId + month)
5. IF lineItems provided: use snapshot từ frontend
6. ELSE: calculate lại như PREVIEW-INVOICE
7. Generate random accessCode (UUID)
8. CREATE Invoice với:
   - status = DRAFT
   - lineItems (JSON snapshot)
   - All calculated amounts
   - paidAmount = 0
   - discount = 0
9. Trả về Invoice info

**MODEL:** Invoice, Contract
**TABLE NAME:** invoices, contracts
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-803
**FUNCTION:** GENERATE-BULK-INVOICES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input month, buildingId (optional)
4. Query all active Contracts (filter by building nếu có)
5. BEGIN TRANSACTION:
   - For each Contract:
     - Check chưa có Invoice cho month này
     - Call PREVIEW-INVOICE để calculate
     - CREATE Invoice với status = DRAFT
6. COMMIT TRANSACTION
7. Trả về số lượng invoices created

**MODEL:** Invoice, Contract
**TABLE NAME:** invoices, contracts
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-804
**FUNCTION:** UPDATE-DRAFT-INVOICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Invoice ID + update data (lineItems, discount, dueDate, note)
4. Check Invoice tồn tại
5. Check status = DRAFT (chỉ cho sửa khi DRAFT)
6. IF update lineItems:
   - Recalculate all amounts from new lineItems
7. IF update discount:
   - Recalculate totalAmount = (roomCharge + serviceCharge + debtAmount) - discount
8. UPDATE Invoice
9. Trả về updated Invoice

**MODEL:** Invoice
**TABLE NAME:** invoices
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-805
**FUNCTION:** PUBLISH-INVOICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Invoice ID
4. Check Invoice tồn tại
5. Check status = DRAFT
6. BEGIN TRANSACTION:
   - UPDATE Invoice: set status = PUBLISHED, set publishedAt = now()
   - Query all ServiceReadings trong lineItems
   - UPDATE ServiceReadings: set isBilled = true
7. COMMIT TRANSACTION
8. Trả về published Invoice

**MODEL:** Invoice, ServiceReading
**TABLE NAME:** invoices, service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-806
**FUNCTION:** UNPUBLISH-INVOICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Invoice ID
4. Check Invoice tồn tại
5. Check status = PUBLISHED (chưa có payment)
6. BEGIN TRANSACTION:
   - UPDATE Invoice: set status = DRAFT, set publishedAt = null
   - Query all ServiceReadings trong lineItems
   - UPDATE ServiceReadings: set isBilled = false
7. COMMIT TRANSACTION
8. Trả về Invoice

**MODEL:** Invoice, ServiceReading
**TABLE NAME:** invoices, service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-807
**FUNCTION:** RECORD-PAYMENT
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input invoiceId, amount, paymentDate, note, isDepositPayment
4. Check Invoice tồn tại
5. Check status = PUBLISHED/PARTIAL/OVERDUE
6. Validation amount > 0 và <= remaining amount
7. BEGIN TRANSACTION:
   - UPDATE Invoice:
     - paidAmount += amount
     - Calculate remaining = totalAmount - paidAmount
     - IF remaining = 0: status = PAID
     - ELSE: status = PARTIAL
     - Add payment to paymentHistory JSON array
   - CREATE Transaction:
     - type = INVOICE_PAYMENT
     - amount = amount
     - invoiceId = invoiceId
     - contractId = invoice.contractId
   - IF isDepositPayment = true:
     - UPDATE Contract: paidDeposit += amount
8. COMMIT TRANSACTION
9. Trả về updated Invoice + Transaction created

**MODEL:** Invoice, Transaction, Contract
**TABLE NAME:** invoices, transactions, contracts
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-808
**FUNCTION:** CANCEL-INVOICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Invoice ID
4. Check Invoice tồn tại
5. Check status = DRAFT/PUBLISHED (chưa có payment)
6. BEGIN TRANSACTION:
   - UPDATE Invoice: set status = CANCELLED
   - IF có ServiceReadings đã mark isBilled:
     - UPDATE ServiceReadings: set isBilled = false
7. COMMIT TRANSACTION
8. Trả về success message

**MODEL:** Invoice, ServiceReading
**TABLE NAME:** invoices, service_readings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-809
**FUNCTION:** GET-ALL-INVOICES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input filters: status, month, buildingId
4. Query Invoices với filters
5. Include Contract, Room, Tenant, Building info
6. Sort by createdAt DESC
7. Trả về danh sách Invoices

**MODEL:** Invoice, Contract, Room, Tenant, Building
**TABLE NAME:** invoices, contracts, rooms, tenants, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-810
**FUNCTION:** GET-INVOICE-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Invoice ID
4. Check Invoice tồn tại
5. Query Invoice với include:
   - Contract (+ Room, Tenant, Building)
   - Transactions list
6. Parse lineItems JSON
7. Parse paymentHistory JSON
8. Trả về Invoice detail

**MODEL:** Invoice, Contract, Room, Tenant, Building, Transaction
**TABLE NAME:** invoices, contracts, rooms, tenants, buildings, transactions
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-811
**FUNCTION:** GET-INVOICE-PUBLIC (NO AUTH)
**DESCRIPTION:**
1. Input accessCode (UUID) từ URL params
2. Marked with @Public() - bypass JWT guard
3. Find Invoice by accessCode
4. Check Invoice tồn tại
5. Query Invoice với include Contract, Room, Tenant
6. Parse lineItems và paymentHistory
7. Trả về Invoice detail (cho tenant xem)

**MODEL:** Invoice, Contract, Room, Tenant
**TABLE NAME:** invoices, contracts, rooms, tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-812
**FUNCTION:** DELETE-INVOICE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Invoice ID
4. Check Invoice tồn tại
5. Check status = DRAFT hoặc CANCELLED (không cho xóa đã publish/paid)
6. DELETE Invoice
7. Trả về success message

**MODEL:** Invoice
**TABLE NAME:** invoices
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-813
**FUNCTION:** GET-INVOICE-STATS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input month, buildingId (optional)
4. Query Invoices với filters
5. Aggregate statistics:
   - Total invoices count
   - Count by status (DRAFT, PUBLISHED, PARTIAL, PAID, OVERDUE, CANCELLED)
   - Total amount billed
   - Total amount paid
   - Total amount remaining
   - Collection rate (%)
6. Trả về statistics object

**MODEL:** Invoice
**TABLE NAME:** invoices
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: INV-814
**FUNCTION:** GET-INVOICES-BY-MONTH
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input month (MM-YYYY)
4. Query Invoices where month = input
5. Include Contract, Room, Tenant info
6. Calculate summary stats
7. Trả về danh sách Invoices + stats

**MODEL:** Invoice, Contract, Room, Tenant
**TABLE NAME:** invoices, contracts, rooms, tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 9. TRANSACTIONS MODULE

### CODE: TXN-901
**FUNCTION:** CREATE-TRANSACTION
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input contractId, type (DEPOSIT/INVOICE_PAYMENT/OTHER), amount, date, note, invoiceId (optional)
4. Check Contract tồn tại
5. IF type = INVOICE_PAYMENT: check Invoice tồn tại
6. Generate transaction code (unique, format: TXN-YYYYMMDD-XXXX)
7. CREATE Transaction
8. Trả về Transaction info

**MODEL:** Transaction, Contract, Invoice
**TABLE NAME:** transactions, contracts, invoices
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TXN-902
**FUNCTION:** GET-ALL-TRANSACTIONS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input filters: type, contractId, dateFrom, dateTo
4. Query Transactions với filters
5. Include Contract, Invoice info
6. Sort by date DESC
7. Trả về danh sách Transactions

**MODEL:** Transaction, Contract, Invoice
**TABLE NAME:** transactions, contracts, invoices
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TXN-903
**FUNCTION:** GET-TRANSACTION-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Transaction ID
4. Check Transaction tồn tại
5. Query Transaction với include Contract, Invoice, Tenant, Room
6. Trả về Transaction detail

**MODEL:** Transaction, Contract, Invoice, Tenant, Room
**TABLE NAME:** transactions, contracts, invoices, tenants, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: TXN-904
**FUNCTION:** GET-TRANSACTION-STATS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input dateFrom, dateTo, buildingId (optional)
4. Query Transactions với date range
5. Aggregate statistics:
   - Total transactions count
   - Count by type (DEPOSIT, INVOICE_PAYMENT, OTHER)
   - Total amount by type
   - Average transaction amount
6. Trả về statistics object

**MODEL:** Transaction
**TABLE NAME:** transactions
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 10. ISSUES MODULE

### CODE: ISS-1001
**FUNCTION:** CREATE-ISSUE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input roomId, title, description, images (array of URLs)
4. Check Room tồn tại
5. Set status = OPEN (default)
6. CREATE Issue
7. Trả về Issue info

**MODEL:** Issue, Room
**TABLE NAME:** issues, rooms
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ISS-1002
**FUNCTION:** GET-ALL-ISSUES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input filters: status, roomId, buildingId
4. Query Issues với filters
5. Include Room, Building info
6. Sort by createdAt DESC
7. Trả về danh sách Issues

**MODEL:** Issue, Room, Building
**TABLE NAME:** issues, rooms, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ISS-1003
**FUNCTION:** GET-ISSUE-DETAIL
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Issue ID
4. Check Issue tồn tại
5. Query Issue với include Room, Building
6. Trả về Issue detail

**MODEL:** Issue, Room, Building
**TABLE NAME:** issues, rooms, buildings
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ISS-1004
**FUNCTION:** UPDATE-ISSUE-STATUS
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Issue ID + new status (OPEN/PROCESSING/DONE)
4. Check Issue tồn tại
5. Validation status value
6. UPDATE Issue status
7. Trả về updated Issue

**MODEL:** Issue
**TABLE NAME:** issues
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ISS-1005
**FUNCTION:** UPDATE-ISSUE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Issue ID + update data (title, description, images)
4. Check Issue tồn tại
5. UPDATE Issue
6. Trả về updated Issue

**MODEL:** Issue
**TABLE NAME:** issues
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: ISS-1006
**FUNCTION:** DELETE-ISSUE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input Issue ID
4. Check Issue tồn tại
5. DELETE Issue
6. Trả về success message

**MODEL:** Issue
**TABLE NAME:** issues
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 11. UPLOAD MODULE

### CODE: UPL-1101
**FUNCTION:** UPLOAD-CCCD
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input tenantId, frontImage (file), backImage (file)
4. Check Tenant tồn tại
5. Validation file type (JPEG, PNG, WEBP)
6. Validation file size (<= 5MB)
7. Upload frontImage to Cloudinary (folder: cccd/front)
8. Upload backImage to Cloudinary (folder: cccd/back)
9. Get URLs từ Cloudinary response
10. UPDATE Tenant.info JSON: add {cccdFront: URL, cccdBack: URL}
11. Trả về uploaded URLs

**MODEL:** Tenant
**TABLE NAME:** tenants
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: UPL-1102
**FUNCTION:** UPLOAD-SINGLE-IMAGE
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input folder name, image file
4. Validation file type (JPEG, PNG, WEBP)
5. Validation file size (<= 5MB)
6. Upload to Cloudinary (folder: {folder})
7. Apply optimization (auto quality, auto format)
8. Get URL từ Cloudinary response
9. Trả về uploaded URL

**MODEL:** N/A
**TABLE NAME:** N/A
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: UPL-1103
**FUNCTION:** UPLOAD-MULTIPLE-IMAGES
**DESCRIPTION:**
1. Lấy JWT sau khi phân rã
2. Check Role = ADMIN
3. Input folder name, images array (files)
4. Validation all files type và size
5. For each image:
   - Upload to Cloudinary (folder: {folder})
   - Apply optimization
6. Collect all URLs
7. Trả về array of uploaded URLs

**MODEL:** N/A
**TABLE NAME:** N/A
**DIAGRAM:** SEQUENCE ACTIVITY

---

## 12. MAIL MODULE

### CODE: MAIL-1201
**FUNCTION:** SEND-PASSWORD-RESET-EMAIL
**DESCRIPTION:**
1. Called by AUTH-104 (Forgot Password)
2. Input userEmail, userName, resetToken
3. Build reset URL: frontend_url/reset-password?token={resetToken}
4. Load HTML email template (branded with Camel Stay theme)
5. Replace placeholders: {{userName}}, {{resetUrl}}
6. Send email via Nodemailer:
   - From: noreply@camelstay.com
   - To: userEmail
   - Subject: "Reset Your Password"
   - HTML: rendered template
7. Trả về success/failure status

**MODEL:** N/A
**TABLE NAME:** N/A
**DIAGRAM:** SEQUENCE ACTIVITY

---

### CODE: MAIL-1202
**FUNCTION:** SEND-USER-CONFIRMATION-EMAIL
**DESCRIPTION:**
1. Called by AUTH-102 (Register)
2. Input userEmail, userName
3. Load HTML email template
4. Replace placeholders: {{userName}}
5. Send email via Nodemailer:
   - From: noreply@camelstay.com
   - To: userEmail
   - Subject: "Welcome to Camel Stay"
   - HTML: rendered template
7. Trả về success/failure status

**MODEL:** N/A
**TABLE NAME:** N/A
**DIAGRAM:** SEQUENCE ACTIVITY

---

## TỔNG HỢP

**Tổng số Functions:** 90+ functions
**Modules:** 12 modules
**Complexity Level:**
- Simple (CRUD): 30%
- Medium (Business Logic): 40%
- Complex (Multi-step Transactions): 30%

**Top 5 Most Complex Functions:**
1. **CTR-506: MOVE-CONTRACT** - 11 steps với transaction
2. **INV-801: PREVIEW-INVOICE** - Complex calculation với nhiều scenarios
3. **INV-807: RECORD-PAYMENT** - Multi-payment tracking + status management
4. **RDG-704: CREATE-BULK-READING** - Bulk processing với validation
5. **INV-803: GENERATE-BULK-INVOICES** - Mass invoice generation

**Security:**
- All functions (trừ public invoice view) require JWT authentication
- Most functions require ADMIN role
- Global guards enforce security policy

**Transaction Safety:**
- Critical operations wrapped in database transactions
- Cascade protection prevents data orphaning
- Validation at multiple levels

---

File được lưu tại: `/home/user/smart-rental-capstone-baovietz98/backend/FUNCTION_LIST.md`
