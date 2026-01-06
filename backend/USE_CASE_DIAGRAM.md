# Use Case Diagram - Smart Rental Backend System

## Main Use Case Diagram

```mermaid
graph TB
    subgraph Actors
        Admin[👤 Admin]
        Tenant[👤 Tenant]
    end

    subgraph "Authentication Use Cases"
        UC1[Login]
        UC2[Register]
        UC3[Reset Password]
        UC4[Refresh Token]
        UC5[Logout]
    end

    subgraph "Building Management"
        UC6[Create Building]
        UC7[View Buildings]
        UC8[Update Building]
        UC9[Delete Building]
    end

    subgraph "Room Management"
        UC10[Create Room]
        UC11[View Rooms]
        UC12[Update Room]
        UC13[Change Room Status]
        UC14[Delete Room]
        UC15[Bulk Update Prices]
        UC16[View Room Statistics]
    end

    subgraph "Tenant Management"
        UC17[Create Tenant]
        UC18[View Tenants]
        UC19[Update Tenant]
        UC20[Delete Tenant]
        UC21[Upload CCCD]
    end

    subgraph "Contract Management"
        UC22[Create Contract]
        UC23[View Contracts]
        UC24[Update Contract]
        UC25[Terminate Contract]
        UC26[Move Room]
        UC27[View Contract Stats]
    end

    subgraph "Service Management"
        UC28[Create Service]
        UC29[View Services]
        UC30[Update Service]
        UC31[Delete Service]
        UC32[Seed Default Services]
    end

    subgraph "Meter Reading"
        UC33[Record Single Reading]
        UC34[Bulk Record Readings]
        UC35[View Readings]
        UC36[View Unread Rooms]
        UC37[Update Reading]
        UC38[View Reading Stats]
    end

    subgraph "Invoice Management"
        UC39[Preview Invoice]
        UC40[Generate Draft Invoice]
        UC41[Bulk Generate Invoices]
        UC42[Update Draft]
        UC43[Publish Invoice]
        UC44[Record Payment]
        UC45[Cancel Invoice]
        UC46[View Invoices]
        UC47[View Invoice Stats]
    end

    subgraph "Transaction Management"
        UC48[Create Transaction]
        UC49[View Transactions]
        UC50[View Transaction Stats]
    end

    subgraph "Issue Management"
        UC51[Report Issue]
        UC52[View Issues]
        UC53[Update Issue Status]
        UC54[Resolve Issue]
    end

    %% Admin connections
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28
    Admin --> UC29
    Admin --> UC30
    Admin --> UC31
    Admin --> UC32
    Admin --> UC33
    Admin --> UC34
    Admin --> UC35
    Admin --> UC36
    Admin --> UC37
    Admin --> UC38
    Admin --> UC39
    Admin --> UC40
    Admin --> UC41
    Admin --> UC42
    Admin --> UC43
    Admin --> UC44
    Admin --> UC45
    Admin --> UC46
    Admin --> UC47
    Admin --> UC48
    Admin --> UC49
    Admin --> UC50
    Admin --> UC51
    Admin --> UC52
    Admin --> UC53
    Admin --> UC54

    %% Tenant connections (limited access)
    Tenant --> UC1
    Tenant -.-> UC46

    style Admin fill:#ff9999
    style Tenant fill:#99ccff
```

## Authentication Module - Use Cases

```mermaid
graph LR
    Admin[👤 Admin]
    Tenant[👤 Tenant]

    subgraph "Authentication"
        Login[Login]
        Register[Register]
        ResetPwd[Reset Password]
        Refresh[Refresh Token]
        Logout[Logout]
        GetProfile[Get Profile]
    end

    Admin --> Login
    Admin --> Register
    Admin --> ResetPwd
    Admin --> Refresh
    Admin --> Logout
    Admin --> GetProfile

    Tenant --> Login
    Tenant --> Register
    Tenant --> ResetPwd
    Tenant --> Refresh
    Tenant --> Logout
    Tenant --> GetProfile

    style Admin fill:#ff9999
    style Tenant fill:#99ccff
    style Login fill:#ffe6e6
    style Register fill:#ffe6e6
    style ResetPwd fill:#ffe6e6
    style Refresh fill:#ffe6e6
    style Logout fill:#ffe6e6
    style GetProfile fill:#ffe6e6
```

## Building & Room Management - Use Cases

```mermaid
graph TB
    Admin[👤 Admin]

    subgraph "Building Management"
        direction TB
        B1[Create Building]
        B2[View All Buildings]
        B3[View Building Detail]
        B4[Update Building]
        B5[Delete Building]
    end

    subgraph "Room Management"
        direction TB
        R1[Create Room]
        R2[View All Rooms]
        R3[View Rooms by Building]
        R4[View Room Detail]
        R5[Update Room Info]
        R6[Update Room Status]
        R7[Delete Room]
        R8[Bulk Update Prices]
        R9[Bulk Create Issues]
        R10[View Room Stats]
    end

    Admin --> B1
    Admin --> B2
    Admin --> B3
    Admin --> B4
    Admin --> B5

    Admin --> R1
    Admin --> R2
    Admin --> R3
    Admin --> R4
    Admin --> R5
    Admin --> R6
    Admin --> R7
    Admin --> R8
    Admin --> R9
    Admin --> R10

    B2 -.includes.-> B3
    R2 -.includes.-> R4

    style Admin fill:#ff9999
```

## Contract Management - Use Cases

```mermaid
graph TB
    Admin[👤 Admin]

    subgraph "Contract Lifecycle"
        direction TB
        C1[Create Contract]
        C2[View Contracts]
        C3[View Contract Detail]
        C4[Update Contract]
        C5[Terminate Contract]
        C6[Move Room]
        C7[View Contract Stats]
    end

    subgraph "Related Actions"
        direction TB
        A1[Update Room Status to RENTED]
        A2[Create Initial Meter Readings]
        A3[Calculate Pro-rata Rent]
        A4[Generate Settlement Invoice]
        A5[Create Deposit Transaction]
    end

    Admin --> C1
    Admin --> C2
    Admin --> C3
    Admin --> C4
    Admin --> C5
    Admin --> C6
    Admin --> C7

    C1 -.includes.-> A1
    C1 -.includes.-> A2
    C6 -.includes.-> A3
    C6 -.includes.-> A4
    C6 -.includes.-> A5

    style Admin fill:#ff9999
    style C6 fill:#ffcccc
```

## Invoice Management - Use Cases (Most Complex)

```mermaid
graph TB
    Admin[👤 Admin]
    Tenant[👤 Tenant]

    subgraph "Invoice Creation"
        direction TB
        I1[Preview Invoice]
        I2[Generate Draft Invoice]
        I3[Bulk Generate Invoices]
        I4[Update Draft Invoice]
    end

    subgraph "Invoice Publishing"
        direction TB
        I5[Publish Invoice]
        I6[Unpublish Invoice]
    end

    subgraph "Payment Processing"
        direction TB
        I7[Record Payment]
        I8[View Payment History]
    end

    subgraph "Invoice Operations"
        direction TB
        I9[View All Invoices]
        I10[View Invoice Detail]
        I11[View Invoice by Month]
        I12[View Invoice Stats]
        I13[Cancel Invoice]
        I14[Delete Invoice]
    end

    subgraph "Tenant Access"
        direction TB
        I15[View Invoice Public]
    end

    Admin --> I1
    Admin --> I2
    Admin --> I3
    Admin --> I4
    Admin --> I5
    Admin --> I6
    Admin --> I7
    Admin --> I8
    Admin --> I9
    Admin --> I10
    Admin --> I11
    Admin --> I12
    Admin --> I13
    Admin --> I14

    Tenant --> I15

    I1 -.extends.-> I2
    I2 -.includes.-> I4
    I5 -.includes.-> I8
    I7 -.includes.-> I8

    style Admin fill:#ff9999
    style Tenant fill:#99ccff
    style I1 fill:#fff2cc
    style I2 fill:#fff2cc
    style I7 fill:#ccffcc
```

## Meter Reading - Use Cases

```mermaid
graph TB
    Admin[👤 Admin]

    subgraph "Reading Preparation"
        direction TB
        R1[Prepare Single Reading]
        R2[Prepare Bulk Reading]
    end

    subgraph "Reading Creation"
        direction TB
        R3[Create Single Reading]
        R4[Create Bulk Reading]
    end

    subgraph "Reading Management"
        direction TB
        R5[View Readings List]
        R6[View Unread Rooms]
        R7[Update Reading]
        R8[Delete Reading]
        R9[View Reading Stats]
    end

    Admin --> R1
    Admin --> R2
    Admin --> R3
    Admin --> R4
    Admin --> R5
    Admin --> R6
    Admin --> R7
    Admin --> R8
    Admin --> R9

    R1 -.includes.-> R3
    R2 -.includes.-> R4

    style Admin fill:#ff9999
    style R4 fill:#ffcccc
```

## System Interactions

```mermaid
graph LR
    subgraph "External Systems"
        Email[📧 Email Service<br/>Nodemailer]
        Cloud[☁️ Cloudinary<br/>Image Storage]
    end

    subgraph "Backend System"
        Auth[Auth Module]
        Upload[Upload Module]
        Mail[Mail Module]
    end

    Auth -.sends email.-> Mail
    Mail --> Email
    Upload --> Cloud

    style Email fill:#e1f5ff
    style Cloud fill:#e1f5ff
```

## Complex Use Case: Move Room (Extended)

```mermaid
graph TB
    Start[Start: Move Room Request]

    Check1{Contract<br/>Active?}
    Check2{New Room<br/>Available?}

    Step1[Get Latest Meter Readings]
    Step2[Calculate Pro-rata Rent]
    Step3[Calculate Utility Settlement]
    Step4[Calculate Deposit Adjustment]

    Transaction[BEGIN TRANSACTION]

    Action1[Create Closing Readings]
    Action2[Create Settlement Invoice]
    Action3[Create Deposit Transaction]
    Action4[Update Contract Room]
    Action5[Create Opening Readings]
    Action6[Update Old Room Status]
    Action7[Update New Room Status]

    Commit[COMMIT TRANSACTION]
    Success[Success: Room Moved]
    Error[Error: Rollback]

    Start --> Check1
    Check1 -->|No| Error
    Check1 -->|Yes| Check2
    Check2 -->|No| Error
    Check2 -->|Yes| Step1

    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Transaction

    Transaction --> Action1
    Action1 --> Action2
    Action2 --> Action3
    Action3 --> Action4
    Action4 --> Action5
    Action5 --> Action6
    Action6 --> Action7
    Action7 --> Commit

    Commit --> Success

    style Start fill:#e1f5ff
    style Success fill:#ccffcc
    style Error fill:#ffcccc
    style Transaction fill:#fff2cc
    style Commit fill:#fff2cc
```

## Actor Permissions Summary

```mermaid
graph TB
    subgraph "Admin Permissions"
        direction LR
        A1[Full CRUD on all modules]
        A2[Generate Invoices]
        A3[Record Payments]
        A4[Manage Contracts]
        A5[Move Rooms]
        A6[Bulk Operations]
    end

    subgraph "Tenant Permissions"
        direction LR
        T1[Login/Register]
        T2[View Own Invoices]
        T3[Reset Password]
    end

    Admin[👤 Admin] --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
    Admin --> A5
    Admin --> A6

    Tenant[👤 Tenant] --> T1
    Tenant --> T2
    Tenant --> T3

    style Admin fill:#ff9999
    style Tenant fill:#99ccff
```

## Use Case Statistics

**Total Use Cases:** 54+ use cases

**By Module:**
- Authentication: 6 use cases
- Buildings: 5 use cases
- Rooms: 10 use cases
- Tenants: 5 use cases
- Contracts: 8 use cases (including complex Move Room)
- Services: 6 use cases
- Readings: 9 use cases
- Invoices: 14 use cases (most complex)
- Transactions: 4 use cases
- Issues: 6 use cases
- Upload: 3 use cases
- Mail: 2 use cases

**Complexity:**
- Simple: 30%
- Medium: 40%
- Complex: 30%

**Actors:**
- Admin: Full access (54 use cases)
- Tenant: Limited access (3 use cases)

---

## How to View

1. **GitHub:** Push file lên và GitHub tự động render
2. **VS Code:** Install "Markdown Preview Mermaid Support"
3. **Online:** Copy code vào https://mermaid.live/
