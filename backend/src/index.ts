import "dotenv/config"
import express from 'express'
import mainRouter from '../routes/index'
import cors from 'cors'


const app = express()
app.use(express.json())
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}));

app.use('/api/v1',mainRouter)

app.listen(process.env.PORT,()=>{
    console.log(`runnign at ${process.env.PORT} `);
})
