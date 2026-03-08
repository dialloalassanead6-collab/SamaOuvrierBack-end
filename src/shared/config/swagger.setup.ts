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
        .swagger-ui .info .title { font-size: 2.5em; font-weight: 700; color: #1a73e8; }
        .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; color: #555; }
        .swagger-ui .opblock-tag { font-size: 1.3em; font-weight: 600; color: #1a73e8; border-bottom: 2px solid #e8f0fe; padding-bottom: 8px; margin-bottom: 12px; }
        .swagger-ui .opblock .opblock-summary-description { font-size: 1em; }
        .swagger-ui .parameters .parameter-name { font-weight: 500; color: #333; }
        .swagger-ui .response-col_status__200 { color: #10b981; font-weight: 600; }
        .swagger-ui .response-col_status__201 { color: #10b981; font-weight: 600; }
        .swagger-ui .response-col_status__400 { color: #f59e0b; font-weight: 600; }
        .swagger-ui .response-col_status__401 { color: #ef4444; font-weight: 600; }
        .swagger-ui .response-col_status__403 { color: #ef4444; font-weight: 600; }
        .swagger-ui .response-col_status__404 { color: #f59e0b; font-weight: 600; }
        .swagger-ui .response-col_status__409 { color: #f59e0b; font-weight: 600; }
        .swagger-ui .response-col_status__500 { color: #ef4444; font-weight: 600; }
        .swagger-ui .btn.authorize { background-color: #1a73e8; border-color: #1a73e8; color: white; }
        .swagger-ui .btn.authorize:hover { background-color: #1557b0; }
        .swagger-ui .info { margin-bottom: 30px; }
        .swagger-ui .scheme-container { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .swagger-ui .opblock { border-radius: 8px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .swagger-ui .opblock:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
        .swagger-ui select { border: 1px solid #ddd; border-radius: 4px; }
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
