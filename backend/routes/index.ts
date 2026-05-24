import express from 'express'
import userRouter from './user'
import accountRouter from './account'
const app = express()

const router = express.Router()

router.use('/user',userRouter)
router.use('/account',accountRouter)

export default router