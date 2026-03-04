/**
 * ============================================================================
 * SWAGGER CONFIGURATION - OpenAPI 3.1
 * ============================================================================
 * Configuration pour swagger-jsdoc afin de générer la documentation OpenAPI
 * depuis les annotations JSDoc dans les controllers
 * ============================================================================
 */

import type { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
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
      contact: {
        name: 'Support SamaOuvrier',
        email: 'support@samaouvrier.sn',
      },
      license: {
        name: 'Propriétaire',
        url: 'https://samaouvrier.sn/licenses',
      },
      version: '1.0.0',
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
      { name: 'Auth', description: 'Endpoints d\'authentification et d\'inscription' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Missions', description: 'Gestion des missions et du cycle de vie' },
      { name: 'Payments', description: 'Paiements et intégration PayTech' },
      { name: 'Escrow', description: 'Gestion des fonds en attente' },
      { name: 'Disputes', description: 'Gestion des litiges' },
      { name: 'Reviews', description: 'Système d\'avis et de notation' },
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
    },
    paths: {},
  },
  apis: [
    // Routes avec annotations JSDoc
    './src/modules/**/*.routes.ts',
    // Controllers
    './src/modules/**/interface/*.controller.ts',
  ],
};

export default swaggerOptions;
