-- Add APPROVED state between PENDING and PAID so admins can gate fulfillment.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
