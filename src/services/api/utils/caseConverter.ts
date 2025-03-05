const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/gi, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

const transformKeysToCamelCase = <
  T extends Record<string, unknown> | Array<Record<string, unknown>>,
>(
  obj: T
): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToCamelCase(item)) as unknown as T;
  } else if (typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        const camelCaseKey = toCamelCase(key);

        // If the value is an object or array, recursively transform keys
        if (value !== null && typeof value === 'object') {
          acc[camelCaseKey] = transformKeysToCamelCase(value as T);
          return acc;
        } else {
          acc[camelCaseKey] = value;
          return acc;
        }
      },
      {} as Record<string, unknown>
    ) as T;
  }
  return obj;
};

// const transformKeysToCamelCase = <T>(obj: T): T => {
//   if (Array.isArray(obj)) {
//     return obj.map((item) => transformKeysToCamelCase(item)) as unknown as T;
//   } else if (obj !== null && typeof obj === 'object') {
//     return Object.keys(obj).reduce((acc, key) => {
//       const camelCaseKey = toCamelCase(key);
//       acc[camelCaseKey] = transformKeysToCamelCase(obj[key]);
//       return acc;
//     }, {} as T);
//   }
//   return obj;
// };

export default transformKeysToCamelCase;

// Example usage:
// Input:
// {
//   "user_id": 1,
//   "user_name": "JohnDoe",
//   "email_address": "john@example.com",
//   "contact_info": {
//     "phone_number": "123-456-7890",
//     "address_line_1": "123 Main St"
//   },
//   "roles": [
//     { "role_id": 1, "role_name": "Admin" },
//     { "role_id": 2, "role_name": "User" }
//   ]
// }
// Output:
// {
//   userId: 1,
//   userName: 'JohnDoe',
//   emailAddress: 'john@example.com',
//   contactInfo: {
//     phoneNumber: '123-456-7890',
//     addressLine1: '123 Main St',
//   },
//   roles: [
//     { roleId: 1, roleName: 'Admin' },
//     { roleId: 2, roleName: 'User' },
//   ],
// }
