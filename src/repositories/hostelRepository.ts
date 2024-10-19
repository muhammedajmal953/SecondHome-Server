import { IHostel } from "../interfaces/IHostel";
import Hostel from "../models/hostelModel";
import { BaseRepository } from "./baseRepository";

export class HostelRepository extends BaseRepository<IHostel> {
  constructor() {
    super(Hostel);
  }
}
