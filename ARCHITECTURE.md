# Architecture Modulaire - Clean Architecture + SOLID

## Vue d'ensemble

Ce projet a été refactorisé en **modules autonomes** suivant les principes de **Clean Architecture** et **SOLID**.

Chaque module est **indépendant et cohésif**, avec une séparation claire des responsabilités.

## Structure du Projet

```
src/
├── modules/                # Modules métier autonomes
│   ├── user/
│   │   ├── domain/        # Entités et règles métier (cœur métier)
│   │   ├── application/   # Cas d'utilisation et interfaces
│   │   ├── infrastructure/# Implémentations (Prisma, base de données)
│   │   ├── interface/     # Contrôleurs HTTP et routes
│   │   └── index.ts       # Export du module
│   │
│   └── service/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       ├── interface/
│       └── index.ts
│
├── shared/                 # Ressources partagées
│   ├── config/            # Configuration environnementale
│   ├── middleware/        # Middlewares Express globaux
│   ├── database/          # Client Prisma singleton
│   └── index.ts
│
├── app.ts                 # Configuration Express
└── server.ts              # Point d'entrée
```

## Principes Appliqués

### 1. **Single Responsibility Principle (SRP)**

Chaque classe a une **seule responsabilité**.

| Couche             | Exemple                | Responsabilité                |
| ------------------ | ---------------------- | ----------------------------- |
| **Domain**         | `User`                 | Règles métier et invariants   |
| **Application**    | `AddUserUseCase`       | Coordonner la logique métier  |
| **Infrastructure** | `PrismaUserRepository` | Opérations de base de données |
| **Interface**      | `UserController`       | Gérer les requêtes HTTP       |

### 2. **Open/Closed Principle (OCP)**

Le code est **ouvert à l'extension, fermé à la modification**.

**Comment ajouter une nouvelle entité :**

```
1. Créer domain/nouvelle-entité.entity.ts
2. Créer application/*.usecase.ts
3. Créer infrastructure/prisma-entité.repository.ts
4. Créer interface/entité.controller.ts et entité.routes.ts
```

**Aucune modification** des fichiers existants !

### 3. **Liskov Substitution Principle (LSP)**

Les implémentations peuvent être substituées sans casser le système.

```typescript
// Le cas d'utilisation dépend de l'interface, pas l'implémentation
class AddUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
}

// Peut utiliser n'importe quelle implémentation :
new AddUserUseCase(new PrismaUserRepository()); // Production
new AddUserUseCase(new MockUserRepository()); // Tests
new AddUserUseCase(new InMemoryUserRepository()); // Tests
```

### 4. **Interface Segregation Principle (ISP)**

Les interfaces sont **spécialisées et focalisées**.

```typescript
// ❌ Mauvais : Interface monolithe
interface IRepository {
  createUser(); updateUser(); deleteUser();
  createService(); updateService(); deleteService();
}

// ✅ Bon : Interfaces spécialisées
interface IUserRepository { ... }
interface IServiceRepository { ... }
```

### 5. **Dependency Inversion Principle (DIP)**

Les modules **dépendent des abstractions, pas des implémentations**.

```
Use Cases (application)
        ↑
        | dépend de
        ↓
Interfaces (abstractions)
        ↑
        | implémente
        ↓
Infrastructure (implementations)
```

## Architecture des Layers

### 🎯 **Domain (cœur métier)**

- Entités avec règles métier
- Indépendant de tout framework
- Définit les **invariants**

Exemple : [src/modules/user/domain/user.entity.ts](src/modules/user/domain/user.entity.ts)

### ⚙️ **Application (cas d'utilisation)**

- Coordonne les opérations métier
- Dépend des interfaces, pas des implémentations
- Exécute la logique applicative

Exemple : [src/modules/user/application/add-user.usecase.ts](src/modules/user/application/add-user.usecase.ts)

### 📦 **Infrastructure (détails techniques)**

- Implémentations concrètes (Prisma, API, etc.)
- Convertit entre les modèles métier et les bases de données
- Teste facilement avec des mocks

Exemple : [src/modules/user/infrastructure/prisma-user.repository.ts](src/modules/user/infrastructure/prisma-user.repository.ts)

### 🌐 **Interface (adaptation HTTP)**

- Controllers (gèrent les requêtes HTTP)
- Routes (définissent les endpoints)
- Convertit entre HTTP et use cases

Exemple : [src/modules/user/interface/user.controller.ts](src/modules/user/interface/user.controller.ts)

## Exemple : Ajouter un nouveau module

Supposons que vous voulez ajouter un module `payment` :

### 1. Structure

```bash
mkdir -p src/modules/payment/{domain,application,infrastructure,interface}
```

### 2. Domaine (payment.entity.ts)

```typescript
export class Payment {
  id: string;
  amount: number;
  status: PaymentStatus;

  validate() {
    if (amount <= 0) throw new Error("Invalid amount");
  }
}
```

### 3. Application (payment.repository.interface.ts)

```typescript
export interface IPaymentRepository {
  create(input: CreatePaymentInput): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  update(id: string, input: UpdatePaymentInput): Promise<Payment>;
  delete(id: string): Promise<void>;
}
```

### 4. Use Cases (add-payment.usecase.ts)

```typescript
export class AddPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(input: CreatePaymentInput): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.create(input);
    return payment.toResponse();
  }
}
```

### 5. Infrastructure (prisma-payment.repository.ts)

```typescript
export class PrismaPaymentRepository implements IPaymentRepository {
  // Implémentation avec Prisma
}
```

### 6. Interface (payment.controller.ts + payment.routes.ts)

```typescript
export class PaymentController {
  constructor(private addPaymentUseCase: AddPaymentUseCase) {}

  async create(req: Request, res: Response) {
    const result = await this.addPaymentUseCase.execute(req.body);
    res.json(result);
  }
}
```

### 7. Ajouter aux routes (app.ts)

```typescript
import { paymentRoutes } from "./modules/payment";

app.use("/payments", paymentRoutes);
```

**✨ Aucune modification** des modules existants !

## Avantages de cette Architecture

| Avantage           | Explication                                        |
| ------------------ | -------------------------------------------------- |
| **Testabilité**    | Dépendances injectables, facile à mocker           |
| **Maintenabilité** | Chaque module a une responsabilité claire          |
| **Scalabilité**    | Ajouter des modules sans modifier le code existant |
| **Isolation**      | Les modules sont indépendants                      |
| **Cohésion**       | Les classes liées sont ensemble                    |
| **Découplage**     | Les modules communiquent via interfaces            |

## Flux de Données

```
Client HTTP
    ↓
Routes (interface/routes)
    ↓
Controller (interface/controller)
    ↓
Use Case (application/usecase)
    ↓
Repository Interface (application/interface)
    ↓
Repository Impl (infrastructure/repository)
    ↓
Prisma / Database
```

## Convention de Nommage

```typescript
// Entities
(User, Service, Payment);

// Interfaces
(IUserRepository, IServiceRepository);

// Use Cases
(AddUserUseCase, UpdateServiceUseCase);

// Controllers
(UserController, ServiceController);

// Routes
(user.routes.ts, service.routes.ts);

// Repositories
(PrismaUserRepository, PrismaServiceRepository);
```

## Fichiers Importants

| Fichier                                      | Description               |
| -------------------------------------------- | ------------------------- |
| [app.ts](src/app.ts)                         | Configuration Express     |
| [server.ts](src/server.ts)                   | Point d'entrée            |
| [shared/config/](src/shared/config/)         | Variables d'environnement |
| [shared/middleware/](src/shared/middleware/) | Middlewares globaux       |
| [shared/database/](src/shared/database/)     | Client Prisma             |

## Pour Démarrer

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Conclusion

Cette architecture permet de **construire des applications scalables, testables et maintenables** en respectant les principes SOLID et Clean Architecture.

Chaque module est **indépendant, cohésif et facilement testable**.
