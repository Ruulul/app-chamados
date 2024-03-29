import express from 'express'
import memory from '../memory.js'
import { deleteCampo, getCampo } from './misc.js'
import { invalidateFields, resetAutoIncrement, undoStuff } from './utils.js'
const {
    variables: {
        usuarios,
        departamentos,
        processos,
        etapas,
        metadados,
        log,
        metameta,
        prisma
    },
    updaters: {
        updateProcessos,
        updateEtapas,
        updateMetadados,
        updateLog,
        updateMetaMeta
    },
} = memory

const model = 'processo'
await updateMetaMeta()
var meta = metameta.get()[model]
meta.campos = metameta.get().campos[model]

const app = express.Router()

/**
 * 
 * @param {import('@prisma/client').Processo} processo 
 * @param {import('@prisma/client').Usuario} user 
 * @returns 
 */
function filterProcessos (processo, user) {
    let etapa = etapas.get().find(etapa=>etapa.id===processo.idEtapaAtual)
    let dept = departamentos.get().find(dept=>dept.id===etapa.dept)?.departamento
    if (user.dept.includes(dept) || user.cargo === 'admin')
        return true
    return false
}

app.get('/api/:filial/processo', (req, res)=>{
    let user = usuarios.get()[req.session.usuarioId]
    if (!req.session.valid) return res.sendStatus(403)
    if (user.cargo === 'admin' || user.tipo === 'suporte')
        res.send(processos.get().filter(processo=>filterProcessos(processo, user)||processo.idUsuario==user.id).map(addCamposProcesso))
    else res.send(processos.get().filter(processo=>processo.idUsuario==user.id).map(addCamposProcesso))
})

app.get('/api/:filial/processo/:tag', (req, res)=>{
    let user = usuarios.get()[req.session.usuarioId]
    if (!req.session.valid) return res.sendStatus(403)
    res.send(processos.get().filter(processo=>processo.Tag==req.params.tag&&(filterProcessos(processo, user)||processo.idUsuario==user.id)).map(addCamposProcesso))
})

app.get('/api/:filial/processo/:tag/:id', (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    let processo = processos.get().find(processo=>processo.id===parseInt(req.params.id))
    if (!processo) return res.sendStatus(404)
    processo = addCamposProcesso(processo);
    let log_processo = log.get().filter(mensagem=>mensagem.idProcesso === processo.id)
    processo.log = log_processo
    res.send(processo)
})


app.post('/api/:filial/processo/:tag', async (req, res)=>{
    let idUsuario = req.session.usuarioId

    let user = usuarios.get()[idUsuario]
    
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando iniciar um processo de ${req.params.tag}`)

    if (!req.session.valid) return res.sendStatus(403)

    let campos_processo =  metameta.get().campos.processo[req.params.tag]
    let primeira_etapa_tag = metameta.get().processo[req.params.tag]?.etapas[0].Tag
    let campos_etapa = metameta.get().campos.etapa[primeira_etapa_tag]
    if ([campos_processo, primeira_etapa_tag, campos_etapa].includes(undefined)) return res.sendStatus(400)
    let campos_list = [...campos_etapa, ...campos_processo]

    let meta_etapa1 = meta[req.params.tag].etapas.find(etapa=>!etapa.prev)
    let invalidation = invalidateFields(campos_list, req.body)
    if (invalidation || 
        !('mensagem' in req.body) || 
        !('dept' in req.body) || 
        !(meta_etapa1.dept || metameta.get().etapa.find(etapa=>etapa.id===meta_etapa1.id)?.depts?.map(dept=>dept.id).includes(req.body.dept))) {
        let message = 
        `
        Invalid Request.<br>
        Missing/Invalid fields.<br>
        Missing: ${invalidation?.missing}<br>
        Invalid: ${invalidation?.invalid}<br>
        `
        return res.status(400).send(message)
    }
    
    console.error('body:', req.body)

    let undo_stuff = []
    let undo_stuff_id = 0;
    try {
        let {id: idProcesso, Tag: tagProcesso} = await prisma.processo.create({
            data: {
                Tag: req.params.tag,
                idUsuario
            },
        })
        undo_stuff.push({id: ++undo_stuff_id, model: 'processo',where:[['id', idProcesso]], action: 'delete'})
        let metadado_templace = {model: 'processo', idModel: idProcesso}
        await prisma.metadado.createMany({
            data: meta.campos[tagProcesso].map(({campoMeta})=>({...metadado_templace, campo: campoMeta, valor: req.body[campoMeta].toString()}))
        })
        undo_stuff.push({id: ++undo_stuff_id, model: 'metadado', where: [['model', 'processo'],['idModel', idProcesso]], action: 'deleteMany'})
    
        let {id: idEtapa, Tag: tagEtapa} = await prisma.etapa.create({
            data: {
                idProcesso,
                Tag: meta_etapa1.Tag,
                dept: meta_etapa1.dept || parseInt(req.body.dept)
            }
        })
        let processo = await prisma.processo.update({
            where: {id: idProcesso},
            data: {idEtapaAtual: idEtapa},
        })
        undo_stuff.push({id: ++undo_stuff_id, model: 'etapa',where:[['id', idEtapa]], action: 'delete'})
    
        metadado_templace = {model: 'etapa', idModel: idEtapa}
        await prisma.metadado.createMany({
            data: 
            metameta.get()
            .campos.etapa[tagEtapa]
            .map(campo=>(
                {...metadado_templace, 
                    campo: campo.campoMeta, 
                    valor: req.body[campo.campoMeta].toString()
                }
            ))
        })
        undo_stuff.push({id: ++undo_stuff_id, model: 'metadado', where: [['model', 'etapa'],['idModel', idEtapa]], action: 'deleteMany'})
        
        let {id: idLog} = await prisma.log.create({
            data: {
                titulo: req.body.mensagem.titulo,
                descr: req.body.mensagem.descr,
                Tag: meta[tagProcesso].mensagemTag,
                idEtapa,
                idProcesso,
                idUsuario
            }
        })
        undo_stuff.push({id: ++undo_stuff_id, model: 'log', where: [['id', idLog]], action: 'delete'})
        
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) iniciou com sucesso o processo de ${tagProcesso} ${req.body.mensagem.titulo} com id ${idProcesso}`)
        
        await Promise.all([
            updateProcessos(), updateEtapas(), updateMetadados(), updateLog()
        ])
        res.send(processo);
    } catch (e) {
        console.error('some unexpected error occurred: ', e)
        await undoStuff(undo_stuff, prisma)
        res.sendStatus(500);
    }
})

app.put('/api/:filial/processo/:tag/:id', async (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)

    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando editar o processo ${req.params.id} de ${req.params.tag}`)

    try {
        let key_value = Object.entries(req.body)
        for (let [campo, valor] of key_value)
            if (meta[req.params.tag].includes(campo)) 
                await prisma.metadado.updateMany({
                    where: {
                        model: 'processo',
                        idModel: parseInt(req.params.id),
                        campo
                    },
                    data: {
                        valor: valor.toString()
                    }
                })
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) editou com sucesso o processo ${req.params.id} de ${req.params.tag}`)
        res.sendStatus(200);
    } catch (e) {
        console.error(e)
        res.sendStatus(500);
    }
})

app.delete('/api/processo/:tag/:id', async (req, res) =>{
    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando deletar o processo ${req.params.id} de ${req.params.tag}`)
    if (!req.session.valid || user.cargo != 'admin') return res.sendStatus(403)
    let processo = processos.get().find(processo=>processo.id===parseInt(req.params.id))
    if (!processo) return res.sendStatus(200)
    let etapas = await prisma.etapa.findMany({where:{idProcesso:processo.id}})
    let anexos_processo = await getCampo({ model: 'processo', idModel: processo.id, tag: processo.Tag, campo: 'anexo'})
    if (anexos_processo instanceof Error) {
        if (anexos_processo.message !== "Sem campo requisitado") {
            console.error(anexos_processo)
            return res.sendStatus(400)
        }
    }
    else anexos_processo = anexos_processo.map(({id})=>({id, model: 'processo', idModel: processo.id, tag: processo.Tag, campo: 'anexo'}))
    let anexos_etapa = []
    let anexos_log = []
    for (let etapa of etapas) {
        let inner_anexos = await getCampo({ model: 'etapa', idModel: etapa.id, tag: etapa.Tag, campo: 'anexo' })
        if (inner_anexos instanceof Error)
            if (inner_anexos.message === "Sem campo requisitado") continue
            else {
                console.error(inner_anexos)
                continue
            }
            inner_anexos = inner_anexos.map(({id})=>({id, model: 'etapa', idModel: etapa.id, tag: etapa.Tag, campo: 'anexo'}))
        anexos_etapa = anexos_etapa.concat(inner_anexos)
        let logs = log.get().filter(log=>log.idEtapa===etapa.id)
        for (let log of logs) {
            let inner_anexos = await getCampo({ model: 'log', idModel: log.id, tag: log.Tag, campo: 'anexo' })
            if (inner_anexos instanceof Error)
                if (inner_anexos.message === "Sem campo requisitado") continue
                else {
                    console.error(inner_anexos)
                    continue
                }
            inner_anexos = inner_anexos.map(({id})=>({id, model: 'log', idModel: log.id, tag: log.Tag, campo: 'anexo'}))
            anexos_log = anexos_log.concat(inner_anexos)
        }
    }
    let anexos = []
    for (let array of [anexos_processo, anexos_etapa, anexos_log])
        if (Array.isArray(array)) anexos = anexos.concat(array)
    try {
        while (anexos.length > 0) {
            for (let anexo of anexos) {
                let return_value = await deleteCampo(anexo)
                if (return_value instanceof Error) {
                    console.error(`for anexo ${anexo}, \n`, return_value);
                    continue
                }
                anexos = anexos.filter(anex=>anex.id !== anexo.id)
            }
        }
        let not_done_yet = true;
        while (not_done_yet)
        await prisma.$transaction([
            prisma.processo.deleteMany({where:{id: processo.id}}),
            prisma.etapa.deleteMany({where:{idProcesso: processo.id}}),
            prisma.metadado.deleteMany({where:{model: 'processo', idModel: processo.id}}),
            ...etapas.map(etapa=>prisma.metadado.deleteMany({where:{model: 'etapa', idModel: etapa.id}})),
            prisma.log.deleteMany({where:{idProcesso: processo.id}}),
        ]).then(()=>not_done_yet=false)
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) deletou com sucesso o processo ${req.params.id} de ${req.params.tag}`)
        await Promise.all([
            resetAutoIncrement('processo', prisma),
            resetAutoIncrement('metadado', prisma),
            resetAutoIncrement('etapa', prisma),
            resetAutoIncrement('log', prisma)
        ]).catch(console.error)
        await Promise.all([
            updateProcessos(),
            updateMetadados(),
            updateEtapas(),
            updateLog(),
        ])
        res.sendStatus(200)
    } catch {
        console.error("Ouch")
        res.sendStatus(500)
    }
})

export default app

/**
 * 
 * @param {import('@prisma/client').Processo} processo 
 * @returns 
 */
function addCamposProcesso (processo) {
    processo.campos = metadados.get().filter(dado=>dado.model==='processo' && dado.idModel===processo.id).map(dado=>[dado.campo, dado.valor])
    processo.etapa = etapas.get().find(etapa=>etapa.id===processo.idEtapaAtual)
    processo.etapa.campos = metadados.get().filter(dado=>dado.model==='etapa' && dado.idModel===processo.etapa.id).map(dado=>[dado.campo, dado.valor])
    processo.log = []
    processo.log[0] = log.get().filter(mensagem=>mensagem.idProcesso === processo.id).find(mensagem=>!mensagem.prev)
    return processo
}