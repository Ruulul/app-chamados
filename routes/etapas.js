import express from 'express'
import memory from '../memory.js'
import { invalidateFieldsAndReject, invalidateFields, resetAutoIncrement, undoStuff } from './utils.js'

const {
    variables: {
        usuarios,
        etapas,
        processos,
        log,
        metadados,
        metameta,
        prisma
    },
    updaters: {
        updateEtapas,
        updateProcessos,
        updateLog,
        updateMetadados,
        updateMetaMeta
    }
} = memory

const model = 'etapa'
await updateMetaMeta()
var meta = metameta.get()[model]
var untagged_meta = Object.entries(meta).map(etapa=>({Tag: etapa[0], ...etapa[1]}))
meta.campos = metameta.get().campos[model]

const app = express.Router()

app.get('/api/processos/:tagProcesso/:idProcesso/etapas', async (req, res)=>{
    try {
        res.send(
            etapas.get().filter(etapa=>etapa.idProcesso===parseInt(req.params.idProcesso))
            .map(etapa=>({...etapa, 
                campos:metadados.get().filter(dado=>dado.model==='etapa'&&dado.idModel===etapa.id),
                log:log.get().filter(msg=>msg.idEtapa===etapa.id)
            }))
        )
    } catch {
        res.sendStatus(400)
    }
})
app.get('/api/processos/:tagProcesso/:idProcesso/etapas')
app.get('/api/processos/:tagProcesso/:idProcesso/etapas/:tag')
app.get('/api/processos/:tagProcesso/:idProcesso/etapas/:tag/:id')
app.post('/api/:filial/processos/:tagProcesso/:idProcesso/etapas/:id_etapaMeta', async (req, res)=>{
    /**Lista de passos de manipulações do BD que devem ser desfeitos em alguma falha */
    let undo_stuff = []
    let idud = 0
    try {
        /**O processo que está indo a uma nova etapa */
        let processo = processos.get().find(processo=>processo.id===parseInt(req.params.idProcesso))
        if (processo.Tag != req.params.tagProcesso) return res.sendStatus(400)
        let meta_processo = metameta.get().processo[processo.Tag]
        /**Valida os params do request */
        if (!meta_processo || !processo) return res.sendStatus(400)

        let etapa_atual = etapas.get().find(etapa=>etapa.id===processo.idEtapaAtual)
        let meta_etapa = meta[etapa_atual.Tag]
        
        let id_params = parseInt(req.params.id_etapaMeta)
        let meta_etapa_next_from_req = untagged_meta.find(etapa=>etapa.id===id_params)
        let meta_etapa_next_from_meta = meta_processo.etapas.find(etapa=>etapa.id===meta_etapa.next)
        
        let meta_etapa_next;
        if (meta_etapa_next_from_meta?.id === id_params)
            meta_etapa_next = meta_etapa_next_from_meta
        else if (meta_etapa.complex && meta_etapa_next_from_req?.id === meta_etapa.id)
            meta_etapa_next = meta_etapa_next_from_req
        else return res.sendStatus(400)
        if (!(meta_etapa_next.dept || metameta.get().etapa[meta_etapa_next.Tag].depts.map(dept=>dept.id).includes(req.body.dept)))
            return res.sendStatus(400)
        let campos = meta.campos[meta_etapa_next.Tag]
        if (!campos) return res.sendStatus(500)
        let message = invalidateFieldsAndReject(campos, req.body)
        if (message) return res.status(400).send(message)

        let etapa_next = await prisma.etapa.create({
            data: {
                idProcesso: processo.id,
                Tag: meta_etapa_next.Tag,
                prev: etapa_atual.id,
                dept: meta_etapa_next.dept || req.body.dept
            }
        })
        undo_stuff.push({id: ++idud, model: 'etapa', where: [['id', etapa_next.id]], action: 'delete'})

        await prisma.etapa.update({
            where: {
                id: etapa_atual.id
            },
            data: {
                next: etapa_next.id
            }
        })
        undo_stuff.push({id: ++idud, model: 'etapa', where: [['id', etapa_atual.id]], data: {next: null}, action: 'update'})
        
        await prisma.metadado.createMany({
            data: campos.map(option=>({
                model: 'etapa',
                idModel: etapa_next.id,
                campo: option.campoMeta,
                valor: req.body[option.campoMeta].toString()
            }))
        })
        undo_stuff.push({id: ++idud, model: 'metadado', where: [['idModel', etapa_next.id],['model', 'etapa']], action: 'deleteMany'})

        await prisma.processo.update({
            where: {
                id: processo.id
            },
            data: {
                idEtapaAtual: etapa_next.id
            }
        })
        undo_stuff.push({id: ++idud, model: 'processo', where: [['id', processo.id]], data: {idEtapaAtual: processo.idEtapaAtual}, action: 'update'})

        await Promise.all([
            updateEtapas(),
            updateMetadados(),
            updateProcessos(),
        ])
        res.send(etapas.get().find(etapa=>etapa.id===etapa_next.id))
    } catch (e) {
        console.error('some unexpected error occurred: ', e)
        while (undo_stuff.length > 0) {
            for (let op of undo_stuff) {
                console.error("undoing", op, '\n')
                await prisma[op.model][op.action]({
                    where: Object.fromEntries(op.where),
                    data: op.data
                })
                .then(()=>undo_stuff=undo_stuff.filter(({id})=>id!=op.id))
                .then(()=>resetAutoIncrement(op.model, prisma))
                .catch(console.error)
            }
        }
        res.sendStatus(500);
    }
})
app.put('/api/:filial/processos/:tagProcesso/:idProcesso/etapas/:tag/:id', async (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    let etapa = etapas.get().find(etapa=>etapa.id===parseInt(req.params.id))
    if (!etapa || etapa.Tag !== req.params.tag) return res.sendStatus(400)
    console.error("etapa válida")
    let campos = meta.campos[etapa.Tag]
    if (!campos) return res.sendStatus(500)
    if (invalidateFields(campos, req.body)?.invalid.length > 0) return res.sendStatus(400)
    console.error("campos válidos")
    try {
        let key_value = Object.entries(req.body)
        for (let [campo, valor] of key_value)
            if (meta.campos[req.params.tag].map(campo=>campo.campoMeta).includes(campo)) 
                (console.error(`going to change ${campo} to ${valor}`), await prisma.metadado.updateMany({
                    where:{
                        model: 'etapa',
                        idModel: parseInt(req.params.id),
                        campo
                    },
                    data: {
                        valor: valor.toString()
                    }
                }))
        await updateMetadados()
        await updateEtapas()
        await updateProcessos()
        res.sendStatus(200);
    } catch (e) {
        console.error(e)
        res.sendStatus(500);
    }
})

app.post('/api/:filial/processos/:tagProcesso/:idProcesso/etapas/:tag/:id/mensagem', async (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    if (!('titulo' in req.body && 'descr' in req.body)) return res.sendStatus(400)
    let user = usuarios.get()[req.session.usuarioId]

    let processo = processos.get().find(processo=>processo.id===parseInt(req.params.idProcesso) && processo.Tag===req.params.tagProcesso)
    if (!processo) return res.sendStatus(400)
    let etapa = etapas.get().find(etapa=>etapa.id===parseInt(req.params.id) && etapa.Tag===req.params.tag)
    if (!etapa) return res.sendStatus(400)
    if (!(processo.idUsuario===user.id)&&!(user.cargo==='admin'||user.tipo==='suporte')) return res.sendStatus(403)

    let undo_stuff = []
    let idud = 0
    try {
        let last_msg = log.get().find(msg=>msg.idEtapa===etapa.id&&msg.idProcesso===processo.id&&!msg.next)
        let msg = await prisma.log.create({
            data: {
                titulo: req.body.titulo,
                descr: req.body.descr,
                idEtapa: etapa.id,
                idProcesso: processo.id,
                idUsuario: user.id,
                Tag: metameta.get().processo[processo.Tag].mensagemTag,
                prev: last_msg.id
            }
        })
        undo_stuff.push({id: ++idud, model: 'log', where: [['id', msg.id]], action: 'delete'})

        await prisma.log.update({
            where: {
                id: last_msg.id
            },
            data: {
                next: msg.id
            }
        })
        undo_stuff.push({id: ++idud, model: 'log', where: [['id', last_msg.id]], action: 'update', data: {next:null}})

        await updateLog()
        res.sendStatus(200)
    } catch (e) {
        console.error(e)
        await undoStuff(undo_stuff, prisma)
        res.sendStatus(500)
    }
})
app.put('/api/:filial/processos/:tagProcesso/:idProcesso/etapas/:tag/:id/mensagem/:id_msg', (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    if (!('titulo' in req.body && 'descr' in req.body)) return res.sendStatus(400)
    let user = usuarios.get()[req.session.usuarioId]

    let processo = processos.get().find(processo=>processo.id===parseInt(req.params.idProcesso) && processo.Tag===req.params.tagProcesso)
    if (!processo) return res.sendStatus(400)
    let etapa = etapas.get().find(etapa=>etapa.id===parseInt(req.params.id) && etapa.Tag===req.params.tag)
    if (!etapa) return res.sendStatus(400)
    if (!(processo.idUsuario===user.id)&&!(user.cargo==='admin'||user.tipo==='suporte')) return res.sendStatus(403)
})

export default app