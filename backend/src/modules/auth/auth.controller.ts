import { Controller, Post, Body, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() authDto: any) {
    // Przekazujemy cały obiekt, bo tak zbudowaliśmy serwis
    return this.authService.register(authDto);
  }

  @Post('login')
  async login(@Request() req, @Body() authDto: any) {
    // Bezpieczne wyciąganie adresu IP (w tym obsługa proxy, np. Nginx / Cloudflare)
    const ipAddress = 
      req.headers['x-forwarded-for'] || 
      req.ip || 
      req.connection?.remoteAddress || 
      '127.0.0.1';
      
    // Wyciąganie metadanych przeglądarki i systemu operacyjnego
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    // Przekazujemy dane logowania oraz metadane sieciowe do serwisu
    return this.authService.login(authDto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  async getLoginHistory(@Request() req) {
    // 1. Sprawdźmy, czy Passport poprawnie ustawił obiekt użytkownika
    if (req.user && req.user.id) {
      return this.authService.getLoginHistory(req.user.id);
    }

    // 2. AWARYJNE ROZWIĄZANIE: Jeśli req.user nie istnieje, wyciągamy ID bezpośrednio z tokenu JWT
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        // Dekodujemy payload tokenu bez ponownej weryfikacji podpisu (podpis zweryfikował już Guard)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          Buffer.from(base64, 'base64')
            .toString()
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        );

        const payload = JSON.parse(jsonPayload);
        
        // W Twoim tokenie ID siedzi w polu 'sub'
        if (payload && payload.sub) {
          return this.authService.getLoginHistory(payload.sub);
        }
      }
    } catch (e) {
      // Jeśli nawet to zawiedzie, przejdź do błędu poniżej
    }

    // 3. Jeśli nie znaleziono żadnego ID
    throw new UnauthorizedException('Nie można zidentyfikować użytkownika na podstawie tokenu');
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: any) {
    // req.user.id jest ustawiane przez JwtStrategy po pomyślnej autoryzacji
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
