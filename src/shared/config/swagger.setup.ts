// ============================================================================
// SWAGGER SETUP - Configuration de Swagger UI
// ============================================================================
// Configure l'interface Swagger UI pour la documentation de l'API
// ============================================================================

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger.config.js';
import { config } from './config.js';

// Generation des specifications OpenAPI
const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * Configure Swagger UI pour l'application Express
 * @param app Application Express
 */
export const setupSwagger = (app: express.Application): void => {
  // Route pour le fichier JSON OpenAPI (doit etre avant swaggerUi.serve)
  app.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });

  // Route pour la documentation Swagger UI
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { font-size: 2.5em; }
        .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
        .swagger-ui .opblock-tag { font-size: 1.3em; font-weight: 600; }
        .swagger-ui .opblock .opblock-summary-description { font-size: 1em; }
        .swagger-ui .parameters .parameter-name { font-weight: 500; }
        .swagger-ui .response-col_status__200 { color: #10b981; }
        .swagger-ui .response-col_status__201 { color: #10b981; }
        .swagger-ui .response-col_status__400 { color: #f59e0b; }
        .swagger-ui .response-col_status__401 { color: #ef4444; }
        .swagger-ui .response-col_status__403 { color: #ef4444; }
        .swagger-ui .response-col_status__404 { color: #f59e0b; }
        .swagger-ui .response-col_status__409 { color: #f59e0b; }
        .swagger-ui .response-col_status__500 { color: #ef4444; }
      `,
      customSiteTitle: 'SamaOuvrier API - Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        syntaxHighlight: {
          activated: true,
          theme: 'monokai',
        },
        requestInterceptor: (req: Request) => {
          // Ajouter le prefixe API si necessaire
          return req;
        },
      },
    })
  );

  console.log(`Documentation Swagger disponible sur: http://localhost:${config.PORT}/docs`);
};
