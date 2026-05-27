export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  image: string;
  role: string;
}

export interface ProfileFormState {
  name: string;
  email: string;
  role: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}
