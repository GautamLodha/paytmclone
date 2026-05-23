import express from 'express'
import userRouter from './user.ts'
const app = express()

const router = express.Router()

router.use('/user',userRouter)
// router.use('/account')

export default router