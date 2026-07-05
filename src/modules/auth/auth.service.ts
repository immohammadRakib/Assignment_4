import { ref, threadCpuUsage } from "node:process";
import { prisma } from "../../lib/prisma";
import  jwt, { JwtPayload, SignOptions }  from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser } from "../../interface/auth.interface";


const loginUser = async ( payload: ILoginUser) => {
    const { email, password } = payload;

    // const user = await prisma.user.findUnique({
    //     where: { email }
    // })
    // if( !user ){
    //     throw new Error("user not found")
    // }
   
    const user = await prisma.user.findUniqueOrThrow({ where: { email }})

    // if( user.activeStatus === "BLOCKED"){
    //     throw new Error("your account blocked, contract support")
    // }

    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if( !isPasswordMatched ){
        throw new Error("password doesn't match")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken( jwtPayload, config.jwt_access_secret, config.jwt_access_expiration as SignOptions )

    const refreshToken = jwtUtils.createToken( jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expiration as SignOptions )
    
    
    return { accessToken, refreshToken };

}


const refreshToken = async ( refreshToken: string ) => {
    const verifiedRefreshToken = jwtUtils.verifyToken( refreshToken, config.jwt_refresh_secret )

    if( !verifiedRefreshToken.success ){
        throw new Error( verifiedRefreshToken.error );
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({ where: { id }})
    // if( user.activeStatus === "BLOCKED" ){
    //     throw new Error("User is Blocked")
    // }

    const jwtPayload = {
        id,
        name : user.name,
        email : user.email,
        role : user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expiration as SignOptions
    )

   return { accessToken };

}






export const authService = {
    loginUser,
    refreshToken
}