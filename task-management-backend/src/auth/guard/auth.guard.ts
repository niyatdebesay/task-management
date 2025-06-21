import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    canActivate(context:ExecutionContext):Promise<boolean> | boolean | Observable<boolean>{
        return super.canActivate(context)

    }
}