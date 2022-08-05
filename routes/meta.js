import express from 'express'
import memory from '../memory.js'

const {
    variables: {
        metameta
    },
    updaters: {
    }
} = memory

const app = express.Router()

app.get('/api/:filial/meta/:model', (req, res)=>{
    res.send(metaFromModel(req.params.model))
})
app.get('/api/:filial/meta/:model/campos', (req, res)=>{
    res.send(metaCamposFromModel(req.params.model))
})

app.get('/api/:filial/meta/:model/:tag', (req, res)=>{
    res.send(metaFromModel(req.params.model)[req.params.tag])
})
app.get('/api/:filial/meta/:model/:tag/campos', (req, res)=>{
    res.send(metaCamposFromModel(req.params.model)[req.params.tag])
})
export default app


export function metaFromModel (model) {
    return metameta.get()[model]
}

export function metaCamposFromModel (model) {
    return metameta.get().campos[model]
}