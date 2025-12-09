// apps/api/src/dto/auth.dto.ts
export class RegisterDto {
  email!: string;
  password!: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}
