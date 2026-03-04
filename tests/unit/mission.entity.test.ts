// ============================================================================
// MISSION ENTITY UNIT TESTS
// ============================================================================
// Tests pour l'entité Mission et sa machine à états
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { Mission, MissionStatus } from '../../src/modules/mission/domain/index.js';

describe('Mission Entity', () => {
  // Données de test valides
  const validMissionProps = {
    id: 'test-mission-id',
    clientId: 'client-123',
    workerId: 'worker-456',
    serviceId: 'service-789',
    prixMin: 5000,
    prixMax: 10000,
    prixFinal: null,
    montantRestant: null,
    cancellationRequestedBy: null,
    clientConfirmed: false,
    workerConfirmed: false,
    status: MissionStatus.PENDING_PAYMENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Constructor', () => {
    it('should create a mission with valid props', () => {
      const mission = new Mission(validMissionProps);
      
      expect(mission.id).toBe(validMissionProps.id);
      expect(mission.clientId).toBe(validMissionProps.clientId);
      expect(mission.workerId).toBe(validMissionProps.workerId);
      expect(mission.status).toBe(MissionStatus.PENDING_PAYMENT);
    });

    it('should throw error if prixMin < 2000', () => {
      const invalidProps = {
        ...validMissionProps,
        prixMin: 1000,
      };
      
      expect(() => new Mission(invalidProps)).toThrow(
        'Le prix minimum doit être supérieur ou égal à 2000'
      );
    });

    it('should throw error if prixMax < 2000', () => {
      const invalidProps = {
        ...validMissionProps,
        prixMax: 1000,
      };
      
      expect(() => new Mission(invalidProps)).toThrow(
        'Le prix maximum doit être supérieur ou égal à 2000'
      );
    });

    it('should throw error if prixMax < prixMin', () => {
      const invalidProps = {
        ...validMissionProps,
        prixMin: 10000,
        prixMax: 5000,
      };
      
      expect(() => new Mission(invalidProps)).toThrow(
        'Le prix maximum doit être supérieur ou égal au prix minimum'
      );
    });

    it('should throw error if prixFinal < prixMin', () => {
      const invalidProps = {
        ...validMissionProps,
        prixFinal: 3000,
        prixMin: 5000,
      };
      
      expect(() => new Mission(invalidProps)).toThrow(
        'Le prix final (3000) ne peut pas être inférieur au prix minimum (5000)'
      );
    });

    it('should throw error if prixFinal > prixMax', () => {
      const invalidProps = {
        ...validMissionProps,
        prixFinal: 15000,
        prixMax: 10000,
      };
      
      expect(() => new Mission(invalidProps)).toThrow(
        'Le prix final (15000) ne peut pas dépasser le prix maximum (10000)'
      );
    });
  });

  describe('State Machine Transitions', () => {
    describe('confirmInitialPayment()', () => {
      it('should transition from PENDING_PAYMENT to PENDING_ACCEPT', () => {
        const mission = new Mission(validMissionProps);
        const updatedMission = mission.confirmInitialPayment();
        
        expect(updatedMission.status).toBe(MissionStatus.PENDING_ACCEPT);
      });

      it('should throw error if status is not PENDING_PAYMENT', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.IN_PROGRESS,
        });
        
        expect(() => mission.confirmInitialPayment()).toThrow(
          'Impossible de confirmer le paiement initial'
        );
      });
    });

    describe('acceptMission()', () => {
      it('should transition from PENDING_ACCEPT to CONTACT_UNLOCKED', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.PENDING_ACCEPT,
        });
        
        const updatedMission = mission.acceptMission();
        
        expect(updatedMission.status).toBe(MissionStatus.CONTACT_UNLOCKED);
      });

      it('should throw error if status is not PENDING_ACCEPT', () => {
        const mission = new Mission(validMissionProps);
        
        expect(() => mission.acceptMission()).toThrow(
          'Impossible d\'accepter la mission'
        );
      });
    });

    describe('refuseMission()', () => {
      it('should transition from PENDING_ACCEPT to REFUSED', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.PENDING_ACCEPT,
        });
        
        const updatedMission = mission.refuseMission();
        
        expect(updatedMission.status).toBe(MissionStatus.REFUSED);
      });

      it('should throw error if status is not PENDING_ACCEPT', () => {
        const mission = new Mission(validMissionProps);
        
        expect(() => mission.refuseMission()).toThrow(
          'Impossible de refuser la mission'
        );
      });
    });

    describe('setFinalPrice()', () => {
      it('should set prixFinal and transition to NEGOTIATION_DONE', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.CONTACT_UNLOCKED,
        });
        
        const updatedMission = mission.setFinalPrice(7500);
        
        expect(updatedMission.prixFinal).toBe(7500);
        expect(updatedMission.montantRestant).toBe(2500); // 7500 - 5000
        expect(updatedMission.status).toBe(MissionStatus.NEGOTIATION_DONE);
      });

      it('should set montantRestant to 0 if prixFinal equals prixMin', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.CONTACT_UNLOCKED,
        });
        
        const updatedMission = mission.setFinalPrice(5000);
        
        expect(updatedMission.prixFinal).toBe(5000);
        expect(updatedMission.montantRestant).toBe(0);
      });

      it('should throw error if status is not CONTACT_UNLOCKED', () => {
        const mission = new Mission(validMissionProps);
        
        expect(() => mission.setFinalPrice(7500)).toThrow(
          'Impossible de fixer le prix final'
        );
      });
    });

    describe('completeByClient() and completeByWorker()', () => {
      it('should transition to COMPLETED when both confirm', () => {
        // First, client confirms
        const mission1 = new Mission({
          ...validMissionProps,
          status: MissionStatus.IN_PROGRESS,
        });
        
        const afterClientConfirm = mission1.completeByClient();
        expect(afterClientConfirm.status).toBe(MissionStatus.IN_PROGRESS);
        expect(afterClientConfirm.clientConfirmed).toBe(true);
        
        // Then worker confirms
        const afterWorkerConfirm = afterClientConfirm.completeByWorker();
        expect(afterWorkerConfirm.status).toBe(MissionStatus.COMPLETED);
        expect(afterWorkerConfirm.workerConfirmed).toBe(true);
      });

      it('should throw error if status is not IN_PROGRESS', () => {
        const mission = new Mission(validMissionProps);
        
        expect(() => mission.completeByClient()).toThrow(
          'Le client ne peut pas confirmer la mission'
        );
      });
    });

    describe('cancel()', () => {
      it('should transition from PENDING_PAYMENT to CANCELLED', () => {
        const mission = new Mission(validMissionProps);
        const cancelledMission = mission.cancel();
        
        expect(cancelledMission.status).toBe(MissionStatus.CANCELLED);
      });

      it('should throw error if trying to cancel a completed mission', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.COMPLETED,
        });
        
        expect(() => mission.cancel()).toThrow(
          'Impossible d\'annuler une mission terminée'
        );
      });

      it('should throw error if trying to cancel an in-progress mission', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.IN_PROGRESS,
        });
        
        expect(() => mission.cancel()).toThrow(
          'Utilisez requestCancellation() pour les missions en cours'
        );
      });
    });

    describe('requestCancellation()', () => {
      it('should transition from IN_PROGRESS to CANCEL_REQUESTED', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.IN_PROGRESS,
        });
        
        const cancelledMission = mission.requestCancellation('CLIENT');
        
        expect(cancelledMission.status).toBe(MissionStatus.CANCEL_REQUESTED);
        expect(cancelledMission.cancellationRequestedBy).toBe('CLIENT');
      });

      it('should throw error if status is not IN_PROGRESS', () => {
        const mission = new Mission(validMissionProps);
        
        expect(() => mission.requestCancellation('CLIENT')).toThrow(
          'Impossible de demander l\'annulation'
        );
      });
    });
  });

  describe('Utility Methods', () => {
    describe('canCancel()', () => {
      it('should return true for PENDING_PAYMENT', () => {
        const mission = new Mission(validMissionProps);
        expect(mission.canCancel()).toBe(true);
      });

      it('should return false for COMPLETED', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.COMPLETED,
        });
        expect(mission.canCancel()).toBe(false);
      });

      it('should return false for IN_PROGRESS', () => {
        const mission = new Mission({
          ...validMissionProps,
          status: MissionStatus.IN_PROGRESS,
        });
        expect(mission.canCancel()).toBe(false);
      });
    });

    describe('canRequestCancellation()', () => {
      it('should return true only for IN_PROGRESS', () => {
        const missionInProgress = new Mission({
          ...validMissionProps,
          status: MissionStatus.IN_PROGRESS,
        });
        expect(missionInProgress.canRequestCancellation()).toBe(true);

        const missionPending = new Mission(validMissionProps);
        expect(missionPending.canRequestCancellation()).toBe(false);
      });
    });
  });
});
