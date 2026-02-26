import { BusinessError } from '../../../shared/errors/index.js';
/**
 * Erreur lorsqu'un utilisateur est banni
 *
 * RÈGLE MÉTIER: Un utilisateur banni ne peut pas:
 * - Se connecter (LoginUseCase)
 * - Effectuer des actions authentifiées
 */
export declare class UserBannedError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur est supprimé (soft deleted)
 *
 * RÈGLE MÉTIER: Un utilisateur supprimé ne peut pas:
 * - Se connecter (LoginUseCase)
 * - Effectuer des actions authentifiées
 */
export declare class UserDeletedError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur essaie de modifier son propre compte banni
 *
 * RÈGLE MÉTIER: Un utilisateur banni ne peut pas:
 * - Activer/désactiver son propre compte
 */
export declare class CannotModifySelfBannedError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'on essaie de modifier un utilisateur supprimé
 *
 * RÈGLE MÉTIER: Impossible de modifier un utilisateur soft-deleted
 */
export declare class CannotModifyDeletedUserError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur est déjà actif
 */
export declare class UserAlreadyActiveError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur est déjà désactivé
 */
export declare class UserAlreadyInactiveError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur est déjà banni
 */
export declare class UserAlreadyBannedError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur n'est pas banni (pour opération unban)
 */
export declare class UserNotBannedError extends BusinessError {
    constructor(message?: string);
}
/**
 * Erreur lorsqu'un utilisateur est déjà soft-deleted
 */
export declare class UserAlreadyDeletedError extends BusinessError {
    constructor(message?: string);
}
//# sourceMappingURL=user-status.errors.d.ts.map