import {CronJob} from 'cron'

import { exec } from 'child_process'
import path from 'path';
import {existsSync, unlink } from 'fs';


export let job =new CronJob('16 9 * * *', () => {
    
    let sevenDaysBefore = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]+'.log'
    let basePath = path.resolve(__dirname, '../logs',sevenDaysBefore)
    
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