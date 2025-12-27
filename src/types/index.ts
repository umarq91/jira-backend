export interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  role:string
}

export interface Project {
  id: number;
  title: string;
  description: string;
  created_by?: number;
}


export enum ROLES  {
ADMIN = 'admin',
USER = 'user',
MEMBER= 'member'
}