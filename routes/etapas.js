import express from 'express'
import memory from '../memory.js'
import { deleteCampo } from './misc.js'
import { invalidateFieldsAndReject, invalidateFields, undoStuff } from './utils.js'

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

app.get('/api/processo/:tagProcesso/:idProcesso/etapa', async (req, res)=>{
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
app.get('/api/processo/:tagProcesso/:idProcesso/etapa')
app.get('/api/processo/:tagProcesso/:idProcesso/etapa/:tag')

async function getEtapa(req, res) {
    let { tag, tagProcesso, idProcesso, id } = req.params
    let etapa = (tagProcesso && idProcesso)
    ? etapas.get().find(etapa=>
        etapa.Tag===tag&&
        etapa.id===parseInt(id)&&
        etapa.idProcesso===parseInt(idProcesso)&&
        processos.get().find(processo=>processo.id===parseInt(idProcesso)).Tag===tagProcesso)
    : etapas.get().find(etapa=>etapa.Tag===tag&&etapa.id===parseInt(id))
    if (!etapa) return res.sendStatus(400)
    etapa.campos = metadados.get().filter(data=>
        data.model==='etapa'&&
        data.idModel===etapa.id
        )
    etapa.log = log.get().filter(log=>log.idEtapa===etapa.id).sort((a, b)=>b.id - a.id)
    etapa.campos = metadados.get().filter(data=>
        data.model==='etapa'&&
        data.idModel===etapa.id)
    res.send(etapa)
}
async function getEtapaSimples(req, res) {
    let etapa = etapas.get().find(etapa=>etapa.id===parseInt(req.params.id))
    if (!etapa) return res.sendStatus(400)
    etapa.log = log.get().filter(log=>log.idEtapa===etapa.id).sort((a, b)=>b.id - a.id)
    res.send(etapa)
}
app.get('/api/:filial/etapa/:tag/:id', getEtapa)
app.get('/api/:filial/processo/:tagProcesso/:idProcesso/etapa/:tag/:id', getEtapa)
app.get('/api/:filial/etapa/:id', getEtapaSimples)
app.post('/api/:filial/processo/:tagProcesso/:idProcesso/etapa/:id_etapaMeta', async (req, res)=>{
    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando ir para a próxima etapa (${req.params.id_etapaMeta}) no processo ${req.params.idProcesso}`)
    /**Lista de passos de manipulações do BD que devem ser desfeitos em alguma falha */
    let undo_stuff = []
    let idud = 0
    try {
        /**O processo que está indo a uma nova etapa */
        let processo = processos.get().find(processo=>processo.id===parseInt(req.params.idProcesso))
        if (processo.Tag != req.params.tagProcesso) {
            console.error("Tag incompatível")
            return res.sendStatus(400)
        }
        let meta_processo = metameta.get().processo[processo.Tag]
        /**Valida os params do request */
        if (!meta_processo || !processo) {
            console.error("Sem meta informações do processo ou sem processo")
            return res.sendStatus(400)
        }
        let etapa_atual = etapas.get().find(etapa=>etapa.id===processo.idEtapaAtual)
        let meta_etapa;
        for (let _meta_etapa of meta_processo.etapas) {
            if (_meta_etapa.Tag === etapa_atual.Tag) {
                meta_etapa = _meta_etapa;
                break;
            }
        }
        
        let id_params = parseInt(req.params.id_etapaMeta)
        let meta_etapa_next_from_req = meta.find(etapa=>etapa.id===id_params)
        let meta_etapa_next_from_meta = meta_processo.etapas.find(etapa=>etapa.id===meta_etapa.next)
        
        let meta_etapa_next;
        if (meta_etapa_next_from_meta?.id === id_params)
            meta_etapa_next = meta_etapa_next_from_meta
        else if (meta_etapa.complex && meta_etapa_next_from_req?.id === meta_etapa.id)
            meta_etapa_next = meta_etapa_next_from_req
        else {
            console.error("Sem meta_etapa_next encontrada")
            return res.sendStatus(400)
        }
        if (!meta_etapa_next.dept && !metameta.get().etapa.find(etapa=>etapa.id===meta_etapa_next.id)?.depts?.map(dept=>dept.id).includes(req.body.dept)) {
            console.error("Sem departamento válido");
            console.error({meta_etapa_next});
            console.error(untagged_meta.find(meta=>meta.id===meta_etapa_next.id));
            console.error(req.body);
            return res.sendStatus(400)
        }
        let campos = meta.campos[meta_etapa_next.Tag]
        if (!campos) {
            console.error("Sem informação de campos para a Tag de meta_etapa_next", meta_etapa_next)
            return res.sendStatus(500)
        }
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
        
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) levou o processo ${req.params.idProcesso} para a etapa ${req.params.id_etapaMeta}`)
        
        res.send(etapas.get().find(etapa=>etapa.id===etapa_next.id))
    } catch (e) {
        console.error('some unexpected error occurred: ', e)
        undoStuff(undo_stuff, prisma)
        res.sendStatus(500);
    }
})

app.put('/api/:filial/etapa/:tag/:id', async (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    
    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando editar a etapa ${req.params.id}: ${JSON.stringify(req.body)}`)
    
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
                        campo,
                    },
                    data: {
                        valor: valor.toString(),
                    }
                }))
        
        let time_data = ['inicio_em', 'fim_em', 'pausa_em']
        if (time_data.reduce((p, c)=>p+Object.keys(req.body).includes(c) ? 1 : 0, 0) > 0) 
            for (let data of time_data)
                if (Object.keys(req.body).includes(data)) 
                    await prisma.metadado.create({
                        data: {
                            campo: data,
                            valor: req.body[data],
                            model: 'etapa',
                            idModel: parseInt(req.params.id),
                        }
                    });
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) editou a etapa ${req.params.id} com sucesso`)
        await updateMetadados()
        await updateEtapas()
        await updateProcessos()
        res.sendStatus(200);
    } catch (e) {
        console.error(e)
        res.sendStatus(500);
    }
})

app.post('/api/:filial/processo/:tagProcesso/:idProcesso/etapa/:tag/:id/mensagem', async (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    if (!('titulo' in req.body && 'descr' in req.body)) return res.sendStatus(400)
    let user = usuarios.get()[req.session.usuarioId]

    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando adicionar uma mensagem à etapa ${req.params.id}: ${JSON.stringify(req.body)}`)

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
                prev: last_msg?.id || null,
            }
        })
        undo_stuff.push({id: ++idud, model: 'log', where: [['id', msg.id]], action: 'delete'})

        if (last_msg) {
            await prisma.log.update({
                where: {
                    id: last_msg.id
                },
                data: {
                    next: msg.id
                }
            })
            undo_stuff.push({id: ++idud, model: 'log', where: [['id', last_msg.id]], action: 'update', data: {next:null}})
        }
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) adicionou com sucesso uma mensagem à etapa ${req.params.id}`)
        await updateLog()
        res.send(log.get().find(log=>log.id===msg.id))
    } catch (e) {
        console.error(e)
        await undoStuff(undo_stuff, prisma)
        res.sendStatus(500)
    }
})
app.put('/api/:filial/processo/:tagProcesso/:idProcesso/etapa/:tag/:id/mensagem/:id_msg', (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403)
    if (!('titulo' in req.body && 'descr' in req.body)) return res.sendStatus(400)
    let user = usuarios.get()[req.session.usuarioId]

    let processo = processos.get().find(processo=>processo.id===parseInt(req.params.idProcesso) && processo.Tag===req.params.tagProcesso)
    if (!processo) return res.sendStatus(400)
    let etapa = etapas.get().find(etapa=>etapa.id===parseInt(req.params.id) && etapa.Tag===req.params.tag)
    if (!etapa) return res.sendStatus(400)
    if (!(processo.idUsuario===user.id)&&!(user.cargo==='admin'||user.tipo==='suporte')) return res.sendStatus(403)

    // TODO: Edição de mensagem
})

app.delete('/api/:filial/mensagem/:id', async (req, res)=>{
    if (!req.session.valid) return res.sendStatus(403);

    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando deletar a mensagem ${req.params.id}`)
    
    let msg = log.get().find(log=>log.id===parseInt(req.params.id));
    if (msg.idUsuario != req.session.usuarioId) return res.sendStatus(403);
    let dados = metadados.get().filter(data=>data.model='log'&&data.idModel===msg.id);
    let undo_stuff = [];
    let idd = 0;
    try {
        await Promise.all(dados.map(dado=>deleteCampo({model: 'log', tag: msg.Tag, campo: dado.campo, id: dado.id}).then(undo_stuff.push({id: ++idd, model: 'metadado', where: [[]], action: 'create', data: dado}))))
        let undo = await prisma.log.delete({where:{id: msg.id}})
        undo_stuff.push({id: ++idd, model: 'log', where: [[]], action: 'create', data: undo})
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) deletou com sucesso a mensagem ${req.params.id}`)
        await updateLog()
        res.sendStatus(200)
    } catch (e) {
        console.error(e)
        await undoStuff(undo_stuff, prisma);
        res.sendStatus(500)
    }
})

export default app