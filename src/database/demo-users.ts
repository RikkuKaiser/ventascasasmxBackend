/**
 * Usuarios de demostración (solo se insertan si la tabla `users` está vacía).
 * Contraseñas en texto plano aquí; en BD se guardan con bcrypt en el seed.
 */
export const DEMO_USERS_PLAIN: Array<{
  nombre: string;
  email: string;
  password: string;
}> = [
  {
    nombre: 'Cristobal',
    email: 'cristobal@ventascasasmx.com',
    password: 'cristobal1234',
  },
  {
    nombre: 'Cynthia',
    email: 'cynthia@ventascasasmx.com',
    password: 'cynthia1234',
  },
];
