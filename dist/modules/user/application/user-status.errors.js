// ============================================================================
// APPLICATION LAYER - User Status Errors
// ============================================================================
// Custom error classes for user status management (activation, ban, deletion)
// ============================================================================
import { BusinessError } from '../../../shared/errors/index.js';
import { USER_MESSAGES, ERROR_CODES, HTTP_STATUS } from '../../../shared/constants/index.js';
/**
 * Erreur lorsqu'un utilisateur est banni
 *
 * RÈGLE MÉTIER: Un utilisateur banni ne peut pas:
 * - Se connecter (LoginUseCase)
 * - Effectuer des actions authentifiées
 */
export class UserBannedError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_IS_BANNED) {
        super({
            message,
            statusCode: HTTP_STATUS.FORBIDDEN,
            code: ERROR_CODES.USER_BANNED,
        });
        this.name = 'UserBannedError';
    }
}
/**
 * Erreur lorsqu'un utilisateur est supprimé (soft deleted)
 *
 * RÈGLE MÉTIER: Un utilisateur supprimé ne peut pas:
 * - Se connecter (LoginUseCase)
 * - Effectuer des actions authentifiées
 */
export class UserDeletedError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_IS_DELETED) {
        super({
            message,
            statusCode: HTTP_STATUS.FORBIDDEN,
            code: ERROR_CODES.USER_DELETED,
        });
        this.name = 'UserDeletedError';
    }
}
/**
 * Erreur lorsqu'un utilisateur essaie de modifier son propre compte banni
 *
 * RÈGLE MÉTIER: Un utilisateur banni ne peut pas:
 * - Activer/désactiver son propre compte
 */
export class CannotModifySelfBannedError extends BusinessError {
    constructor(message = USER_MESSAGES.CANNOT_MODIFY_SELF_BANNED) {
        super({
            message,
            statusCode: HTTP_STATUS.FORBIDDEN,
            code: ERROR_CODES.USER_SELF_FORBIDDEN,
        });
        this.name = 'CannotModifySelfBannedError';
    }
}
/**
 * Erreur lorsqu'on essaie de modifier un utilisateur supprimé
 *
 * RÈGLE MÉTIER: Impossible de modifier un utilisateur soft-deleted
 */
export class CannotModifyDeletedUserError extends BusinessError {
    constructor(message = USER_MESSAGES.CANNOT_MODIFY_DELETED) {
        super({
            message,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_INPUT,
        });
        this.name = 'CannotModifyDeletedUserError';
    }
}
/**
 * Erreur lorsqu'un utilisateur est déjà actif
 */
export class UserAlreadyActiveError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_ALREADY_ACTIVE) {
        super({
            message,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_INPUT,
        });
        this.name = 'UserAlreadyActiveError';
    }
}
/**
 * Erreur lorsqu'un utilisateur est déjà désactivé
 */
export class UserAlreadyInactiveError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_ALREADY_INACTIVE) {
        super({
            message,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_INPUT,
        });
        this.name = 'UserAlreadyInactiveError';
    }
}
/**
 * Erreur lorsqu'un utilisateur est déjà banni
 */
export class UserAlreadyBannedError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_ALREADY_BANNED) {
        super({
            message,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_INPUT,
        });
        this.name = 'UserAlreadyBannedError';
    }
}
/**
 * Erreur lorsqu'un utilisateur n'est pas banni (pour opération unban)
 */
export class UserNotBannedError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_ALREADY_UNBANNED) {
        super({
            message,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_INPUT,
        });
        this.name = 'UserNotBannedError';
    }
}
/**
 * Erreur lorsqu'un utilisateur est déjà soft-deleted
 */
export class UserAlreadyDeletedError extends BusinessError {
    constructor(message = USER_MESSAGES.USER_ALREADY_DELETED) {
        super({
            message,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_INPUT,
        });
        this.name = 'UserAlreadyDeletedError';
    }
}
//# sourceMappingURL=user-status.errors.js.map