import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Select, MenuItem } from '@material-ui/core';
import React from 'react';
import { Panel } from '../index'
import {SafetyCard} from './safety-panel'
import { pinFromID } from './graph-panel'

function SequenceRow(data) {
    return <TableRow style={data.style}>
        <TableCell component="th" scope="row">{data.name}</TableCell>
        <TableCell align="center">{data.stand || ""}</TableCell>
        <TableCell align="center">{data.stand ? pinFromID(data.pin).pin.abbrev : (data.ms.toString() + ' ms')}</TableCell>
    </TableRow>
}

export default function Sequences({ state, emit }) {

    var sequences = (state.data && state.data.current_sequence) || []
    const sequenceItems = (state.sequence_names && state.sequence_names.map((name) => {
        return <MenuItem value={name}> {name} </MenuItem>
    })) || []
    console.log(sequenceItems)
    console.log(state.sequence_names)

    var current_executing = state.data === null ? null : state.data.command_in_flight

    const [open, setOpen] = React.useState(false)
    const [currSeq, setSeq] = React.useState(
        (state.sequence_names && state.sequence_names[0]) || "sequences-not-found"
    )

    const handleChange = async (event) => {
        await emit('SETSEQUENCE', event.target.value)
        setSeq(event.target.value)
        // TODO: use setOpen(true) if the Python is invalid?
        // or use the most recent warning infra and delete the warning
    }

    const abort = x => emit('ABORTSEQUENCE', x)
    const armed = state.data && state.data.arming_switch;

    return (
        <Panel title="Sequences">
            <div className="flex">
                <div style={{ width: '200px', borderRight: '1px solid #999', height: '100%' }}>
                    <div className='frame'>
                        <h2>
                            Start
                        </h2>
                        <div>
                            <Select
                              labelId="dropdown-seq-label"
                              id="dropdown-seq"
                              value={currSeq}
                              label="sequence"
                              onChange={handleChange}
                              disabled={!armed}
                            > 
                              {sequenceItems}
                            </Select>
                        </div><br/>
                        <button onClick={() => emit('BEGINSEQUENCE', null)} style={{backgroundColor:armed?'lime':'lightgrey',padding:10,cursor:armed&&'pointer'}} disabled={!armed}>Start</button><br/><br/>
                        <SafetyCard title="Abort">
                            <button onClick={() => abort()} style={{backgroundColor:armed?'tomato':'lightgrey',padding:10,cursor:armed&&'pointer'}} disabled={!armed}>ABORT</button>
                        </SafetyCard>
                    </div>
                </div>
                <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
                    <Table stickyHeader aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Command</TableCell>
                                <TableCell align="center">Stand</TableCell>
                                <TableCell align="center">Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {current_executing && <SequenceRow style={{ background: '#94F690' }} {...current_executing} />}
                            {sequences.map((command) => <SequenceRow {...command} />)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Panel>
    )
}
