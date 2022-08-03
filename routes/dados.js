import express from 'express'
import memory from '../memory.js'

const {
    variables: {
    },
    updaters: {
    }
} = memory

const app = express.Router()

app.get('/api/dados/:model/:tag/:id')
app.get('/api/dados/:model/:tag/:id/:campo')
app.post('/api/dados/:model/:tag/:id/:campo')
app.put('/api/dados/:model/:tag/:id/:campo')
app.delete('/api/dados/:model/:tag/:id/:campo')

export default app