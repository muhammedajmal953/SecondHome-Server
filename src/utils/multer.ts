
import multer, { Multer } from 'multer'


export const upload:Multer =multer({
    storage: multer.memoryStorage()
})

