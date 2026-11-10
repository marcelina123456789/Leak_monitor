import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Zmieniamy z 'MOJ_TESTOWY_KLUCZ' na klucz, którym faktycznie podpisujesz tokeny przy logowaniu:
      secretOrKey: 'SECRET_KEY_123', 
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
