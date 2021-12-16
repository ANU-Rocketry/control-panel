import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import React from 'react';
import { Panel } from '../index'
import {SafetyCard} from './safety-panel'

export default function Sequences({ state, emit }) {

    var sequences = (state.data && state.data.current_sequence) ?? []
    var current_executing = state.data === null ? null : state.data.sequence_executing

    const [open, setOpen] = React.useState(false);

    const handleChange = async (inputElement) => {
        if (inputElement.target.files.length === 0) return;
        var file = inputElement.target.files[0];
        const data = parseCSV(file)
        if (data !== false) {
            emit('SETSEQUENCE', await data)
        } else {
            setOpen(true);
        }
        inputElement.target.value = ''
    };

    function csvToArray(str, delimiter = ",") {

        const rows = str.split("\n");

        const arr = rows.map(function (row) {
            const values = row.split(delimiter).map(x => x.trim())
            return values;
        });

        // return the array
        return arr;
    }

    const readFileAsText = (inputFile) => {
        const temporaryFileReader = new FileReader();

        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new DOMException("Problem parsing input file."));
            };

            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsText(inputFile);
        });
    };

    async function parseCSV(file) {
        const text = await readFileAsText(file);
        const arr = csvToArray(text);
        var commands = [];
        try {
            arr.forEach((element) => {
                if (element[0] === "OPEN" || element[0] === "CLOSE") {
                    if (element.length !== 3) throw new Error('invalid input');
                    if (element[1].toLowerCase() !== "lox" && element[1].toLowerCase() !== "eth") throw new Error('invalid input');
                    var num = Number.parseInt(element[2]);
                    if (!num) throw new Error('invalid input');
                    commands.push({
                        header: element[0],
                        parameter: {
                            name: element[1],
                            pin: num
                        }
                    });
                } else if (element[0] === "SLEEP") {
                    if (element.length !== 2) throw new Error('invalid input');
                    var num2 = Number.parseInt(element[1]);
                    if (!num2) throw new Error('invalid input');
                    commands.push({
                        header: element[0],
                        parameter: num2
                    });
                } else if (element[0] === "") {
                    return
                } else { throw new Error('invalid input') };
            })
        } catch (e) {
            return false;
        }
        return commands;
    }

    const abort = x => emit('ABORTSEQUENCE', x)
    const armed = state.data && state.data.arming_switch;

    return (
        <Panel title="Sequences">
            <div>
                <Dialog
                    open={open}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Invalid CSV</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Confirm the CSV given was valid, read documentation if unsure.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setOpen(false) }} color="primary" autoFocus>
                            Understood!
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            <div className="flex">
                <div style={{ width: '200px', borderRight: '1px solid #999', height: '100%' }}>
                    <div className='frame'>
                        <h2>
                            Start Sequence
                        </h2>
                        <div>
                            <input type="file" accept=".csv" maxLength="1"
                                onChange={handleChange} />
                        </div><br/>
                        <button onClick={() => emit('BEGINSEQUENCE', null)} style={{backgroundColor:armed?'lime':'lightgrey',padding:10,cursor:'pointer'}}>Start</button><br/><br/>
                        <SafetyCard title="Run Abort Sequence">
                            <button onClick={() => abort()} style={{backgroundColor:armed?'tomato':'lightgrey',padding:10,cursor:'pointer'}}>ABORT</button>
                        </SafetyCard>
                    </div>
                </div>
                <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
                    <Table stickyHeader aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Command</TableCell>
                                <TableCell align="center">LabJack</TableCell>
                                <TableCell align="center">Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {current_executing &&
                                <TableRow style={{ background: '#94F690' }}>
                                    <TableCell component="th" scope="row">{current_executing.header}</TableCell>
                                    <TableCell align="center">{current_executing.data.name && current_executing.data.name}</TableCell>
                                    <TableCell align="center">{current_executing.data.name ? current_executing.data.pin : ((current_executing.time - state.data.time) / 1000).toFixed(4)}</TableCell>
                                </TableRow>}
                            {sequences.map((com) => (
                                <TableRow>
                                    <TableCell component="th" scope="row">{com.header}</TableCell>
                                    <TableCell align="center">{com.data.name === undefined ? "" : com.data.name}</TableCell>
                                    <TableCell align="center">{com.data.name === undefined ? com.data : com.data.pin}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Panel>
    )
}