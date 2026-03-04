// ============================================================================
// CONFIGURATION SWAGGER - SamaOuvrier API (OpenAPI 3.1)
// ============================================================================
// Documentation OpenAPI 3.1 complète pour l'API SamaOuvrier
// ============================================================================

import type { Options } from 'swagger-jsdoc';

export const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'SamaOuvrier API',
    description: `
# API de la plateforme SamaOuvrier

Plateforme de mise en relation entre clients et travailleurs qualifiés au Sénégal.

## Fonctionnalités principales

- **Authentification**: Inscription et connexion JWT
- **Gestion des utilisateurs**: Rôles CLIENT, WORKER, ADMIN
- **Missions**: Création, gestion du cycle de vie complet
- **Paiements**: Intégration PayTech avec système Escrow
- **Disputes**: Gestion des litiges entre clients et workers
- **Avis**: Système de notation des travailleurs
- **Notifications**: Notifications en temps réel

## Flux de paiement Escrow

1. Le client crée une mission
2. Le client effectue le paiement initial (prix min)
3. Le montant est held en escrow
4. Le worker accepte et complète le travail
5. Le client confirme la completion
6. Si nécessaire, le paiement final est effectué
7. L'escrow est libéré au worker (moins la commission)

## Webhooks PayTech

Les paiements sont gérés via le webhook \`/api/payments/callback\`
avec signature de vérification dans l'en-tête \`x-paytech-signature\`.
    `,
    version: '1.0.0',
    contact: {
      name: 'Support SamaOuvrier',
      email: 'support@samaouvrier.sn',
    },
    license: {
      name: 'Propriétaire',
      url: 'https://samaouvrier.sn/licenses',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Serveur de développement',
    },
    {
      url: 'https://api.samaouvrier.sn/api',
      description: 'Serveur de production',
    },
  ],
  tags: [
    { name: 'Auth', description: "Endpoints d'authentification et d'inscription" },
    { name: 'Users', description: 'Gestion des utilisateurs' },
    { name: 'Missions', description: 'Gestion des missions et du cycle de vie' },
    { name: 'Payments', description: 'Paiements et intégration PayTech' },
    { name: 'Escrow', description: 'Gestion des fonds en attente' },
    { name: 'Disputes', description: 'Gestion des litiges' },
    { name: 'Reviews', description: "Système d'avis et de notation" },
    { name: 'Services', description: 'Services proposés par les workers' },
    { name: 'Dashboard', description: 'Tableaux de bord selon le rôle' },
    { name: 'Admin', description: 'Administration et modération' },
    { name: 'Notifications', description: 'Gestion des notifications' },
    { name: 'Upload', description: 'Upload de fichiers vers Cloudinary' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: `
Jeton JWT d'authentification. Obtenu via \`/auth/login\`.
À inclure dans l'en-tête \`Authorization: Bearer <token>\`.
        `,
      },
    },
    schemas: {
      // ENUMS
      Role: {
        type: 'string',
        enum: ['ADMIN', 'CLIENT', 'WORKER'],
        description: "Rôle de l'utilisateur",
      },
      WorkerStatus: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        description: "Statut de validation d'un worker",
      },
      MissionStatus: {
        type: 'string',
        enum: ['PENDING_PAYMENT', 'PENDING_ACCEPT', 'CONTACT_UNLOCKED', 'NEGOTIATION_DONE', 'AWAITING_FINAL_PAYMENT', 'IN_PROGRESS', 'COMPLETED', 'CANCEL_REQUESTED', 'CANCELLED', 'REFUSED'],
        description: 'Statut de la mission',
      },
      PaymentStatus: {
        type: 'string',
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
        description: 'Statut du paiement',
      },
      EscrowStatus: {
        type: 'string',
        enum: ['PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
        description: "Statut de l'escrow",
      },
      DisputeStatus: {
        type: 'string',
        enum: ['PENDING', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
        description: 'Statut de la dispute',
      },
      DisputeReason: {
        type: 'string',
        enum: ['PAYMENT_ISSUE', 'WORK_NOT_DONE', 'QUALITY_UNSATISFACTORY', 'NO_SHOW', 'CANCELLATION_ISSUE', 'COMMUNICATION_ISSUE', 'OTHER'],
        description: 'Raison de la dispute',
      },
      DisputeResolution: {
        type: 'string',
        enum: ['CLIENT_WINS', 'WORKER_WINS', 'PARTIAL_REFUND', 'FULL_REFUND', 'NO_REFUND', 'DRAW'],
        description: 'Résultat de la résolution',
      },
      NotificationType: {
        type: 'string',
        enum: ['ACCOUNT_CREATED', 'ACCOUNT_PENDING_APPROVAL', 'ACCOUNT_APPROVED', 'ACCOUNT_REJECTED', 'MISSION_CREATED', 'MISSION_ACCEPTED', 'MISSION_REFUSED', 'MISSION_COMPLETED', 'MISSION_CANCELLED', 'PAYMENT_RECEIVED', 'PAYMENT_RELEASED', 'PAYMENT_REFUNDED', 'DISPUTE_OPENED', 'DISPUTE_STATUS_UPDATED', 'DISPUTE_RESOLVED', 'REVIEW_RECEIVED', 'SYSTEM_NOTIFICATION'],
        description: 'Type de notification',
      },
      NotificationStatus: {
        type: 'string',
        enum: ['UNREAD', 'READ'],
        description: 'Statut de lecture',
      },

      // AUTH SCHEMAS
      RegisterRequest: {
        type: 'object',
        required: ['nom', 'prenom', 'adresse', 'tel', 'email', 'password', 'type'],
        properties: {
          nom: { type: 'string', maxLength: 100, example: 'Diop' },
          prenom: { type: 'string', maxLength: 100, example: 'Moussa' },
          adresse: { type: 'string', maxLength: 255, example: 'Bloc 12, Parcelles Assainies, Dakar' },
          tel: { type: 'string', maxLength: 20, example: '+221771234567' },
          email: { type: 'string', format: 'email', maxLength: 255, example: 'moussa.diop@email.com' },
          password: { type: 'string', minLength: 8, maxLength: 100, example: 'Password123' },
          type: { type: 'string', enum: ['CLIENT', 'WORKER'], example: 'CLIENT' },
          professionId: { type: 'string', format: 'uuid', description: 'REQUIRED pour WORKER, FORBIDDEN pour CLIENT' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'moussa.diop@email.com' },
          password: { type: 'string', example: 'Password123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Inscription effectuée avec succès.' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nom: { type: 'string', maxLength: 100 },
          prenom: { type: 'string', maxLength: 100 },
          adresse: { type: 'string', maxLength: 255 },
          tel: { type: 'string', maxLength: 20 },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/Role' },
          workerStatus: { $ref: '#/components/schemas/WorkerStatus', nullable: true },
          professionId: { type: 'string', format: 'uuid', nullable: true },
          avatar: { type: 'string', nullable: true },
          averageRating: { type: 'number', nullable: true },
          totalReviews: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // MISSION SCHEMAS
      CreateMissionRequest: {
        type: 'object',
        required: ['workerId', 'serviceId'],
        properties: {
          workerId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          serviceId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
        },
      },
      SetFinalPriceRequest: {
        type: 'object',
        required: ['prixFinal'],
        properties: {
          prixFinal: { type: 'number', minimum: 0, example: 100000 },
        },
      },
      ProcessCancellationRequest: {
        type: 'object',
        required: ['approved'],
        properties: {
          approved: { type: 'boolean', example: true },
        },
      },
      Mission: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clientId: { type: 'string', format: 'uuid' },
          workerId: { type: 'string', format: 'uuid' },
          serviceId: { type: 'string', format: 'uuid' },
          prixMin: { type: 'number', description: 'Prix minimum (en CFA)' },
          prixMax: { type: 'number', description: 'Prix maximum (en CFA)' },
          prixFinal: { type: 'number', nullable: true },
          montantRestant: { type: 'number', nullable: true },
          status: { $ref: '#/components/schemas/MissionStatus' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // PAYMENT SCHEMAS
      CreatePaymentRequest: {
        type: 'object',
        required: ['missionId'],
        properties: {
          missionId: { type: 'string', format: 'uuid' },
        },
      },
      CreatePaymentResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              paymentId: { type: 'string', format: 'uuid' },
              escrowId: { type: 'string', format: 'uuid' },
              paymentUrl: { type: 'string', format: 'uri' },
              amount: { type: 'number', example: 50000 },
            },
          },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          missionId: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 50000 },
          currency: { type: 'string', default: 'XOF' },
          status: { $ref: '#/components/schemas/PaymentStatus' },
          paytechRef: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Escrow: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 50000 },
          workerAmount: { type: 'number', example: 45000 },
          commissionAmount: { type: 'number', example: 5000 },
          status: { $ref: '#/components/schemas/EscrowStatus' },
          releasedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      PayTechWebhookPayload: {
        type: 'object',
        properties: {
          ref_command: { type: 'string', description: 'Référence de commande PayTech' },
          token: { type: 'string', description: 'Jeton de transaction' },
          amount: { type: 'string', description: 'Montant (en CFA)' },
          currency: { type: 'string', default: 'XOF' },
          status: { type: 'string', description: 'Statut du paiement' },
          payment_method: { type: 'string', nullable: true },
          phone_number: { type: 'string', nullable: true },
          operator: { type: 'string', nullable: true },
        },
      },

      // DISPUTE SCHEMAS
      CreateDisputeRequest: {
        type: 'object',
        required: ['missionId', 'reason', 'description'],
        properties: {
          missionId: { type: 'string', format: 'uuid' },
          reason: { $ref: '#/components/schemas/DisputeReason' },
          description: { type: 'string' },
        },
      },
      Dispute: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          missionId: { type: 'string', format: 'uuid' },
          reporterId: { type: 'string', format: 'uuid' },
          reason: { $ref: '#/components/schemas/DisputeReason' },
          description: { type: 'string' },
          status: { $ref: '#/components/schemas/DisputeStatus' },
          resolution: { $ref: '#/components/schemas/DisputeResolution', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ResolveDisputeRequest: {
        type: 'object',
        required: ['resolution'],
        properties: {
          resolution: { $ref: '#/components/schemas/DisputeResolution' },
          resolutionNote: { type: 'string', nullable: true },
        },
      },
      AddEvidenceRequest: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary', description: 'Fichier à uploader' },
          description: { type: 'string', description: 'Description de la preuve' },
        },
      },

      // REVIEW SCHEMAS
      CreateReviewRequest: {
        type: 'object',
        required: ['missionId', 'rating'],
        properties: {
          missionId: { type: 'string', format: 'uuid' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', nullable: true },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          missionId: { type: 'string', format: 'uuid' },
          workerId: { type: 'string', format: 'uuid' },
          rating: { type: 'integer' },
          comment: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // SERVICE SCHEMAS
      CreateServiceRequest: {
        type: 'object',
        required: ['title', 'description', 'minPrice', 'maxPrice'],
        properties: {
          title: { type: 'string', maxLength: 200, example: 'Installation plomberie' },
          description: { type: 'string', example: 'Installation complète de plomberie' },
          minPrice: { type: 'number', minimum: 0, example: 50000 },
          maxPrice: { type: 'number', minimum: 0, example: 500000 },
        },
      },
      UpdateServiceRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', maxLength: 200 },
          description: { type: 'string' },
          minPrice: { type: 'number', minimum: 0 },
          maxPrice: { type: 'number', minimum: 0 },
        },
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          workerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // NOTIFICATION SCHEMAS
      CreateNotificationRequest: {
        type: 'object',
        required: ['userId', 'type', 'title', 'message'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          type: { $ref: '#/components/schemas/NotificationType' },
          title: { type: 'string', maxLength: 200 },
          message: { type: 'string' },
          relatedId: { type: 'string', nullable: true },
          relatedType: { type: 'string', nullable: true },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { $ref: '#/components/schemas/NotificationType' },
          title: { type: 'string' },
          message: { type: 'string' },
          status: { $ref: '#/components/schemas/NotificationStatus' },
          readAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // DASHBOARD SCHEMAS
      AdminDashboard: {
        type: 'object',
        properties: {
          users: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              clients: { type: 'integer' },
              workers: { type: 'integer' },
              pendingWorkers: { type: 'integer' },
            },
          },
          missions: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              active: { type: 'integer' },
              completed: { type: 'integer' },
              cancelled: { type: 'integer' },
            },
          },
          payments: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              successful: { type: 'number' },
              pending: { type: 'number' },
            },
          },
          disputes: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              open: { type: 'integer' },
              resolved: { type: 'integer' },
            },
          },
        },
      },
      WorkerDashboard: {
        type: 'object',
        properties: {
          missions: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              active: { type: 'integer' },
              completed: { type: 'integer' },
              cancelled: { type: 'integer' },
            },
          },
          earnings: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              pending: { type: 'number' },
              released: { type: 'number' },
            },
          },
          reputation: {
            type: 'object',
            properties: {
              averageRating: { type: 'number' },
              totalReviews: { type: 'integer' },
            },
          },
        },
      },
      ClientDashboard: {
        type: 'object',
        properties: {
          missions: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              active: { type: 'integer' },
              completed: { type: 'integer' },
              cancelled: { type: 'integer' },
            },
          },
          spending: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              pending: { type: 'number' },
              completed: { type: 'number' },
            },
          },
        },
      },

      // PROFESSION SCHEMAS
      Profession: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ERROR SCHEMAS
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      UnauthorizedError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Authentification échouée' },
          code: { type: 'string', example: 'AUTH_FAILED' },
        },
      },
      ForbiddenError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Permissions insuffisantes' },
          code: { type: 'string', example: 'FORBIDDEN' },
        },
      },
      NotFoundError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Ressource introuvable' },
          code: { type: 'string', example: 'NOT_FOUND' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: {
            type: 'object',
            properties: {
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      ConflictError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Ressource déjà existante' },
          code: { type: 'string', example: 'CONFLICT' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Requête invalide',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
      },
      Unauthorized: {
        description: 'Non autorisé - Token manquant ou invalide',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedError' } } },
      },
      Forbidden: {
        description: 'Interdit - Permissions insuffisantes',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenError' } } },
      },
      NotFound: {
        description: 'Ressource non trouvée',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundError' } } },
      },
      Conflict: {
        description: 'Conflit - Ressource déjà existante',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ConflictError' } } },
      },
    },
  },
  security: [{ BearerAuth: [] }],
};

export const swaggerOptions: Options = {
  definition: swaggerDefinition,
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/interface/*.controller.ts'],
};
