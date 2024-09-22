
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASSWORD
        }
});





const sendMail = async (sender: string, subject: string, to: string, body: string) => {
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .email-container {
                background-color: #ffffff;
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                box-shadow: 0 0 5px rgba(0,0,0,0.1);
            }
            h2, h4 {
                color: #333333;
            }
        </style>
    </head>
    <body>
    <div class="email-container">
    <h2>Congratulations you are going to verified!</h2>
    <p>your OTP is:</p>
    <h4>${body}</h4>
    <p>Best regards,</p>
    <p>Second Home Team</p>
</div>
    </body>
    </html>`;
     const info = await transporter.sendMail({
        from: sender,
        to: to,
        subject: subject,
        text: body,
        html:emailHTML
    })

    return info.messageId
}
 

export default sendMail
    
