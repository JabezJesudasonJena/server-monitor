import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}
  create(createUserDto: CreateUserDto) : Promise<User>{
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user);
  }

  findAll() : Promise <User[]>{
    return this.usersRepository.find();
  }

  findOne(id: string) : Promise<User>{
    return this.usersRepository.findOneByOrFail({id})
  }
  
  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
