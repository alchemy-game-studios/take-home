// Simple Prisma mock. Could use juest-mock-extended for more flexible mocking
export const mockPrismaService = {
  receipt: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  receiptItem: {
    create: jest.fn(),
  },
};
