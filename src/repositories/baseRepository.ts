import { Model,Document } from "mongoose";


export class BaseRepository <T extends Document>{
    constructor(private _model: Model<T>) {
       this._model=_model
    }
    
    async findAll(filter:any,skip:number,limit:number=5):Promise<T[]> {
        return this._model.find(filter).skip(skip).limit(limit)
    }

    async findById(id: string): Promise<T | null>{
        return this._model.findById(id)
    }

    async create(item: Partial<T>):Promise<T> {
        return this._model.create(item)
    }

    async update(id: string, item: Partial<T>): Promise<T|null>{
        return this._model.findByIdAndUpdate(id,item,{new:true})
    }

    async delete(id:string):Promise<boolean>{
        const result = this._model.findByIdAndDelete(id)
        return result!==null
    }
}