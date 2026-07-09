import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";  
import config from "../../config";
import { RegisterUserPayload } from "../../interface/user.interface";





// Register User
const registerUserIntoDB = async ( payload: RegisterUserPayload ) => {
    const { name, email, password, role, profilePhoto } = payload;

    if (payload.role === "ADMIN") {
        throw new Error("Registration as an ADMIN is strictly prohibited!");
    }
    
    const userExists = await prisma.user.findUnique({ where: { email } }); 
     if (userExists) {
        throw new Error('User already exists');
     }
     
    const hashedPassword = await bcrypt.hash(password, Number(config.bcryptSaltRounds));
     
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || "TENANT", 
            profile: {
                create: {
                    profilePhoto
                    }
               }
        },
        omit: {
            password: true
            },
        include: {
            profile: true
        }
     });

   
    return newUser;
}




// Profile
const getMyProfileIntoDB = async ( userId: string ) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: { password: true },
        include: { profile: true }
    })

    return user;
}




// Update Profile
const updateMyProfileIntoDB = async ( userId: string, payload: any ) => {
    const { name, email, profileImage, bio, phone, address } = payload;

    const updatedUser = await prisma.user.update({
        where: { id : userId },
        data: {
            name,
            email,
            profile : {
                update: {
                    phone,
                    address,
                    profileImage,
                    bio
                }
            },
            
        },
        omit: {
                password : true
            },
        include: {
            profile : true
        }
    })
    return updatedUser;
}





export const userService = {
    registerUserIntoDB,
    getMyProfileIntoDB,
    updateMyProfileIntoDB
}