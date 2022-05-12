import {createElement as e, useState} from 'preact/compat'

import AddCategoria from '../Components/AddCategoria'
import AddDepartamento from '../Components/AddDepartamento'

import {
    Typography,
    Button,
    Card,
    Stack,
    Grid,
    ButtonGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'

const BProps = {
    sx:
        {
        width: '50%',
        display: 'grid',
        placeSelf: 'center'
        }
}

export default function Config() {
    const [state, setState] = useState(undefined)

    function setCategoria() {
        setState('Categoria')
    }

    function setDepartamento() {
        setState('Departamento')
    }

    function voltaMenu() {
        setState(undefined)
    }

    function AddBotao(Component) {
        return <Grid display='grid'>
                <Component/>
                <Button {...BProps} variant='contained' sx={{width: '30em', display: 'grid', placeSelf: 'center'}} onClick={voltaMenu}>
                    Voltar ao Menu
                </Button>
        </Grid>
    }

    return state ? 
        AddBotao(
            state == 'Categoria' ?
                AddCategoria
            : state == 'Departamento' ?
                AddDepartamento
            : ()=><Typography>Isso não devia aparecer</Typography>
        )
        : e(
            Grid,
            {sx:{width:'30em'},
            display:'grid',
            marginY: 3,
            marginX: 'auto'},
            
            e(
                Accordion,
                {
                    spacing: 2,
                    elevation: 5,
                    padding: 3,
                    margin: 3
                },
                [
                    e(
                        AccordionSummary,
                        {key: 1, sx:{display: 'grid'}},
                        e(
                            Typography,
                            {},
                            'Opções'
                        )
                    ),
                    e(
                        AccordionDetails,
                        {key: 2,
                        padding: 5},
                        e(
                            ButtonGroup,
                            {orientation: 'vertical', variant: 'contained', sx:{width: '100%', paddingTop: 3, paddingBottom: 2}, elevation: 0},
                            [
                                e(
                                    Button,
                                    {key: 1, ...BProps,
                                    onClick: setCategoria
                                    },
                                    'Categorias'
                                ),
                                e(
                                    Button,
                                    {key: 2, ...BProps,
                                    onClick: setDepartamento},
                                    'Departamentos'
                                )
                            ]
                        )
                    )
                ]
            )
        )
}