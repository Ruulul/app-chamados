import express from 'express'
import memory from '../memory.js'

const {
    variables: {
    },
    updaters: {
    }
} = memory

const app = express.Router()

app.get('/api/log/:model/:tag/:id')
app.post('/api/log/:model/:tag/:id')
app.put('/api/log/:model/:tag/:id')
app.delete('/api/log/:model/:tag/:id')

export default app