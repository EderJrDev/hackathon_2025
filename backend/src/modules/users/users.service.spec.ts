import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/common/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/User.dto';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('Teste do service', () => {
  let service: UsersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as unknown as typeof mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('Deve criar um usuário', async () => {
      const createUserDto: CreateUserDto = {
        username: 'teste',
        password: 'teste',
        role: 'USER',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        username: 'teste',
        role: 'USER',
      });

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: '1',
        username: 'teste',
        role: 'USER',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: createUserDto.username },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          username: createUserDto.username,
          password: expect.stringMatching(/^[$2b$10$]/),
          role: createUserDto.role,
        }),
        select: { id: true, username: true, role: true },
      });
    });

    it('Deve retornar ConflictException se o usuário já existir', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        role: 'USER',
      };
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        username: 'testuser',
        role: 'USER',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('Deve retornar todos os usuários', async () => {
      const users = [
        { id: '1', username: 'teste', role: 'USER' },
        { id: '2', username: 'teste', role: 'ADMIN' },
      ];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('Deve retornar um usuário', async () => {
      const user = { id: '1', username: 'teste', role: 'USER' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, username: true, role: true },
      });
    });

    it('Deve retornar NotFoundException se o usuário não existir', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('Deve excluir um usuário', async () => {
      prisma.user.delete.mockResolvedValue({
        id: '1',
        username: 'teste',
        role: 'USER',
      });

      const result = await service.delete('1');
      expect(result).toEqual({
        id: '1',
        username: 'teste',
        role: 'USER',
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
