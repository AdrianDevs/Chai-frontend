import { describe, expect, it } from 'vitest';
import transformKeysToCamelCase from '../src/services/api/utils/caseConverter';

describe('caseConverter', () => {
  it('should convert keys to camel case', () => {
    const input = {
      user_id: 1,
      user_name: 'JohnDoe',
      email_address: 'john@example.com',
      contact_info: {
        phone_number: '123-456-7890',
        address_line_1: '123 Main St',
      },
      roles: [
        { role_id: 1, role_name: 'Admin' },
        { role_id: 2, role_name: 'User' },
      ],
    };

    const output = transformKeysToCamelCase(input);

    expect(output).toEqual({
      userId: 1,
      userName: 'JohnDoe',
      emailAddress: 'john@example.com',
      contactInfo: {
        phoneNumber: '123-456-7890',
        addressLine_1: '123 Main St',
      },
      roles: [
        { roleId: 1, roleName: 'Admin' },
        { roleId: 2, roleName: 'User' },
      ],
    });
  });
});
