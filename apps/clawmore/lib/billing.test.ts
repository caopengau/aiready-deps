import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createPlatformSubscriptionSession,
  reportMeteredUsage,
  reportOverageCharge,
  createFuelPackCheckout,
  chargeAutoTopup,
} from './billing';

const {
  mockCreateSession,
  mockCreateUsageRecord,
  mockCreateInvoiceItem,
  mockRetrieveCustomer,
  mockCreatePaymentIntent,
} = vi.hoisted(() => ({
  mockCreateSession: vi.fn(),
  mockCreateUsageRecord: vi.fn(),
  mockCreateInvoiceItem: vi.fn(),
  mockRetrieveCustomer: vi.fn(),
  mockCreatePaymentIntent: vi.fn(),
}));

// Mock sst/Resource
vi.mock('sst', () => ({
  Resource: {
    PlatformPrice: { id: 'price_platform_123' },
    ProPrice: { id: 'price_pro_456' },
    TeamPrice: { id: 'price_team_789' },
    MutationTaxPrice: { id: 'price_mutation_tax_999' },
    FuelPackPrice: { id: 'price_fuel_1000' },
  },
}));

// Mock Stripe correctly as a constructor
vi.mock('stripe', () => {
  class MockStripe {
    checkout = {
      sessions: {
        create: mockCreateSession,
      },
    };
    subscriptionItems = {
      createUsageRecord: mockCreateUsageRecord,
    };
    invoiceItems = {
      create: mockCreateInvoiceItem,
    };
    customers = {
      retrieve: mockRetrieveCustomer,
    };
    paymentIntents = {
      create: mockCreatePaymentIntent,
    };
  }
  return {
    default: MockStripe,
  };
});

describe('Billing Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPlatformSubscriptionSession', () => {
    it('should create checkout session with correct metadata', async () => {
      mockCreateSession.mockResolvedValue({
        id: 'sess_123',
        url: 'https://stripe.com/sess_123',
      });

      await createPlatformSubscriptionSession({
        userId: 'user_123',
        userEmail: 'test@example.com',
        tier: 'starter',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price: 'price_platform_123',
              quantity: 1,
            }),
          ]),
          metadata: expect.objectContaining({
            type: 'platform_subscription',
            userEmail: 'test@example.com',
            tier: 'starter',
          }),
          mode: 'subscription',
        })
      );
    });

    it('should use ProPrice by default if no tier specified', async () => {
      mockCreateSession.mockResolvedValue({
        id: 'sess_pro',
        url: 'https://stripe.com/sess_pro',
      });

      await createPlatformSubscriptionSession({
        userId: 'user_456',
        userEmail: 'pro@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({ price: 'price_pro_456', quantity: 1 }),
          ]),
        })
      );
    });
  });

  describe('reportMeteredUsage', () => {
    it('should call createUsageRecord with correct params', async () => {
      mockCreateUsageRecord.mockResolvedValue({ id: 'ur_123' });

      await reportMeteredUsage('si_789', 5);

      expect(mockCreateUsageRecord).toHaveBeenCalledWith(
        'si_789',
        expect.objectContaining({
          quantity: 5,
          action: 'increment',
        })
      );
    });

    it('should throw error if createUsageRecord fails', async () => {
      mockCreateUsageRecord.mockRejectedValue(new Error('Stripe error'));

      await expect(reportMeteredUsage('si_789')).rejects.toThrow(
        'Stripe error'
      );
    });
  });

  describe('reportOverageCharge', () => {
    it('should create invoice item for overage', async () => {
      mockCreateInvoiceItem.mockResolvedValue({ id: 'ii_123' });

      await reportOverageCharge('cus_123', 500, 'Extra scans');

      expect(mockCreateInvoiceItem).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          amount: 500,
          description: 'Extra scans',
        })
      );
    });
  });

  describe('createFuelPackCheckout', () => {
    it('should create payment session for fuel pack', async () => {
      mockCreateSession.mockResolvedValue({
        id: 'sess_fuel',
        url: 'http://stripe.com/fuel',
      });

      await createFuelPackCheckout(
        'cus_123',
        'http://success',
        'http://cancel'
      );

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          line_items: expect.arrayContaining([
            expect.objectContaining({ price: 'price_fuel_1000' }),
          ]),
          mode: 'payment',
        })
      );
    });
  });

  describe('chargeAutoTopup', () => {
    it('should charge saved payment method off-session', async () => {
      mockRetrieveCustomer.mockResolvedValue({
        id: 'cus_123',
        invoice_settings: { default_payment_method: 'pm_123' },
      });
      mockCreatePaymentIntent.mockResolvedValue({ status: 'succeeded' });

      const result = await chargeAutoTopup('cus_123', 1000, 'Auto topup');

      expect(result).toBe(true);
      expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          payment_method: 'pm_123',
          off_session: true,
          confirm: true,
        })
      );
    });

    it('should return false if no default payment method', async () => {
      mockRetrieveCustomer.mockResolvedValue({
        id: 'cus_123',
        invoice_settings: {},
      });

      const result = await chargeAutoTopup('cus_123', 1000, 'Auto topup');

      expect(result).toBe(false);
      expect(mockCreatePaymentIntent).not.toHaveBeenCalled();
    });

    it('should return false if payment fails', async () => {
      mockRetrieveCustomer.mockResolvedValue({
        id: 'cus_123',
        invoice_settings: { default_payment_method: 'pm_123' },
      });
      mockCreatePaymentIntent.mockResolvedValue({
        status: 'requires_payment_method',
      });

      const result = await chargeAutoTopup('cus_123', 1000, 'Auto topup');

      expect(result).toBe(false);
    });
  });
});
