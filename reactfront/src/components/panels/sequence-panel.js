import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { Panel } from '../index'
import {SafetyCard} from './safety-panel'
import { pinFromID } from './graph-panel'

function SequenceRow(data) {
    return <TableRow style={data.inFlight ? { background: '#94F690' } : {}}>
        <TableCell align='right'>{data.name[0]+data.name.substring(1).toLowerCase()}</TableCell>
        <TableCell colSpan='2'>{data.stand
            ? pinFromID(data.pin).pin.name
            : (((data.inFlight ? data.remaining : data.ms) / 1000).toFixed(1) + 's')}</TableCell>
    </TableRow>
}

export default function Sequences({ state, emit }) {

    var sequences = (state.data && state.data.current_sequence) || []

    var current_executing = state.data === null ? null : state.data.command_in_flight

    const aborting = state.data ? state.data.status === 3 : false

    const handleChange = async () => {
        await emit('SETSEQUENCE', prompt("Enter a sequence name like 'operation' or 'abort' (lowercase without quotes). (This loads from a sequence file in src/sequences on the server RPi, you must edit the files on the RPi to change the sequence.)"))
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
                            <button onClick={handleChange} disabled={!armed}>Choose sequence</button>
                        </div><br/>
                        <button onClick={() => emit('BEGINSEQUENCE', null)} style={{backgroundColor:armed?'lime':'lightgrey',padding:10,cursor:armed&&'pointer'}} disabled={!armed}>Start</button><br/><br/>
                        <SafetyCard title="Abort">
                            <button onClick={() => abort()} style={{backgroundColor:armed?'tomato':'lightgrey',padding:10,cursor:armed&&'pointer'}} disabled={!armed}>ABORT</button>
                        </SafetyCard>
                    </div>
                </div>
                <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
                    <Table stickyHeader aria-label="simple table" style={{tableLayout: 'fixed'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell align='right' style={{width:100}}>Command</TableCell>
                                <TableCell>Parameter</TableCell>
                                <TableCell align='right'>
                                    {!aborting && <>
                                        {current_executing &&
                                            <button onClick={() => emit('PAUSESEQUENCE', null)}>Pause</button>
                                        }
                                        {(sequences.length || current_executing) &&
                                            <button onClick={() => emit('UNSETSEQUENCE', null)}>Clear</button>
                                        }
                                    </>}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {current_executing && <SequenceRow inFlight {...current_executing} />}
                            {sequences.map((command) => <SequenceRow {...command} />)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Panel>
    )
}
