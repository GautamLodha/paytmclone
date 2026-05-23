import express from 'express'
const app = express()
app.use(express.json())

const router = express.Router()

router.post('/signup',(req,res)=>{

})
router.post('/login',(req,res)=>{

})

export default router