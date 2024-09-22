
import otp from 'otp-generator'


const generateOtp = () => { 
    return otp.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
}

export default generateOtp