import {CronJob} from 'cron'
import path from 'path';
import {existsSync, unlink } from 'fs';


export const job =new CronJob('16 9 * * *', () => {
    
    const sevenDaysBefore = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]+'.log'
    const basePath = path.resolve(__dirname, '../logs',sevenDaysBefore)
    
    if (existsSync(basePath)) {
        unlink(basePath, (err) => {
            if (err) {
                console.log('Error deleting log file',err)
            } else {
                console.log('file deleted Successfully by cronjob');  
            }
        })
  }
    
})