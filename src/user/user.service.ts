import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';

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

  updatePartial(id: number, userData: PatchUserDto): object {
    //findUser
    return { user: { ...userData } };
  }

  update(id: number, user: UpdateUserDto): object {
    return { user: { ...user } };
  }

  delete(id: number) {
    console.log(`Deleting user #${id} from database.`);
    return;
  }
}
