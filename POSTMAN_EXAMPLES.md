# Postman Examples - SamaOuvrier Authentication API

## Base URL

```
http://localhost:3000/api/v1/auth
```

---

## 1. REGISTER CLIENT

### Request

**POST** `/auth/register`

```json
{
  "type": "CLIENT",
  "nom": "Dupont",
  "prenom": "Jean",
  "adresse": "123 Rue de la Paix, Dakar",
  "tel": "+221771234567",
  "email": "jean.dupont@email.com",
  "password": "Password123"
}
```

### Success Response (201 Created)

```json
{
  "user": {
    "id": "uuid-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nom": "Dupont",
    "prenom": "Jean",
    "adresse": "123 Rue de la Paix, Dakar",
    "tel": "+221771234567",
    "email": "jean.dupont@email.com",
    "role": "CLIENT",
": null,
       "workerStatus "professionId": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**Email already exists (409)**

```json
{
  "error": "Email already registered",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

**professionId provided for CLIENT (400)**

```json
{
  "error": "Unrecognized keys in object: professionId",
  "details": {
    "path": [],
    "code": "unrecognized_keys",
    "keys": ["professionId"]
  }
}
```

**Invalid input (400)**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Email is required"
    }
  ]
}
```

---

## 2. REGISTER WORKER

### Prerequisites

- Run seed to create professions: `npm run prisma:seed`

### Request

**POST** `/auth/register`

First, get a valid professionId from the database:

```sql
SELECT id, name FROM professions;
```

```json
{
  "type": "WORKER",
  "nom": "Ndiaye",
  "prenom": "Moussa",
  "adresse": "45 Avenue Pompidou, Dakar",
  "tel": "+221771234568",
  "email": "moussa.ndiaye@email.com",
  "password": "Password123",
  "professionId": "uuid-of-plumber-profession"
}
```

### Success Response (201 Created)

```json
{
  "user": {
    "id": "uuid-b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "nom": "Ndiaye",
    "prenom": "Moussa",
    "adresse": "45 Avenue Pompidou, Dakar",
    "tel": "+221771234568",
    "email": "moussa.ndiaye@email.com",
    "role": "WORKER",
    "workerStatus": "PENDING",
    "professionId": "uuid-of-plumber-profession",
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**No profession available (400)**

```json
{
  "error": "No profession available yet. Please contact administrator.",
  "code": "NO_PROFESSION_AVAILABLE"
}
```

**Invalid professionId (400)**

```json
{
  "error": "Profession not found",
  "code": "PROFESSION_NOT_FOUND"
}
```

**professionId missing for WORKER (400)**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["professionId"],
      "message": "Profession is required for worker registration"
    }
  ]
}
```

---

## 3. ATTEMPT ADMIN REGISTRATION (FORBIDDEN)

### Request

**POST** `/auth/register`

```json
{
  "type": "ADMIN",
  "nom": "Hacker",
  "prenom": "Bad",
  "adresse": "Somewhere",
  "tel": "+221771234569",
  "email": "admin@email.com",
  "password": "Password123"
}
```

### Error Response (403 Forbidden)

```json
{
  "error": "ADMIN registration is forbidden",
  "code": "ADMIN_FORBIDDEN"
}
```

---

## 4. LOGIN

### Request

**POST** `/auth/login`

```json
{
  "email": "jean.dupont@email.com",
  "password": "Password123"
}
```

### Success Response (200 OK) - CLIENT

```json
{
  "user": {
    "id": "uuid-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nom": "Dupont",
    "prenom": "Jean",
    "adresse": "123 Rue de la Paix, Dakar",
    "tel": "+221771234567",
    "email": "jean.dupont@email.com",
    "role": "CLIENT",
    "workerStatus": null,
    "professionId": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (200 OK) - ADMIN

```json
{
  "user": {
    "id": "uuid-admin1234-5678-9012-345678901234",
    "nom": "Admin",
    "prenom": "Super",
    "adresse": "Admin HQ",
    "tel": "+221000000000",
    "email": "admin@samaouvrier.com",
    "role": "ADMIN",
    "workerStatus": null,
    "professionId": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**Invalid credentials (401)**

```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**Worker not approved (403)**

```json
{
  "error": "Your account is pending admin approval.",
  "code": "WORKER_NOT_APPROVED"
}
```

**Worker rejected (403)**

```json
{
  "error": "Your account has been rejected.",
  "code": "WORKER_REJECTED"
}
```

---

## 5. LOGIN AS APPROVED WORKER

### Prerequisites

- Admin must approve the worker in the database:

```sql
UPDATE users
SET worker_status = 'APPROVED'
WHERE role = 'WORKER';
```

### Request

**POST** `/auth/login`

```json
{
  "email": "moussa.ndiaye@email.com",
  "password": "Password123"
}
```

### Success Response (200 OK)

```json
{
  "user": {
    "id": "uuid-b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "nom": "Ndiaye",
    "prenom": "Moussa",
    "adresse": "45 Avenue Pompidou, Dakar",
    "tel": "+221771234568",
    "email": "moussa.ndiaye@email.com",
    "role": "WORKER",
    "workerStatus": "APPROVED",
    "professionId": "uuid-of-plumber-profession",
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 6. Seed Data

### Admin Account (created by seed)

```
Email: admin@samaouvrier.com
Password: Admin@2024!Secure
Role: ADMIN
```

### Professions (created by seed)

1. Plumber
2. Electrician
3. Carpenter
4. Painter
5. Mason
6. Welder
7. Gardener
8. Cleaner
9. Mechanic
10. AC Technician

---

## Environment Variables

Make sure your `.env` file contains:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/samaouvrier
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```
