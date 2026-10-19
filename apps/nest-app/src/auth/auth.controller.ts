import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './current-auth.decorator.js';
import type { ICurrentUser } from './current-user.interface.js';

@Controller('auth')
export class AuthController {

    @Get('me')
    me(@CurrentUser() CurrentUser: ICurrentUser) {
        return CurrentUser;
    }
}
