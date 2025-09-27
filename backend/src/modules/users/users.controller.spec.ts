import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/User.dto';
import { ConflictException } from '@nestjs/common';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('Teste do controller', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(
      UsersService,
    ) as unknown as typeof mockUsersService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('Deve retornar todos os usuários', async () => {
      const users = [
        { id: '1', username: 'teste1', role: 'USER' },
        { id: '2', username: 'teste2', role: 'ADMIN' },
      ];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('Deve retornar um usuário', async () => {
      const user = { id: '1', username: 'teste1', role: 'USER' };
      service.findOne.mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(result).toEqual(user);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('Deve criar um usuário', async () => {
      const createUserDto: CreateUserDto = {
        username: 'teste',
        password: 'teste',
        role: 'USER',
      };
      service.create.mockResolvedValue({
        id: '1',
        username: 'teste',
        role: 'USER',
      });

      const result = await controller.create(createUserDto);
      expect(result).toEqual({
        id: '1',
        username: 'teste',
        role: 'USER',
      });
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('Deve retornar ConflictException se o usuário já existir', async () => {
      const createUserDto: CreateUserDto = {
        username: 'teste',
        password: 'teste',
        role: 'USER',
      };
      service.create.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('Deve atualizar um usuário', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'teste',
        password: 'teste',
      };
      service.update.mockResolvedValue({
        id: '1',
        username: updateUserDto.username,
        role: 'USER',
      });

      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual({
        id: '1',
        username: updateUserDto.username,
        role: 'USER',
      });
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('delete', () => {
    it('Deve excluir um usuário', async () => {
      service.delete.mockResolvedValue({
        id: '1',
        username: 'teste',
        role: 'USER',
      });

      const result = await controller.delete('1');
      expect(result).toEqual({
        id: '1',
        username: 'teste',
        role: 'USER',
      });
      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });
});
