import { IHostel } from "./IHostel"
import { IOrder } from "./IOrders"
import { OtpDoc } from "./IOtp"
import { UserDoc } from "./IUser"
import { IWishlist } from "./IWishlist"



export interface IBaseRepository<T>{
    findAll(filter: Record<string, unknown>, skip: number, limit: number): Promise<T[]>
    findById(id: string): Promise<T | null>
    create(item: Partial<T>): Promise<T>
    update(id: string, item: Partial<T>): Promise<T | null>
    delete(id: string): Promise<boolean>
}


export interface IHostelRepository extends IBaseRepository<IHostel>{
    findHostelWIthOwner(id:string):Promise<IHostel|null>
}

export interface IOtpRepository extends IBaseRepository<OtpDoc>{
    getOtpByEmail(email: string): Promise<OtpDoc | null>
}

export interface IUserRepository extends IBaseRepository<UserDoc>{
    getUserByEmail(email: string): Promise<UserDoc | null>
}


export interface IWishlistRepository extends IBaseRepository<IWishlist>{
    getWishlistByUserId(id: string): Promise<IWishlist | null>
}


export interface IBookingRepository extends IBaseRepository<IOrder>{
    getOrderWithAllDetails(id: string): Promise<IOrder | null>
}
