import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from './entities/user.entity.js'
// Reason: Import NotFoundException to test and assert not-found error handling
// What it does: Provides the NotFoundException class to assert against in error test cases
import { NotFoundException } from '@nestjs/common';


describe('UsersService', () => {
  let service: UsersService;
  let repo: Mocked<Repository<User>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, {
        provide: getRepositoryToken(User),
        useValue: mock<Repository<User>>()
      }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Mocked<Repository<User>>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should create a user", async () => {
    const user = {} as any;
    repo.create.mockReturnValue(user);
    repo.save.mockResolvedValue(user);

    const result = await service.create({
      name: 'test', email: 'test@test.com'
    })

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      name: 'test', email: 'test@test.com'
    })

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(user);

    expect(result).toEqual(user);
  });

  it('should find all users', async () => {
    const users = [] as any;
    repo.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  })

  it('should find a user by id', async () => {
    const user = {} as any;
    repo.findOneBy.mockResolvedValue(user);

    const result = await service.findOne('1');

    expect(repo.findOneBy).toHaveBeenCalledTimes(1);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    
    expect(result).toEqual(user);
  })

  it('should update a user', async () => {
    const user = {} as any;
    repo.findOneBy.mockResolvedValue(user);
    repo.save.mockResolvedValue({ ...user, name: 'test', email: 'test@test.com' });
    
    const result = await service.update('1', {name: 'test', email: 'test@test.com'});
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(repo.save).toHaveBeenCalledWith({ ...user, name: 'test', email: 'test@test.com' });
    expect(result).toEqual({ ...user, name: 'test', email: 'test@test.com' });
  })

  it('should throw an error when the user is not found', async () => {
    repo.findOneBy.mockResolvedValue(null)
    await expect(service.update('1', { name: 'test' })).rejects.toThrow(NotFoundException);
  })

  it('should remove a user', async () => {
    const deleteResult = { raw: [], affected: 1 } as any;
    repo.delete.mockResolvedValue(deleteResult);

    const result = await service.remove('1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('1');
    expect(result).toEqual(deleteResult);
  })
  
});
