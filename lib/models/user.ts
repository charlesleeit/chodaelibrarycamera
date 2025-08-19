export interface User {
  id: string;
  name: string;
  email: string;
  pwd: string;
  status: number; // 1: Active, 0: Inactive
}

export interface UserInput {
  id: string;
  name: string;
  email: string;
  pwd: string;
  status: number; // 1: Active, 0: 
} 