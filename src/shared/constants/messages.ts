// ============================================================================
// CONSTANTES DE MESSAGES - Application SamaOuvrier (100% Francophone)
// ============================================================================
// Ce fichier centralise tous les messages de l'application.
// Pour une future internationalisation (i18n), ces messages pourraient être
// déplacés dans des fichiers de locale (ex: fr.json, en.json).
// ============================================================================

// ----------------------------------------------------------------------------
// MESSAGES D'AUTHENTIFICATION
// ----------------------------------------------------------------------------
export const AUTH_MESSAGES = {
  // Authentification
  LOGIN_SUCCESS: 'Connexion réussie.',
  LOGOUT_SUCCESS: 'Déconnexion réussie.',
  
  // Identifiants
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  
  // Statut du compte worker
  ACCOUNT_PENDING: 'Votre compte est en attente de validation par l\'administrateur.',
  ACCOUNT_REJECTED: 'Votre compte a été refusé par l\'administrateur.',
  ACCOUNT_APPROVED: 'Votre compte a été approuvé.',
  
  // Statut du compte (banni, supprimé)
  ACCOUNT_BANNED: 'Votre compte a été banni. Veuillez contacter l\'administrateur.',
  ACCOUNT_DELETED: 'Votre compte a été supprimé.',
  
  // Inscription
  REGISTER_SUCCESS: 'Inscription effectuée avec succès.',
  REGISTER_CLIENT_SUCCESS: 'Inscription en tant que client effectuée avec succès.',
  REGISTER_WORKER_SUCCESS: 'Inscription en tant que prestataire effectuée avec succès. Votre compte est en attente de validation.',
  
  // Erreurs d'inscription
  EMAIL_ALREADY_EXISTS: 'Cette adresse email est déjà utilisée.',
  PROFESSION_NOT_FOUND: 'Profession introuvable.',
  NO_PROFESSION_AVAILABLE: 'Aucune profession disponible pour le moment. Veuillez contacter l\'administrateur.',
  ADMIN_REGISTRATION_FORBIDDEN: 'L\'inscription en tant qu\'administrateur n\'est pas autorisée.',
  
  // Token
  TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  TOKEN_INVALID: 'Token invalide ou expiré.',
  TOKEN_MISSING: 'Token d\'authentification manquant.',
  
  // Accès
  ACCESS_DENIED: 'Accès refusé.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
} as const;

// ----------------------------------------------------------------------------
// MESSAGES DE SERVICES (PROFESSIONS)
// ----------------------------------------------------------------------------
export const SERVICE_MESSAGES = {
  // Succès
  SERVICE_CREATED: 'Service créé avec succès.',
  SERVICE_UPDATED: 'Service mis à jour avec succès.',
  SERVICE_DELETED: 'Service supprimé avec succès.',
  SERVICES_FOUND: 'Services récupérés avec succès.',
  
  // Erreurs
  SERVICE_NOT_FOUND: 'Service introuvable.',
  SERVICE_ALREADY_EXISTS: 'Ce service existe déjà.',
  NO_SERVICES_AVAILABLE: 'Aucun service disponible pour le moment.',
} as const;

// ----------------------------------------------------------------------------
// MESSAGES D'UTILISATEURS
// ----------------------------------------------------------------------------
export const USER_MESSAGES = {
  // Succès
  USER_CREATED: 'Utilisateur créé avec succès.',
  USER_UPDATED: 'Utilisateur mis à jour avec succès.',
  USER_DELETED: 'Utilisateur supprimé avec succès.',
  USERS_FOUND: 'Utilisateurs récupérés avec succès.',
  USER_FOUND: 'Utilisateur trouvé.',
  
  // Erreurs
  USER_NOT_FOUND: 'Utilisateur introuvable.',
  USER_ALREADY_EXISTS: 'Cet utilisateur existe déjà.',
  NO_USERS_FOUND: 'Aucun utilisateur trouvé.',
  
  // Actions
  USER_APPROVED: 'Compte utilisateur approuvé.',
  USER_REJECTED: 'Compte utilisateur rejeté.',
  
  // Status - Succès
  USER_ACTIVATED: 'Compte utilisateur activé avec succès.',
  USER_DEACTIVATED: 'Compte utilisateur désactivé avec succès.',
  USER_BANNED: 'Utilisateur banni avec succès.',
  USER_UNBANNED: 'Utilisateur débanni avec succès.',
  USER_SOFT_DELETED: 'Utilisateur supprimé (soft delete) avec succès.',
  USER_RESTORED: 'Utilisateur restauré avec succès.',
  
  // Status - Erreurs
  USER_ALREADY_ACTIVE: 'Le compte utilisateur est déjà actif.',
  USER_ALREADY_INACTIVE: 'Le compte utilisateur est déjà désactivé.',
  USER_ALREADY_BANNED: 'L\'utilisateur est déjà banni.',
  USER_ALREADY_UNBANNED: 'L\'utilisateur n\'est pas banni.',
  USER_ALREADY_DELETED: 'L\'utilisateur est déjà supprimé.',
  USER_IS_BANNED: 'Ce compte est banni et ne peut pas effectuer cette action.',
  USER_IS_DELETED: 'Ce compte a été supprimé.',
  CANNOT_MODIFY_SELF_BANNED: 'Vous ne pouvez pas modifier votre propre compte car il est banni.',
  CANNOT_MODIFY_DELETED: 'Impossible de modifier un utilisateur supprimé.',
} as const;

// ----------------------------------------------------------------------------
// MESSAGES DE VALIDATION WORKER PAR ADMIN
// ----------------------------------------------------------------------------
export const WORKER_VALIDATION_MESSAGES = {
  // Succès
  WORKER_APPROVED: 'Le travailleur a été validé avec succès.',
  WORKER_REJECTED: 'Le travailleur a été rejeté.',
  WORKER_REAPPLY_SUCCESS: 'Votre demande de validation a été renvoyée avec succès.',
  WORKERS_LISTED: 'Liste des travailleurs récupérée avec succès.',
  
  // Erreurs worker
  WORKER_NOT_FOUND: 'Travailleur introuvable.',
  WORKER_ALREADY_APPROVED: 'Ce travailleur est déjà validé.',
  WORKER_ALREADY_REJECTED: 'Ce travailleur est déjà rejeté.',
  WORKER_INVALID_STATUS: 'Action impossible dans l\'état actuel du compte.',
  WORKER_NOT_PENDING: 'Ce travailleur ne peut pas être validé car il n\'est pas en attente.',
  WORKER_NOT_REJECTED: 'Ce travailleur ne peut pas refaire une demande car il n\'a pas été rejeté.',
  
  // Erreurs reason
  REJECTION_REASON_REQUIRED: 'La raison du rejet est obligatoire.',
  REJECTION_REASON_TOO_LONG: 'La raison du rejet ne doit pas dépasser 1000 caractères.',
  REJECTION_REASON_INVALID: 'La raison du rejet doit être une chaîne de caractères valide.',
  
  // Accès
  WORKER_ACCESS_DENIED: 'Accès refusé. Rôle WORKER requis.',
  ADMIN_ACCESS_DENIED: 'Accès refusé. Rôle ADMIN requis.',
} as const;

// ----------------------------------------------------------------------------
// MESSAGES DE VALIDATION GÉNÉRAUX
// ----------------------------------------------------------------------------
export const VALIDATION_MESSAGES = {
  // Champs requis
  FIELD_REQUIRED: 'Ce champ est requis.',
  EMAIL_REQUIRED: 'L\'email est requis.',
  PASSWORD_REQUIRED: 'Le mot de passe est requis.',
  NAME_REQUIRED: 'Le nom est requis.',
  ADDRESS_REQUIRED: 'L\'adresse est requise.',
  PHONE_REQUIRED: 'Le numéro de téléphone est requis.',
  
  // Format invalide
  EMAIL_INVALID: 'Format d\'email invalide.',
  PHONE_INVALID: 'Format de numéro de téléphone invalide.',
  UUID_INVALID: 'Format d\'identifiant invalide.',
  
  // Longueur
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  PASSWORD_TOO_LONG: 'Le mot de passe ne doit pas dépasser 100 caractères.',
  NAME_TOO_LONG: 'Le nom ne doit pas dépasser 100 caractères.',
  ADDRESS_TOO_LONG: 'L\'adresse ne doit pas dépasser 255 caractères.',
  
  // Contenu
  PASSWORD_WEAK: 'Le mot de passe doit contenir au moins une lettre et un chiffre.',
} as const;

// ----------------------------------------------------------------------------
// MESSAGES D'ERREURS SYSTÈME
// ----------------------------------------------------------------------------
export const SYSTEM_MESSAGES = {
  // Erreurs HTTP
  OK: 'Opération réussie.',
  CREATED: 'Ressource créée avec succès.',
  NO_CONTENT: 'Aucune donnée à traiter.',
  
  // Erreurs serveur
  INTERNAL_ERROR: 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.',
  SERVER_UNAVAILABLE: 'Le serveur est temporairement indisponible. Veuillez réessayer plus tard.',
  
  // Erreurs base de données
  DB_CONNECTION_ERROR: 'Erreur de connexion à la base de données.',
  DB_CONSTRAINT_ERROR: 'Violation de contrainte de base de données.',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Trop de requêtes. Veuillez patienter quelques instants.',
  
  // Route non trouvée
  ROUTE_NOT_FOUND: 'Route non trouvée.',
  METHOD_NOT_ALLOWED: 'Méthode non autorisée pour cette route.',
  
  // Token
  TOKEN_INVALID: 'Token invalide ou expiré.',
  TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
} as const;

// ----------------------------------------------------------------------------
// CODES D'ERREUR PERSONNALISÉS
// ----------------------------------------------------------------------------
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_PENDING: 'AUTH_ACCOUNT_PENDING',
  ACCOUNT_REJECTED: 'AUTH_ACCOUNT_REJECTED',
  EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  PROFESSION_NOT_FOUND: 'SERVICE_PROFESSION_NOT_FOUND',
  NO_PROFESSION: 'SERVICE_NO_PROFESSION',
  ADMIN_FORBIDDEN: 'AUTH_ADMIN_FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Ressources
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  
  // Système
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DB_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  
  // Accès
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // User Status
  USER_BANNED: 'USER_BANNED',
  USER_DELETED: 'USER_DELETED',
  USER_SELF_FORBIDDEN: 'USER_SELF_FORBIDDEN',
} as const;

// ----------------------------------------------------------------------------
// TYPE EXPORTÉ POUR UTILISATION DANS LES SCHÉMAS ZOD
// ----------------------------------------------------------------------------
export type MessageKey = 
  | keyof typeof AUTH_MESSAGES
  | keyof typeof SERVICE_MESSAGES
  | keyof typeof USER_MESSAGES
  | keyof typeof WORKER_VALIDATION_MESSAGES
  | keyof typeof VALIDATION_MESSAGES
  | keyof typeof SYSTEM_MESSAGES;

// ----------------------------------------------------------------------------
// MAPPAGE DES CODES HTTP
// ----------------------------------------------------------------------------
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ----------------------------------------------------------------------------
// CONVENIENCE: Export par défaut pour faciliter l'import
// ----------------------------------------------------------------------------
export const MESSAGES = {
  AUTH: AUTH_MESSAGES,
  SERVICE: SERVICE_MESSAGES,
  USER: USER_MESSAGES,
  WORKER_VALIDATION: WORKER_VALIDATION_MESSAGES,
  VALIDATION: VALIDATION_MESSAGES,
  SYSTEM: SYSTEM_MESSAGES,
  ERROR_CODES,
  HTTP_STATUS,
} as const;
