import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';

@Injectable()
export class UserService {
  findAll(): object {
    return { users: [{}] };
  }

  findOne(id: number): object {
    return { user: { id } };
  }

  save(user: CreateUserDto): object {
    return { user: { ...user } };
  }

  updatePartial(id: number, user: UpdateUserDto): object {
    //findUser
    return { user: [{ ...user }] };
  }

  update(id: number, user: UpdateUserDto): object {
    return { user: [{ ...user }] };
  }

  delete(id: number) {
    console.log(`Deleting user #${id} from database.`);
    return;
  }
}
