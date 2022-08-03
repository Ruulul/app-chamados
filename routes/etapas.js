import express from 'express'
import memory from '../memory.js'

const {
    variables: {
    },
    updaters: {
    }
} = memory

const app = express.Router()

app.get('/api/etapas/:tag')
app.get('/api/etapas/:tag/:id')
app.post('/api/etapas/:tag')
app.put('/api/etapas/:tag/:id')

export default app