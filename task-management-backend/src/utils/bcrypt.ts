import * as bcrypt from 'bcrypt'

export async function encrypt(password:string):Promise<String>{
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}

export async function compare(password:string, hashed:string):Promise<boolean>{
    return await bcrypt.compare(password, hashed)
}