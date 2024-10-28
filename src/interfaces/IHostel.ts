import { ObjectId, Document } from "mongoose";
import { IResponse } from "./IResponse";

export interface IHostel extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: number;
    longtitude: string;
    latitude: string;
  };
  phone: string;
  email: string;
  description: string;
  facilities: string[];
  policies: string;
  nearbyPlaces: string[];
  photos: string[];
  rates: { type: string; price: number,quantity:number }[];
  foodRate: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  isActive: boolean;
  category: string;
  owner: ObjectId;
  advance: number;
}

export interface IHostelService {
  createHostel(
    photos: Express.Multer.File[],
    formdata: { [key: string]: unknown },
    token: string
    ): Promise<IResponse>;
    
    getAllHostel(
        page: number,
        searchQuery:string
    ): Promise<IResponse>;

    blockHostel(id: string): Promise<IResponse>;
    
    unBlockHostel(id: string): Promise<IResponse>;

    getHostel(id: string): Promise<IResponse>;

    getHostelWithOwner(id: string): Promise<IResponse>;

    editHostle(
        id: string,
        photos: Express.Multer.File[],
        formdata: { [key: string]: unknown }
    ): Promise<IResponse>;

    
    
}
