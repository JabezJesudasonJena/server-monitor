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
  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({id});
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.usersRepository.findOneBy({id});
    if(!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.save({...user, ...updateUserDto})
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
