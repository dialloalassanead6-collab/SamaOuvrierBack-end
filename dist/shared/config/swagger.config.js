// ============================================================================
// CONFIGURATION SWAGGER - SamaOuvrier API
// ============================================================================
// Documentation OpenAPI 3.0 pour l'API SamaOuvrier
// ============================================================================
export const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'SamaOuvrier API',
        description: `
# API officielle de la plateforme SamaOuvrier

## A propos
SamaOuvrier est une plateforme de mise en relation entre clients et prestataires de services au Senegal.

## Format des reponses
Toutes les reponses de l'API suivent un format standardise :

**Succes :**
{
  "success": true,
  "message": "Message en francais",
  "data": { ... }
}

**Erreur :**
{
  "success": false,
  "message": "Message en francais",
  "code": "CODE_ERREUR"
}

## Roles des utilisateurs
- CLIENT : Client cherchant des prestataires de services
- WORKER : Prestataire de services
- ADMIN : Administrateur de la plateforme

## Authentification
L'API utilise l'authentification JWT (JSON Web Token). 
Pour acceder aux routes protegees, incluez le token dans l'en-tete :
Authorization: Bearer <votre_token>
    `,
        version: '1.0.0',
        contact: {
            name: 'Support SamaOuvrier',
            email: 'support@samaouvrier.com',
        },
        license: {
            name: 'Proprietaire',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Serveur de developpement local',
        },
    ],
    tags: [
        {
            name: 'Authentification',
            description: 'Operations authentification (inscription, connexion)',
        },
        {
            name: 'Utilisateurs',
            description: 'Gestion des utilisateurs (CRUD)',
        },
        {
            name: 'Professions',
            description: 'Gestion des professions (ADMIN uniquement)',
        },
        {
            name: 'Services',
            description: 'Gestion des services proposes par les travailleurs',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token obtenu via /auth/login ou /auth/register',
            },
        },
        schemas: {
            // SCHEMAS D'AUTHENTIFICATION
            RegisterRequest: {
                type: 'object',
                required: ['nom', 'prenom', 'adresse', 'tel', 'email', 'password', 'type'],
                properties: {
                    nom: {
                        type: 'string',
                        description: 'Nom de famille',
                        example: 'Diop',
                    },
                    prenom: {
                        type: 'string',
                        description: 'Prenom',
                        example: 'Moussa',
                    },
                    adresse: {
                        type: 'string',
                        description: 'Adresse complete',
                        example: 'Bloc 12, Parcelles Assainies, Dakar',
                    },
                    tel: {
                        type: 'string',
                        description: 'Numero de telephone',
                        example: '+221771234567',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Adresse email',
                        example: 'moussa.diop@email.com',
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        description: 'Mot de passe (min 8 caracteres, 1 lettre, 1 chiffre)',
                        example: 'Password123',
                    },
                    type: {
                        type: 'string',
                        enum: ['CLIENT', 'WORKER'],
                        description: 'Type de compte',
                        example: 'CLIENT',
                    },
                    professionId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID de la profession (REQUIRED pour WORKER, FORBIDDEN pour CLIENT)',
                        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Adresse email',
                        example: 'moussa.diop@email.com',
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        description: 'Mot de passe',
                        example: 'Password123',
                    },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true,
                    },
                    message: {
                        type: 'string',
                        example: 'Connexion reussie.',
                    },
                    data: {
                        type: 'object',
                        properties: {
                            user: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                                    nom: { type: 'string', example: 'Diop' },
                                    prenom: { type: 'string', example: 'Moussa' },
                                    adresse: { type: 'string', example: 'Dakar' },
                                    tel: { type: 'string', example: '+221771234567' },
                                    email: { type: 'string', example: 'moussa@email.com' },
                                    role: { type: 'string', enum: ['ADMIN', 'CLIENT', 'WORKER'], example: 'CLIENT' },
                                    workerStatus: { type: 'string', nullable: true, example: null },
                                    professionId: { type: 'string', nullable: true, example: null },
                                    createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
                                    updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
                                },
                            },
                            token: {
                                type: 'string',
                                description: 'JWT token authentification',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            },
                        },
                    },
                },
            },
            // SCHEMAS D'UTILISATEUR
            UserResponse: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'ID unique utilisateur' },
                    nom: { type: 'string', description: 'Nom de famille' },
                    prenom: { type: 'string', description: 'Prenom' },
                    adresse: { type: 'string', description: 'Adresse' },
                    tel: { type: 'string', description: 'Telephone' },
                    email: { type: 'string', format: 'email', description: 'Email' },
                    role: { type: 'string', enum: ['ADMIN', 'CLIENT', 'WORKER'], description: 'Role utilisateur' },
                    workerStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], nullable: true },
                    professionId: { type: 'string', format: 'uuid', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            CreateUserRequest: {
                type: 'object',
                required: ['nom', 'prenom', 'adresse', 'tel', 'email', 'password'],
                properties: {
                    nom: { type: 'string', example: 'Sall' },
                    prenom: { type: 'string', example: 'Fatou' },
                    adresse: { type: 'string', example: 'Point E, Dakar' },
                    tel: { type: 'string', example: '+221761234567' },
                    email: { type: 'string', format: 'email', example: 'fatou.sall@email.com' },
                    password: { type: 'string', format: 'password', example: 'Password123' },
                    role: { type: 'string', enum: ['ADMIN', 'CLIENT', 'WORKER'], example: 'CLIENT' },
                },
            },
            UpdateUserRequest: {
                type: 'object',
                properties: {
                    nom: { type: 'string', example: 'Diop' },
                    prenom: { type: 'string', example: 'Ali' },
                    adresse: { type: 'string', example: 'Fann, Dakar' },
                    tel: { type: 'string', example: '+221701234567' },
                    email: { type: 'string', format: 'email', example: 'ali.diop@email.com' },
                    role: { type: 'string', enum: ['ADMIN', 'CLIENT', 'WORKER'], example: 'WORKER' },
                },
            },
            UserListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Utilisateurs recuperes avec succes.' },
                    data: {
                        type: 'object',
                        properties: {
                            users: { type: 'array', items: { type: 'object' } },
                            pagination: {
                                type: 'object',
                                properties: {
                                    page: { type: 'integer', example: 1 },
                                    limit: { type: 'integer', example: 10 },
                                    total: { type: 'integer', example: 25 },
                                    totalPages: { type: 'integer', example: 3 },
                                },
                            },
                        },
                    },
                },
            },
            // SCHEMAS DE PROFESSION
            Profession: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string', example: 'Plombier' },
                    description: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            CreateProfessionRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', description: 'Nom de la profession', example: 'Electricien' },
                    description: { type: 'string', description: 'Description (optionnelle)' },
                },
            },
            // SCHEMAS DE SERVICE
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
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            CreateServiceRequest: {
                type: 'object',
                required: ['title', 'description', 'minPrice', 'maxPrice', 'workerId'],
                properties: {
                    title: { type: 'string', example: 'Installation plomberie' },
                    description: { type: 'string', example: 'Installation complete de plomberie' },
                    minPrice: { type: 'number', example: 50000 },
                    maxPrice: { type: 'number', example: 500000 },
                    workerId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                },
            },
            UpdateServiceRequest: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    minPrice: { type: 'number' },
                    maxPrice: { type: 'number' },
                },
            },
            // SCHEMAS D'ERREURS
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', description: 'Message erreur en francais' },
                    code: { type: 'string', description: 'Code erreur personnalise' },
                },
            },
            ValidationErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Erreur de validation des donnees.' },
                    code: { type: 'string', example: 'VALIDATION_ERROR' },
                    errors: { type: 'object', description: 'Details erreurs validation' },
                },
            },
            UnauthorizedError: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Token authentification manquant.' },
                    code: { type: 'string', example: 'UNAUTHORIZED' },
                },
            },
            ForbiddenError: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Acces refuse.' },
                    code: { type: 'string', example: 'FORBIDDEN' },
                },
            },
            NotFoundError: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Utilisateur introuvable.' },
                    code: { type: 'string', example: 'RESOURCE_NOT_FOUND' },
                },
            },
            ConflictError: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Cette adresse email est deja utilisee.' },
                    code: { type: 'string', example: 'AUTH_EMAIL_EXISTS' },
                },
            },
        },
        responses: {
            BadRequest: {
                description: 'Requete invalide',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                    },
                },
            },
            Unauthorized: {
                description: 'Non autorise - Token manquant ou invalide',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UnauthorizedError' },
                    },
                },
            },
            Forbidden: {
                description: 'Interdit - Permissions insuffisantes',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ForbiddenError' },
                    },
                },
            },
            NotFound: {
                description: 'Ressource non trouvee',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/NotFoundError' },
                    },
                },
            },
            Conflict: {
                description: 'Conflit - Ressource deja existante',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ConflictError' },
                    },
                },
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};
export const swaggerOptions = {
    definition: swaggerDefinition,
    apis: ['./src/modules/**/*.ts'],
};
//# sourceMappingURL=swagger.config.js.map