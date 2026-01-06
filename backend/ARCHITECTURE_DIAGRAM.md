# Backend Architecture Diagram - Smart Rental System

## NestJS MVC Architecture Flow

```mermaid
graph TB
    Client[👤 Client/Frontend]

    subgraph "NestJS Backend"
        Guards[🛡️ Guards Layer<br/>JWT Auth + Roles]
        Controller[🎮 Controller Layer<br/>@Controller, @Get, @Post]
        Service[⚙️ Service Layer<br/>Business Logic]
        Prisma[🔌 Prisma Service<br/>ORM Layer]
    end

    DB[(🗄️ PostgreSQL<br/>Database)]

    Client -->|1. HTTP Request| Guards
    Guards -->|2. Validate JWT| Controller
    Controller -->|3. Call Method| Service
    Service -->|4. Query/Mutation| Prisma
    Prisma -->|5. SQL Query| DB
    DB -->|6. Data| Prisma
    Prisma -->|7. Entity Objects| Service
    Service -->|8. DTO Response| Controller
    Controller -->|9. HTTP Response| Client

    style Client fill:#e1f5ff
    style Guards fill:#fff4e1
    style Controller fill:#ffe1e1
    style Service fill:#e1ffe1
    style Prisma fill:#f0e1ff
    style DB fill:#e1e1e1
```

## Detailed Flow by Module

### Example: Invoice Module

```mermaid
sequenceDiagram
    participant C as Client
    participant G as JWT Guard
    participant R as Roles Guard
    participant IC as InvoicesController
    participant IS as InvoicesService
    participant PS as PrismaService
    participant DB as PostgreSQL

    C->>G: POST /invoices/generate
    G->>G: Validate JWT Token
    G->>R: Check User Role
    R->>R: Validate ADMIN Role
    R->>IC: @Post('generate')
    IC->>IC: Validate DTO
    IC->>IS: generateDraftInvoice(dto)
    IS->>IS: Business Logic:<br/>- Check Contract<br/>- Get Readings<br/>- Calculate Amounts
    IS->>PS: invoice.create({...})
    PS->>DB: INSERT INTO invoices
    DB-->>PS: Invoice Record
    PS-->>IS: Invoice Entity
    IS-->>IC: InvoiceResponseDto
    IC-->>C: 201 Created + Invoice Data
```

## Layer Responsibilities

### 🛡️ Guards Layer
- **JwtAuthGuard**: Validate access token
- **RolesGuard**: Check user permissions
- **RefreshTokenGuard**: Validate refresh token

### 🎮 Controller Layer
**Responsibilities:**
- Route definition (@Get, @Post, @Patch, @Delete)
- Request validation (DTOs)
- HTTP response formatting
- Swagger documentation (@ApiOperation, @ApiResponse)

**Example Modules:**
- `auth.controller.ts`
- `invoices.controller.ts`
- `contracts.controller.ts`
- `rooms.controller.ts`

### ⚙️ Service Layer
**Responsibilities:**
- Business logic implementation
- Data validation
- Transaction management
- Complex calculations (invoice, pro-rata, settlement)
- Error handling

**Example Modules:**
- `invoices.service.ts` - Complex billing engine
- `contracts.service.ts` - Contract lifecycle + room moves
- `readings.service.ts` - Meter reading management

### 🔌 Prisma Layer
**Responsibilities:**
- Database abstraction
- Type-safe queries
- Relationship management
- Migration handling

**Schema Models:**
- User, Building, Room, Tenant
- Contract, Service, ServiceReading
- Invoice, Transaction, Issue

### 🗄️ Database Layer
**PostgreSQL Database:**
- 11 tables
- Relationships with foreign keys
- Indexes for performance
- Constraints for data integrity

## Request/Response Flow Example

### Create Contract Flow

```mermaid
graph LR
    A[POST /contracts] --> B{JWT Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Role = ADMIN?}
    D -->|No| E[403 Forbidden]
    D -->|Yes| F[Validate DTO]
    F -->|Invalid| G[400 Bad Request]
    F -->|Valid| H[ContractsService]
    H --> I{Room Available?}
    I -->|No| J[400 Room Not Available]
    I -->|Yes| K[BEGIN Transaction]
    K --> L[Create Contract]
    L --> M[Update Room Status]
    M --> N[Create Initial Readings]
    N --> O[COMMIT Transaction]
    O --> P[201 Created]
```

## Module Dependencies

```mermaid
graph TD
    AppModule[App Module]

    AppModule --> AuthModule
    AppModule --> BuildingsModule
    AppModule --> RoomsModule
    AppModule --> TenantsModule
    AppModule --> ContractsModule
    AppModule --> ServicesModule
    AppModule --> ReadingsModule
    AppModule --> InvoicesModule
    AppModule --> TransactionsModule
    AppModule --> IssuesModule
    AppModule --> UploadModule
    AppModule --> MailModule

    AuthModule --> PrismaModule
    BuildingsModule --> PrismaModule
    RoomsModule --> PrismaModule
    TenantsModule --> PrismaModule
    ContractsModule --> PrismaModule
    ServicesModule --> PrismaModule
    ReadingsModule --> PrismaModule
    InvoicesModule --> PrismaModule
    TransactionsModule --> PrismaModule
    IssuesModule --> PrismaModule

    ContractsModule --> RoomsModule
    InvoicesModule --> ContractsModule
    InvoicesModule --> ReadingsModule
    ReadingsModule --> ServicesModule
    TransactionsModule --> ContractsModule
    TransactionsModule --> InvoicesModule

    UploadModule --> CloudinaryService[Cloudinary]
    MailModule --> NodemailerService[Nodemailer]

    style PrismaModule fill:#f0e1ff
    style CloudinaryService fill:#e1f5ff
    style NodemailerService fill:#e1f5ff
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend"
        F[React/Next.js]
    end

    subgraph "Backend - NestJS"
        C[Controllers]
        S[Services]
        G[Guards]
    end

    subgraph "Data Layer"
        P[Prisma ORM]
        DB[(PostgreSQL)]
    end

    subgraph "External Services"
        CL[Cloudinary]
        NM[Nodemailer]
    end

    F -->|HTTP/REST| G
    G --> C
    C --> S
    S --> P
    P --> DB
    S --> CL
    S --> NM
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AuthController
    participant AS as AuthService
    participant DB as Database

    Note over C,DB: Login Flow
    C->>AC: POST /auth/login
    AC->>AS: login(email, password)
    AS->>DB: findUnique({email})
    DB-->>AS: User
    AS->>AS: bcrypt.compare(password)
    AS->>AS: generateTokens()
    AS->>DB: update refreshToken
    AS-->>AC: {accessToken, refreshToken}
    AC-->>C: 200 OK + Tokens

    Note over C,DB: Protected Request
    C->>AC: GET /invoices (with JWT)
    AC->>AC: @UseGuards(JwtAuthGuard)
    AC->>AC: Validate Token
    AC->>AS: getInvoices(userId)
    AS->>DB: findMany({...})
    DB-->>AS: Invoices[]
    AS-->>AC: Invoices
    AC-->>C: 200 OK + Data
```

## Database Schema Relationships

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string password
        enum role
        string refreshToken
    }

    Building {
        int id PK
        string name
        string address
    }

    Room {
        int id PK
        int buildingId FK
        string name
        float price
        enum status
        json assets
    }

    Tenant {
        int id PK
        string fullName
        string phone UK
        string cccd
        json info
    }

    Contract {
        int id PK
        int roomId FK
        int tenantId FK
        date startDate
        date endDate
        float deposit
        boolean isActive
    }

    Service {
        int id PK
        string name
        float price
        enum type
        boolean isActive
    }

    ServiceReading {
        int id PK
        int contractId FK
        int serviceId FK
        string month
        int newIndex
        int oldIndex
        float totalCost
    }

    Invoice {
        int id PK
        int contractId FK
        string month
        float totalAmount
        float paidAmount
        enum status
        json lineItems
    }

    Transaction {
        int id PK
        int contractId FK
        int invoiceId FK
        float amount
        enum type
    }

    Issue {
        int id PK
        int roomId FK
        string title
        enum status
    }

    Building ||--o{ Room : "has many"
    Room ||--o{ Contract : "has many"
    Room ||--o{ Issue : "has many"
    Tenant ||--o{ Contract : "has many"
    Contract ||--o{ ServiceReading : "has many"
    Contract ||--o{ Invoice : "has many"
    Contract ||--o{ Transaction : "has many"
    Service ||--o{ ServiceReading : "has many"
    Invoice ||--o{ Transaction : "has many"
```

---

## How to View These Diagrams

### On GitHub
- Push this file to GitHub
- GitHub automatically renders Mermaid diagrams
- View directly in browser

### In VS Code
- Install extension: "Markdown Preview Mermaid Support"
- Open this file
- Press `Ctrl+Shift+V` (Windows) or `Cmd+Shift+V` (Mac)

### Online Tools
1. **Mermaid Live Editor**: https://mermaid.live/
   - Copy any diagram code
   - Paste and view
   - Export as PNG/SVG

2. **Draw.io**: https://app.diagrams.net/
   - Import the draw.io XML file (created separately)

3. **Excalidraw**: https://excalidraw.com/
   - For hand-drawn style diagrams
