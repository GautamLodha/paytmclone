import "dotenv/config"
import express from 'express'
import mainRouter from '../routes/index.ts'


const app = express()


app.use('/api/v1',mainRouter)

app.listen(process.env.PORT,()=>{
    console.log(`runnign at ${process.env.PORT} ` );
    
})
