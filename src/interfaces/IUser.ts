import { Document } from "mongoose";

export interface UserDoc extends Document {
  First_name: string;
  Last_name: string;
  Email: string;
  Phone: number;
  Password: string 
  IsAdmin: boolean 
  isVerified: boolean 
  Role: string
  Location: string 
  CreatedAt: Date 
  UpdatedAt: Date 
  Avatar: string 
  IsActive: boolean 
  Gender: 'Male'|'Female'|'Others';
}