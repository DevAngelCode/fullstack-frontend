export class LoginResponse {
  token?: string; // Changed from jwt to token
  id?: number;
  username?: string;
  email?: string;
  roles?: string[];
  message?: string;
}
