import express,{Request,Response} from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'
const router = express.Router()


router.get('/balance',authMiddleware,async(req:Request,res:Response)=>{
    const user = await prisma.user.findFirst({
        where : {
            id : Number(req.userId)
        },
        select : {
            account : {
                select : {
                    balance : true
                }
            }
        }
    });
    return res.json({
        balance : user?.account?.balance ?? 0
    })
})
router.post('/transfer',authMiddleware,async(req:Request,res:Response)=>{
    const {amount,to} = req.body
    const parsedAmount = Number(amount)
    if(parsedAmount <= 0){
        return res.status(400).json({msg : "Invalid amount"})
    }
    try {
        await prisma.$transaction(async (tx)=>{
            
            const sender = await tx.user.findUnique({
                where : {
                    id : Number(req.userId)
                },
                select : {
                    account : {
                        select : {
                            balance : true
                        }
                    }
                }
            })
            if(!sender || sender.account?.balance < parsedAmount){
                throw new Error("Insufficient balance");
            }
            const receiver = await tx.account.findUnique({
                where : {
                    userId : Number(to)
                },
            })
            if(!receiver){
                throw new Error("The user you want to send money doesnt exist");
            }
            await tx.account.update({
                where : {
                    userId : Number(req.userId)
                },
                data : {
                    balance : {
                        decrement : parsedAmount
                    }
                }
            })
            await tx.account.update({
                where : {
                    userId : Number(to)
                },
                data : {
                    balance : {
                        increment : parsedAmount
                    }
                }
            })
            // console.log("here");
        })
        return res.json({ msg: "Transfer successful" });
    } catch (error : any) {
        return res.status(400).json({
            msg : error.message || "transfer failed"
        })
    }
})
export default router