import express ,{Request,Response} from "express";
import {authMiddleware} from '../middleware/authMiddleware'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {prisma} from '../lib/prisma'
import { z } from "zod";
const router = express.Router();

const userSchema = z.object({
  username: z
    .string().email(),

  password: z.string().min(6, "Password must be at least 6 characters"),

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
});

router.post("/signup", async (req : Request , res : Response) => {
    const userValidation = userSchema.safeParse(req.body)
    // console.log(req.body);
    
    if(!userValidation.success){
        // console.log("error here");
        
        return res.status(400).json({
            errors : userValidation.error.format()
        })
        
    }
    const isExist = await prisma.user.findFirst({
        where : {
            username : req.body?.username
        }
    })
    if(isExist){
        return res.status(409).json({msg : "email already exist"});
    }
    const hashedPassword = await bcrypt.hash(userValidation.data.password,10);
    const user = await prisma.user.create({
        data : {
            ...userValidation.data,
            password : hashedPassword
        }
    })
    await prisma.account.create({
        data : {
            userId : user.id,
            balance : 1 + Math.floor(Math.random()*1000)
        }
    })
    return res.json({msg : 'user signed up succesfully'})

});
const signInValidation = z.object({
    username : z.string().email(),
    password : z.string()
})
router.post("/login", async (req : Request, res : Response) => {
    const userValidation = signInValidation.safeParse(req.body)
    if(!userValidation.success){
        return res.status(401).json({errors : userValidation.error.format()});
    }
    const isUserExist = await prisma.user.findFirst({
        where : {
            username : userValidation.data.username
        }
    })
    if(!isUserExist){
        return res.status(401).json({msg : "invalid credentials"});
    }
    const isPasswordCorrect = await bcrypt.compare(userValidation.data.password,isUserExist.password);
    if(!isPasswordCorrect){
        return res.status(401).json({msg : "invalid credentials"});
    }    
    const token =   jwt.sign({
        userId : isUserExist.id
    },process.env.JWT_SECRET_KEY as string)
    return res.json({token : token});
});
// router.get('/',authMiddleware,(req :Request,res:Response)=>{
//     return res.json({msg : "hii there"})
// })

const updateBody = z.object({
    username : z.string().optional(),
    firstName : z.string().optional(),
    lastName : z.string().optional()
})
router.put('/',authMiddleware,async (req :Request,res:Response)=>{
    const {success,data} = updateBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            errors : "error while updating info"
        })
    }
    await prisma.user.update({
        where :{
            id : Number(req.userId)
        },
        data
    })
    return res.status(200).json({
        msg: "Updated successfully"
    });
})
router.get('/bulk',authMiddleware,async (req :Request,res:Response)=>{
    const filter = (req.query.filter as string) || ""
    const users = await prisma.user.findMany({
        where : {
            OR : [{firstName : {contains : filter,mode : "insensitive"}},
                {lastName : {contains : filter,mode : "insensitive"}}
            ]
        },
        select : {
            id : true,
            username : true,
            firstName : true,
            lastName : true
        }
    })
    return res.json({users})
})

export default router;
