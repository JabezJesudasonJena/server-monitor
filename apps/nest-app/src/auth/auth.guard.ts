import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ICurrentUser } from "./current-user.interface.js";

export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext)  {
        
        const request = context.switchToHttp().getRequest();

        const currentUser: ICurrentUser= {
            id: 'default-user-1',
            name: 'Default user 1',
            email: 'default-user@example.com'
        }

        request['user'] = currentUser;

        return true;
    }
}