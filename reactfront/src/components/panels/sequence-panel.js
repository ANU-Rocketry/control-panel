import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import React from 'react';
import { Panel } from '../index'

export default function Sequences({ state, emit }) {

    var sequences = (state.data && state.data.current_sequence) ?? []
    var current_executing = state.data === null ? null : state.data.sequence_executing

    const [open, setOpen] = React.useState(false);

    const handleChange = async (inputElement) => {
        var file = inputElement.target.files[0];
        const data = parseCSV(file)
        if (data) {
            emit('SETSEQUENCE', await data)
        } else {
            setOpen(true);
        }
    };

    function csvToArray(str, delimiter = ",") {

        const rows = str.slice(str.indexOf("\n") + 1).split("\n");

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
                    if (element.length !== 3) throw 'invalid input';
                    if (element[1].toLowerCase() != "lox" && element[1].toLowerCase() != "eth") throw "invalid input";
                    var num = Number.parseInt(element[2]);
                    if (!num) throw "invalid input";
                    commands.push({
                        header: element[0],
                        parameter: {
                            name: element[1],
                            pin: num
                        }
                    });
                } else if (element[0] === "SLEEP") {
                    if (element.length !== 2) throw 'invalid input';
                    var num = Number.parseInt(element[1]);
                    if (!num) throw "invalid input";
                    commands.push({
                        header: element[0],
                        parameter: num
                    });
                } else { throw "invalid input" };
            })
        } catch (e) {
            return false;
        }
        return commands;
    }

    return (
        <Panel title="Sequences">
            <div>
                <Dialog
                    open={open}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Invalid CSV"}</DialogTitle>
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
                <div style={{ width: '6vw' }}>
                    <div>
                        <input type="file" accept=".csv" maxLength="1"
                            onChange={handleChange} />
                    </div>
                </div>
                <div style={{ maxHeight: 200, overflow: 'auto', width: 'calc(100% - 6vw)', height: '100%' }}>
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
                                <TableRow style={{ background: 'linear-gradient(45deg, #70D478 30%, #94F690 90%)' }}>
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