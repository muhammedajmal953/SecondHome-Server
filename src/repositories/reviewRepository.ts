import { IReviews } from "../interfaces/IReviews";
import { Reviews } from "../models/reviewModel";
import { BaseRepository } from "./baseRepository";


export class ReviewRepository extends BaseRepository<IReviews>{
    constructor() {
        super(Reviews)
    }
}