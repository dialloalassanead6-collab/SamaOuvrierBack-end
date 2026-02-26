# 🔄 Guide de Migration - Nouvelle Architecture

## Pour les Développeurs

### ❌ Ancien Système

Les fichiers étaient organisés par type (controllers, entities, repositories, usecases).

```
adapters/controllers/    ← Tous les controllers
domain/entities/         ← Toutes les entités
usecases/               ← Tous les use cases
infrastructure/         ← Tous les repositories
```

### ✅ Nouveau Système (Modulaire)

Les fichiers sont **organisés par domaine métier** (module = user, service, payment, etc.).

```
modules/user/           ← Tout ce qui concerne les utilisateurs
└─ domain/              ← Entités User
└─ application/         ← Use cases User + Interfaces
└─ infrastructure/      ← Repository Prisma
└─ interface/           ← Controller + Routes HTTP
```

## 📍 Où Trouvez les Fichiers ?

| Ancien Chemin                                      | Nouveau Chemin                                          |
| -------------------------------------------------- | ------------------------------------------------------- |
| `adapters/controllers/user.controller.ts`          | `modules/user/interface/user.controller.ts`             |
| `adapters/routes/user.routes.ts`                   | `modules/user/interface/user.routes.ts`                 |
| `domain/entities/user.entity.ts`                   | `modules/user/domain/user.entity.ts`                    |
| `usecases/interfaces/user.repository.interface.ts` | `modules/user/application/user.repository.interface.ts` |
| `usecases/users/add-user.usecase.ts`               | `modules/user/application/add-user.usecase.ts`          |
| `infrastructure/prisma-user.repository.ts`         | `modules/user/infrastructure/prisma-user.repository.ts` |
| `config/config.ts`                                 | `shared/config/config.ts`                               |
| `shared/middleware/errorHandler.middleware.ts`     | `shared/middleware/errorHandler.middleware.ts`          |
| `shared/database/prisma.client.ts`                 | `shared/database/prisma.client.ts`                      |

## 🎯 Ajouter une Nouvelle Fonctionnalité - Tutoriel

### Exemple : Créer un module `comment`

#### 1️⃣ Créer la structure

```bash
mkdir -p src/modules/comment/{domain,application,infrastructure,interface}
```

#### 2️⃣ Domain - Entité métier (src/modules/comment/domain/comment.entity.ts)

```typescript
export class Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CommentProps) {
    // Validation métier
    if (props.text.length < 3) {
      throw new Error("Comment text must be at least 3 characters");
    }
    this.id = props.id;
    this.text = props.text;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toResponse(): CommentResponse {
    return {
      id: this.id,
      text: this.text,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrisma(prismaComment: any): Comment {
    return new Comment({
      id: prismaComment.id,
      text: prismaComment.text,
      userId: prismaComment.userId,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt,
    });
  }
}

export interface CommentProps {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentResponse {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  text: string;
  userId: string;
}

export interface UpdateCommentInput {
  text?: string;
}
```

#### 3️⃣ Application - Interface (src/modules/comment/application/comment.repository.interface.ts)

```typescript
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
} from "../domain/index.js";

export interface ICommentRepository {
  create(input: CreateCommentInput): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findAll(
    skip: number,
    take: number,
  ): Promise<{ comments: Comment[]; total: number }>;
  update(id: string, input: UpdateCommentInput): Promise<Comment>;
  delete(id: string): Promise<void>;
}
```

#### 4️⃣ Application - Use Cases (src/modules/comment/application/add-comment.usecase.ts)

```typescript
import type { ICommentRepository } from "./comment.repository.interface.js";
import type { CreateCommentInput, CommentResponse } from "../domain/index.js";

export class AddCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: CreateCommentInput): Promise<CommentResponse> {
    const comment = await this.commentRepository.create(input);
    return comment.toResponse();
  }
}
```

#### 5️⃣ Infrastructure - Repository (src/modules/comment/infrastructure/prisma-comment.repository.ts)

```typescript
import { PrismaClient } from "@prisma/client";
import type { ICommentRepository } from "../application/index.js";
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
} from "../domain/index.js";
import { Comment as CommentEntity } from "../domain/index.js";

export class PrismaCommentRepository implements ICommentRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const prismaComment = await this.prisma.comment.create({
      data: { text: input.text, userId: input.userId },
    });
    return CommentEntity.fromPrisma(prismaComment);
  }

  async findById(id: string): Promise<Comment | null> {
    const prismaComment = await this.prisma.comment.findUnique({
      where: { id },
    });
    return prismaComment ? CommentEntity.fromPrisma(prismaComment) : null;
  }

  async findAll(
    skip: number,
    take: number,
  ): Promise<{ comments: Comment[]; total: number }> {
    const [prismaComments, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.comment.count(),
    ]);
    return { comments: prismaComments.map(CommentEntity.fromPrisma), total };
  }

  async update(id: string, input: UpdateCommentInput): Promise<Comment> {
    const prismaComment = await this.prisma.comment.update({
      where: { id },
      data: input,
    });
    return CommentEntity.fromPrisma(prismaComment);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}

export const commentRepository = new PrismaCommentRepository();
```

#### 6️⃣ Interface - Controller (src/modules/comment/interface/comment.controller.ts)

```typescript
import type { Request, Response, NextFunction } from "express";
import {
  AddCommentUseCase,
  GetCommentByIdUseCase,
} from "../application/index.js";
import { commentRepository } from "../infrastructure/index.js";

export class CommentController {
  private addCommentUseCase: AddCommentUseCase;
  private getCommentByIdUseCase: GetCommentByIdUseCase;

  constructor() {
    this.addCommentUseCase = new AddCommentUseCase(commentRepository);
    this.getCommentByIdUseCase = new GetCommentByIdUseCase(commentRepository);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await this.addCommentUseCase.execute(req.body);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const comment = await this.getCommentByIdUseCase.execute(req.params.id);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
```

#### 7️⃣ Interface - Routes (src/modules/comment/interface/comment.routes.ts)

```typescript
import { Router } from "express";
import { commentController } from "./comment.controller.js";

const router = Router();

router.post("/", (req, res, next) => commentController.create(req, res, next));
router.get("/:id", (req, res, next) =>
  commentController.getById(req, res, next),
);

export default router;
```

#### 8️⃣ Ajouter les exports du module (src/modules/comment/index.ts)

```typescript
export * from "./domain/index.js";
export * from "./application/index.js";
export * from "./infrastructure/index.js";
export * from "./interface/index.js";
```

#### 9️⃣ Ajouter les exports des sous-dossiers (index.ts)

```typescript
// domain/index.ts
export * from "./comment.entity.js";

// application/index.ts
export type { ICommentRepository } from "./comment.repository.interface.js";
export { AddCommentUseCase } from "./add-comment.usecase.js";
// ... autres exports

// infrastructure/index.ts
export {
  commentRepository,
  PrismaCommentRepository,
} from "./prisma-comment.repository.js";

// interface/index.ts
export { commentController, CommentController } from "./comment.controller.js";
export { default as commentRoutes } from "./comment.routes.js";
```

#### 🔟 Ajouter la route dans app.ts

```typescript
import { commentRoutes } from "./modules/comment/index.js";

app.use("/comments", commentRoutes);
```

✨ **Voilà ! Votre nouveau module est prêt !**

## 🧪 Tester le Nouveau Module

```bash
# Compilation
npm run build

# Développement
npm run dev

# Test avec curl
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{"text": "Great post!", "userId": "123"}'
```

## 📋 Checklist pour un Nouveau Module

- [ ] Créer la structure `modules/nom/{domain,application,infrastructure,interface}`
- [ ] Créer l'entité domain
- [ ] Créer l'interface repository
- [ ] Créer les use cases
- [ ] Implémenter le repository Prisma
- [ ] Créer le controller
- [ ] Créer les routes
- [ ] Ajouter les exports dans chaque index.ts
- [ ] Ajouter la route dans app.ts
- [ ] Tester avec `npm run build`
- [ ] Tester avec `npm run dev`

## 🔗 Les Imports Doivent Respecter

```typescript
// ✅ BON : Importer depuis les modules propres
import { userRoutes } from "./modules/user/index.js";
import { serviceRoutes } from "./modules/service/index.js";
import { IUserRepository } from "./modules/user/application/index.js";

// ❌ MAUVAIS : Importer d'autres modules
import { UserController } from "./modules/user/interface/user.controller.js";
import { serviceRepository } from "./modules/service/infrastructure/index.js";
```

Les imports doivent rester **dans les limites du module** ou utiliser les **exports publics** (index.ts).

## 🎓 Résumé

| Ancien                  | Nouveau                                 |
| ----------------------- | --------------------------------------- |
| Controllers éparpillés  | Tout dans `modules/nom/interface/`      |
| Entities éparpillées    | Tout dans `modules/nom/domain/`         |
| Use cases éparpillés    | Tout dans `modules/nom/application/`    |
| Repositories éparpillés | Tout dans `modules/nom/infrastructure/` |
| Difficile à comprendre  | Clair et organisé                       |
| Risque de couplage      | Modules indépendants                    |

## 📞 Questions ?

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour plus de détails sur les principes appliqués.
