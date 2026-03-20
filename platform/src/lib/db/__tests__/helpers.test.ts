import { describe, it, expect, vi } from 'vitest';
import { buildUpdateExpression, buildConditionExpression } from '../helpers';

vi.mock('../client', () => ({
  TABLE_NAME: 'test-table',
}));

describe('DB Helpers', () => {
  describe('buildUpdateExpression', () => {
    it('should build update expression with single field', () => {
      const result = buildUpdateExpression({ name: 'test' });
      expect(result).toEqual({
        UpdateExpression: 'SET #name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': 'test' },
      });
    });

    it('should build update expression with multiple fields', () => {
      const result = buildUpdateExpression({ name: 'test', status: 'active' });
      expect(result.UpdateExpression).toContain('#name');
      expect(result.UpdateExpression).toContain('#status');
    });

    it('should handle nested fields', () => {
      const result = buildUpdateExpression({ 'profile.name': 'John' });
      expect(result.UpdateExpression).toContain('profile.#name');
      expect(result.ExpressionAttributeNames).toHaveProperty('#name');
    });
  });

  describe('buildConditionExpression', () => {
    it('should build condition expression', () => {
      const result = buildConditionExpression({ id: '123' });
      expect(result).toContain('id');
    });
  });
});
