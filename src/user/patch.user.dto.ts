import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create.user.dto';

/* This update mode does not require everything in CreateUserDto. */

export class PatchUserDto extends PartialType(CreateUserDto) {}
