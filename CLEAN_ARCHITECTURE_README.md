# Implémentation de l'Architecture Propre

Ce projet a été refactorisé pour suivre les principes de l'Architecture Propre et les modèles de conception SOLID.

## Vue d'ensemble

La nouvelle architecture sépare le codebase en quatre couches distinctes :

```
src/
├── domain/           # Logique métier principale (couche la plus interne)
│   ├── entities/     # Objets métier avec règles et invariants
│   └── ...
├── usecases/        # Logique métier applicative
│   ├── interfaces/  # Contrats/abstractions (DIP)
│   ├── users/       # Cas d'utilisation utilisateur
│   └── services/    # Cas d'utilisation service
├── infrastructure/  # Préoccupations externes (couche la plus externe)
│   └── database/    # Implémentations Prisma
└── adapters/        # Adaptateurs d'interface
    └── controllers/ # Gestionnaires HTTP
```

## Principes SOLID Appliqués

### 1. Principe de Responsabilité Unique (SRP)

Chaque classe n'a qu'une seule raison de changer :

| Couche            | Exemple                | Responsabilité                             |
| ----------------- | ---------------------- | ------------------------------------------ |
| Domaine           | Entité `User`          | Règles métier et invariants utilisateur    |
| Cas d'utilisation | `AddUserUseCase`       | Logique de création utilisateur uniquement |
| Infrastructure    | `PrismaUserRepository` | Opérations de base de données uniquement   |
| Adaptateurs       | `UserController`       | Gestion des requêtes/réponses HTTP         |

### 2. Principe Ouvert/Fermé (OCP)

Le code est ouvert pour l'extension, fermé pour la modification :

- **Ajouter de nouvelles entités** : Créer de nouveaux fichiers dans `domain/entities/`
- **Ajouter de nouveaux cas d'utilisation** : Créer de nouveaux fichiers dans `usecases/`
- **Ajouter de nouveaux dépôts** : Implémenter l'interface dans `infrastructure/`

Exemple : Ajout d'une nouvelle entité `Payment` :

```typescript
// 1. Créer l'entité dans domain/entities/payment.entity.ts
// 2. Créer l'interface dans usecases/interfaces/payment.repository.interface.ts
// 3. Créer les cas d'utilisation dans usecases/payments/
// 4. Créer l'implémentation dans infrastructure/database/
```

### 3. Principe de Substitution de Liskov (LSP)

N'importe quelle implémentation d'une interface peut être substituée sans casser le système :

```typescript
// Le cas d'utilisation dépend de l'interface (abstraction)
class AddUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
}

// Peut utiliser n'importe quelle implémentation :
const useCase1 = new AddUserUseCase(new PrismaUserRepository()); // Production
const useCase2 = new AddUserUseCase(new MockUserRepository()); // Test
const useCase3 = new AddUserUseCase(new InMemoryUserRepository()); // Test
```

### 4. Principe de Ségrégation des Interfaces (ISP)

Les interfaces sont spécialisées et focalisées :

```typescript
// Au lieu d'une grande interface :
interface IRepository {
  createUser();
  updateUser();
  deleteUser();
  createService();
  updateService();
  deleteService();
}

// Nous avons des interfaces spécialisées :
interface IUserRepository {
  findByEmail();
  findById();
  create();
  update();
  delete();
}

interface IServiceRepository {
  findById();
  create();
  update();
  delete();
}
```

### 5. Principe d'Inversion de Dépendance (DIP)

Les modules de haut niveau ne dépendent pas des modules de bas niveau. Les deux dépendent des abstractions :

```
        ┌─────────────────────┐
        │   Couche Cas d'Usage │  ← Haut niveau (dépend de l'abstraction)
        │  (AddUserUseCase)   │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  IUserRepository    │  ← Abstraction (interface)
        │     (interface)     │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  PrismaUserRepo     │  ← Bas niveau (implémente l'abstraction)
        │ (implémentation)    │
        └─────────────────────┘
```

## Flux des Dépendances

Dans l'Architecture Propre, les dépendances circulent vers l'intérieur :

```
    ┌────────────────────────────────────┐
    │           Adaptateurs              │  ← HTTP, CLI, etc.
    │    (Contrôleurs, Routes)          │
    └──────────────┬─────────────────────┘
                   │
    ┌──────────────▼─────────────────────┐
    │           Cas d'Usage              │  ← Logique métier
    │    (AddUser, GetUsers, etc.)       │
    └──────────────┬─────────────────────┘
                   │
    ┌──────────────▼─────────────────────┐
    │           Domaine                  │  ← Règles métier principales
    │      (Entités, Interfaces)         │
    └────────────────────────────────────┘
                   ▲
                   │
    ┌──────────────┴─────────────────────┐
    │         Infrastructure              │  ← Préoccupations externes
    │   (Prisma, APIs Externes)          │
    └────────────────────────────────────┘
```

## Comment Remplacer les Implémentations

### Exemple : Passer de Prisma à MongoDB

1. **Créer une nouvelle implémentation de dépôt** :

```typescript
// src/infrastructure/database/mongo-user.repository.ts
export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Implémentation MongoDB
  }
  // ... implémenter toutes les méthodes
}
```

2. **Mettre à jour l'injection de dépendance** :

```typescript
// Dans votre contrôleur ou racine de composition
const userRepository = new MongoUserRepository();
const addUserUseCase = new AddUserUseCase(userRepository);
```

C'est tout ! Le cas d'utilisation n'a pas besoin de changer du tout.

### Exemple : Utilisation d'un Dépôt en Mémoire pour les Tests

```typescript
// Pour les tests, vous pouvez créer une implémentation en mémoire
class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async create(input: CreateUserInput): Promise<User> {
    const user = new User({ ...input, id: uuid() });
    this.users.set(user.id, user);
    return user;
  }
  // ...
}

// Dans les tests
const testRepo = new InMemoryUserRepository();
const useCase = new AddUserUseCase(testRepo);
const result = await useCase.execute({
  email: "test@test.com",
  password: "123",
});
```

## Structure du Projet

### Couche Domaine (`src/domain/')

Contient :

- **Entités** : Objets métier avec validation et règles métier
- TypeScript pur, sans dépendances aux frameworks

```typescript
// Exemple : Entité User
export class User {
  constructor(private props: UserProps) {
    this.validateEmail(props.email);
  }

  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
}
```

### Couche Cas d'Utilisation (`src/usecases/`)

Contient :

- **Interfaces** : Contrats pour l'accès aux données
- **Cas d'Utilisation** : Règles métier spécifiques à l'application

```typescript
// Exemple : AddUserUseCase
export class AddUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<UserResponse> {
    // Logique métier
  }
}
```

### Couche Infrastructure (`src/infrastructure/`)

Contient :

- **Implémentations de base de données** : Prisma, MongoDB, etc.
- **Services externes** : Fournisseurs de paiement, services de notification

```typescript
// Exemple : Dépôt Prisma
export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Code spécifique à Prisma
  }
}
```

### Couche Adaptateurs (`src/adapters/`)

Contient :

- **Contrôleurs** : Gèrent les requêtes HTTP
- **Routes** : Définissent les points de terminaison API
- **DTOs** : Objets de transfert de données

```typescript
// Exemple : Contrôleur
export class UserController {
  async create(req: Request, res: Response) {
    const user = await addUserUseCase.execute(req.body);
    res.status(201).json(user);
  }
}
```

## Avantages des Tests

Avec cette architecture, les tests deviennent beaucoup plusfaciles :

1. **Tests unitaires** pour les cas d'utilisation n'ont pas besoin de base de données
2. **Mock** n'importe quelle implémentation de dépôt
3. **Exécution rapide** des tests
4. **Tests fiables** (pas de dépendances externes)

```typescript
// Tester le cas d'utilisation sans base de données
const mockRepo = new MockUserRepository();
const useCase = new AddUserUseCase(mockRepo);
const result = await useCase.execute({
  email: "test@test.com",
  password: "123",
});
```

## Guide de Migration

Pour migrer les modules existants vers cette architecture :

1. **Créer une entité domaine** à partir des DTOs existants
2. **Créer une interface de dépôt** basée sur le dépôt existant
3. **Créer des cas d'utilisation** à partir des méthodes de service existantes
4. **Mettre à jour le contrôleur** pour utiliser les nouveaux cas d'utilisation
5. **Garder les routes existantes** (elles n'ont pas besoin de modifications)

## Crédits

Cette architecture est inspirée de :

- Clean Architecture de Robert C. Martin
- Modèle de Dépôt de Microsoft
- Conception Dirigée par le Domaine (DDD)
