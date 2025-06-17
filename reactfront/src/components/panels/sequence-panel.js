import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { useState } from 'react';
import { Panel } from '../index'
import {SafetyCard} from './safety-panel'
import { pinFromID } from './graph-panel'

function SequenceRow(data) {
    const getPinName = () => {
        if (!data.stand) return null;
        const pinData = pinFromID(data.pin, data.stand);
        return (pinData && pinData.pin && pinData.pin.name) || `Unknown Pin ${data.pin}`;
    };

    return <TableRow style={data.inFlight ? { background: '#94F690' } : {}}>
        <TableCell align='right'>{data.name[0]+data.name.substring(1).toLowerCase()}</TableCell>
        <TableCell colSpan='2'>{data.stand
            ? getPinName()
            : (((data.inFlight ? data.remaining : data.ms) / 1000).toFixed(1) + 's')}</TableCell>
    </TableRow>
}

export default function Sequences({ state, emit }) {
    // State for edit mode and editable content
    const [currentSequenceName, setCurrentSequenceName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editableCommands, setEditableCommands] = useState([]);
    
    var sequences = (state.data && state.data.current_sequence) || []
    var current_executing = state.data === null ? null : state.data.command_in_flight
    const aborting = state.data ? state.data.status === 3 : false
    
    // A sequence is considered loaded if there are commands or one is executing
    const sequenceLoaded = sequences.length > 0 || current_executing !== null;

    const handleChange = async () => {
        const name = prompt("Enter a sequence name like 'operation' (lowercase without quotes). (This loads from a sequence file in src/sequences on the server RPi)");
        if (name) {
            setCurrentSequenceName(name);
            await emit('SETSEQUENCE', name);
        }
    }

     // Safe function to convert command object to string
    const formatCommandToString = (command) => {
        try {
            if (!command || typeof command !== 'object') {
                return "";
            }
            
            if (command.name === "Sleep") {
                return `Sleep(seconds=${(command.ms / 1000).toFixed(1)})`;
            } else if (command.name === "Open" || command.name === "Close") {
                if (!command.stand) return "";
                
                let pinName = "Unknown";
                try {
                    if (command.pin && pinFromID(command.pin, command.stand) && pinFromID(command.pin, command.stand).pin) {
                        pinName = pinFromID(command.pin, command.stand).pin.name;
                    }
                } catch (error) {
                    console.error("Error getting pin name:", error);
                }
                
                return `${command.name}(${command.stand}.${pinName})`;
            } else {
                return "";
            }
        } catch (error) {
            console.error("Error formatting command:", error);
            return "";
        }
    };

    // Function to handle edit button click - use the loaded sequence data
    const handleEdit = () => {
        // If we don't have a current sequence name but have a loaded sequence
        if (!currentSequenceName && sequenceLoaded) {
            alert("Please choose a sequence first using the 'Choose sequence' button");
            return;
        }
        
        console.log("Current sequences:", sequences);
        console.log("Current executing command:", current_executing);
        
        // Create a list of command strings based on the loaded sequence
        const commandStrings = [];
        
        // Add the currently executing command if there is one
        if (current_executing) {
            try {
                const cmdStr = formatCommandToString(current_executing);
                if (cmdStr) commandStrings.push(cmdStr);
            } catch (error) {
                console.error("Error formatting executing command:", error);
            }
        }
        
        // Add the remaining commands in the sequence
        if (sequences && Array.isArray(sequences)) {
            for (const command of sequences) {
                try {
                    const cmdStr = formatCommandToString(command);
                    if (cmdStr) commandStrings.push(cmdStr);
                } catch (error) {
                    console.error("Error formatting sequence command:", error);
                }
            }
        }
        
        // If no commands were found, use some default commands
        if (commandStrings.length === 0) {
            commandStrings.push(
                "Close(ETH.Vent)",
                "Close(LOX.Vent)",
                "Sleep(seconds=5.0)",
                "Open(ETH.Pressure)",
                "Open(LOX.Pressure)",
                "Sleep(seconds=15.0)",
                "Open(ETH.Main)",
                "Open(LOX.Main)",
                "Sleep(seconds=10.0)",
                "Close(ETH.Main)",
                "Close(LOX.Main)",
                "Open(ETH.Purge)",
                "Open(LOX.Purge)",
                "Close(ETH.Pressure)",
                "Close(LOX.Pressure)",
                "Open(ETH.Vent)",
                "Open(LOX.Vent)",
                "Sleep(seconds=3.0)",
                "Close(ETH.Purge)",
                "Close(LOX.Purge)"
            );
        }
        
        console.log("Command strings for editor:", commandStrings);
        
        // Set the editable commands and enter edit mode
        setEditableCommands(commandStrings);
        setIsEditing(true);
    }

    // Save edited sequence
    const handleSave = () => {
        // Filter out empty lines
        const cleanedCommands = editableCommands.filter(cmd => cmd.trim());
        
        // Send commands to the server
        emit('SAVESEQUENCE', {
            name: currentSequenceName,
            commands: cleanedCommands
        });
        
        // Exit edit mode
        setIsEditing(false);
        
        // Show confirmation
        alert("Sequence saved!");
        
        // Reload the sequence to see changes
        emit('SETSEQUENCE', currentSequenceName);
    }
    
    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
    }
    
    // Update a command in the editor
    const updateCommand = (index, newValue) => {
        const newCommands = [...editableCommands];
        newCommands[index] = newValue;
        setEditableCommands(newCommands);
    }
    
    // Add a new command line
    const addCommandLine = () => {
        setEditableCommands([...editableCommands, ""]);
    }
    
    // Remove a command line
    const removeCommandLine = (index) => {
        if (editableCommands.length <= 1) {
            // Keep at least one command
            setEditableCommands([""]);
            return;
        }
        
        setEditableCommands(editableCommands.filter((_, i) => i !== index));
    }

    const abort = x => emit('ABORTSEQUENCE', x)
    const armed = state.data && state.data.arming_switch;

    // Compact button style
    const compactButtonStyle = {
        fontSize: '12px',
        padding: '5px 8px',
        marginBottom: '5px',
        width: '100%',
    };

    return (
        <Panel title="Sequences">
            <div className="flex">
                <div style={{ width: '200px', borderRight: '1px solid #999', height: '100%' }}>
                    <div className='frame'>
                        <h2 style={{ fontSize: '16px', margin: '5px 0' }}>
                            Start
                        </h2>
                        <div>
                            <button 
                                onClick={handleChange} 
                                disabled={!armed || isEditing}
                                style={compactButtonStyle}
                            >
                                Choose sequence
                            </button>
                        </div>
                        <button 
                            onClick={() => emit('BEGINSEQUENCE', null)} 
                            style={{
                                ...compactButtonStyle,
                                backgroundColor: armed && !isEditing ? 'lime' : 'lightgrey',
                                cursor: armed && !isEditing ? 'pointer' : 'default'
                            }} 
                            disabled={!armed || isEditing}
                        >
                            Start
                        </button>
                        <SafetyCard title="Abort" style={{ margin: '5px 0' }}>
                            <button 
                                onClick={() => abort()} 
                                style={{
                                    ...compactButtonStyle,
                                    backgroundColor: armed && !isEditing ? 'tomato' : 'lightgrey',
                                    cursor: armed && !isEditing ? 'pointer' : 'default'
                                }} 
                                disabled={!armed || isEditing}
                            >
                                ABORT
                            </button>
                        </SafetyCard>
                        
                        {/* Edit/Save/Cancel Buttons */}
                        <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                            {!isEditing ? (
                                <button 
                                    onClick={handleEdit}
                                    disabled={!sequenceLoaded || !armed}
                                    style={{
                                        ...compactButtonStyle,
                                        backgroundColor: (sequenceLoaded && armed) ? '#2196f3' : 'lightgrey',
                                        color: 'white',
                                        cursor: (sequenceLoaded && armed) ? 'pointer' : 'default',
                                    }}
                                >
                                    Edit
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleSave}
                                        style={{
                                            ...compactButtonStyle,
                                            backgroundColor: 'lime',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={handleCancel}
                                        style={{
                                            ...compactButtonStyle,
                                            backgroundColor: '#ff9999',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
                    {!isEditing ? (
                        // Normal table view when not editing
                        <Table stickyHeader aria-label="simple table" style={{tableLayout: 'fixed'}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='right' style={{width:100}}>Command</TableCell>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell align='right'>
                                        {!aborting && <>
                                            {current_executing &&
                                                <button 
                                                    onClick={() => emit('PAUSESEQUENCE', null)}
                                                    style={{ fontSize: '12px', padding: '3px 6px' }}
                                                >
                                                    Pause
                                                </button>
                                            }
                                            {(sequences.length || current_executing) &&
                                                <button 
                                                    onClick={() => emit('UNSETSEQUENCE', null)}
                                                    style={{ fontSize: '12px', padding: '3px 6px', marginLeft: '5px' }}
                                                >
                                                    Clear
                                                </button>
                                            }
                                        </>}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {current_executing && <SequenceRow inFlight {...current_executing} />}
                                {sequences.map((command, index) => <SequenceRow key={index} {...command} />)}
                            </TableBody>
                        </Table>
                    ) : (
                        // Text editor view when editing
                        <div style={{ padding: '10px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>
                                Editing Sequence: {currentSequenceName}
                            </h3>
                            <div style={{ marginBottom: '10px' }}>
                                {editableCommands.map((command, index) => (
                                    <div key={index} style={{ display: 'flex', marginBottom: '5px' }}>
                                        <input
                                            type="text"
                                            value={command}
                                            onChange={(e) => updateCommand(index, e.target.value)}
                                            style={{ 
                                                flex: 1,
                                                padding: '5px',
                                                fontFamily: 'monospace'
                                            }}
                                            placeholder="Enter command (e.g., Open(LOX.Vent))"
                                        />
                                        <button 
                                            onClick={() => removeCommandLine(index)}
                                            style={{ 
                                                marginLeft: '5px',
                                                padding: '5px',
                                                backgroundColor: '#ff9999'
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addCommandLine}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Add Command
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Panel>
    );
}