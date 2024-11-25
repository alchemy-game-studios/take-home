// Simple Prisma mock. Could use jest-mock-extended for more flexible mocking
export const mockPrismaService = {
  receipt: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  receiptItem: {
    create: jest.fn(),
  },
};
