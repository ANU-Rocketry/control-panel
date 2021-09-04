import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { Panel } from '../index'

export default function Sequences({ state, emit }) {
    
    var sequences = state.data === null ? [] : state.data.current_sequence

    if (sequences == undefined){
        sequences = []
    }

    return (
        <Panel title="Sequences">
        <div style={{maxHeight: 200, overflow: 'auto'}}>
            <Table stickyHeader aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell align="right">Command</TableCell>
                    <TableCell align="right">LabJack</TableCell>
                    <TableCell align="right">Value</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {sequences.map((com) => (
                    <TableRow>
                    <TableCell component="th" scope="row">{com.header}</TableCell>
                    <TableCell align="right">{com.data.name === undefined ? "" : com.data.name}</TableCell>
                    <TableCell align="right">{com.data.name === undefined ? com.data : com.data.pin}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        </Panel>
    )
}
