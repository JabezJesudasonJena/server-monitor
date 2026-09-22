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
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({id});
  }

  // Reason: Database operations in TypeORM are asynchronous and need async/await to properly resolve
  // What it does: Defines an asynchronous method to find and update a user
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Reason: findOneBy is asynchronous, so we must await it to get the user object instead of an unresolved Promise
    // What it does: Awaits the database query looking for a user matching the provided id
    const user = await this.usersRepository.findOneBy({id});
    if(!user) {
      throw new NotFoundException('User not found');
    }
    // Reason: Persisting changes to the database requires calling save with the merged entity
    // What it does: Merges updated fields onto the existing user and saves it to the database
    return this.usersRepository.save({...user, ...updateUserDto})
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
