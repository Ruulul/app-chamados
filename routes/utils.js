/**
 * 
 * @param {import('@prisma/client').CampoMeta[]} campos_list 
 * @returns {undefined | {missing: string[], invalid: string[]}}
 */
export function invalidateFieldsAndReject(campos_list, body) {
    let invalidation = invalidateFields(campos_list, body)
    if (invalidation) {
        let message = 
        `
        Invalid Request.
        Missing/Invalid fields.
        Missing: ${invalidation.missing}
        Invalid: ${invalidation.invalid}
        `
        return message
    }
}

export function invalidateFields(campos_list, body) {
    let missing_fields = []
    let invalid_fields = []
    let campos_list_names = [...campos_list.map(campo=>campo.campoMeta)]
    for (let campo_name of campos_list_names) {
        if (!(campo_name in body)) {
            missing_fields.push(campo_name)
        } else {
            let campo = campos_list.find(campo=>campo.campoMeta===campo_name) 
            if (campo.hasDict)
                if (!campo.opcoes.includes(body[campo_name]))
                    invalid_fields.push(campo_name)
        }
    }
    let thing = undefined
    if (missing_fields.length > 0 || invalid_fields > 0) {
        thing = {
            missing: missing_fields,
            invalid: invalid_fields
        }
    }
    return thing
}


export async function resetAutoIncrement(model, prisma) {
    switch (model) {
        case 'processo':
                await prisma.$executeRawUnsafe(`alter table processo modify id INT;`)
                await prisma.$executeRawUnsafe(`alter table processo modify id INT auto_increment;`)
            break;
        case 'etapa':
                await prisma.$executeRawUnsafe(`alter table etapa modify id INT;`)
                await prisma.$executeRawUnsafe(`alter table etapa modify id INT auto_increment;`)
            break;
        case 'metadado':
                await prisma.$executeRawUnsafe(`alter table metadado modify id INT;`)
                await prisma.$executeRawUnsafe(`alter table metadado modify id INT auto_increment;`)
            break;
        case 'log':
                await prisma.$executeRawUnsafe(`alter table log modify id INT;`)
                await prisma.$executeRawUnsafe(`alter table log modify id INT auto_increment;`)
            break;
        default: console.error("Unknown model")
    }
}