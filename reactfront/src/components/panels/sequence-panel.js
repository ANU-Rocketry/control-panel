import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { Panel } from '../index'
import {SafetyCard} from './safety-panel'
import { pinFromID } from './graph-panel'

// Mirrors the valve pin numbers in src/stands.py. Needed to reconstruct exec-compatible
// command strings like "Open(ETH.Main)" from the (stand, pin) the server sends back -
// pins.json's "name" field (e.g. "ETH Pressurisation") is a display label, not the
// Python attribute name (e.g. "Pressure") that stands.py actually defines.
const VALVE_ATTR_BY_PIN = {
    ETH: { 15: 'Main', 16: 'Fill', 17: 'Drain', 8: 'Pressure', 9: 'Vent', 14: 'Purge', 10: 'Igniter' },
    LOX: { 14: 'Main', 16: 'Fill', 17: 'Drain', 9: 'Pressure', 10: 'Vent', 8: 'Purge', 15: 'Chill' },
};

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
    const [isAddingCommand, setIsAddingCommand] = useState(false);
    const [newCommandAction, setNewCommandAction] = useState('Open');
    const [newCommandStand, setNewCommandStand] = useState('LOX');
    const [newCommandValve, setNewCommandValve] = useState('Main');
    const [newCommandSeconds, setNewCommandSeconds] = useState('5');
    const [draggedIndex, setDraggedIndex] = useState(null);
    
    var sequences = (state.data && state.data.current_sequence) || []
    var current_executing = state.data === null ? null : state.data.command_in_flight
    const aborting = state.data ? state.data.status === 3 : false
    
    // A sequence is considered loaded if there are commands or one is executing
    const sequenceLoaded = sequences.length > 0 || current_executing !== null;

    // The server tracks which sequence file is actually loaded. Keep the locally-known
    // name in sync with it (e.g. after a page refresh, where local state resets to '')
    // so Save always targets the right file instead of silently falling back to a blank name.
    const serverSequenceName = state.data && state.data.current_sequence_name;
    useEffect(() => {
        if (serverSequenceName && serverSequenceName !== currentSequenceName) {
            setCurrentSequenceName(serverSequenceName);
        }
    }, [serverSequenceName]);

    const availableSequences = (state.data && state.data.available_sequences) || [];

    const handleChange = async (e) => {
        const name = e.target.value;
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
            
            // command.name comes from the backend as "SLEEP" / "OPEN" / "CLOSE" (see commands.py)
            if (command.name === "SLEEP") {
                return `Sleep(seconds=${(command.ms / 1000).toFixed(1)})`;
            } else if (command.name === "OPEN" || command.name === "CLOSE") {
                if (!command.stand) return "";

                const pinName = VALVE_ATTR_BY_PIN[command.stand] && VALVE_ATTR_BY_PIN[command.stand][command.pin];
                if (!pinName) return "";

                const fnName = command.name === "OPEN" ? "Open" : "Close";
                return `${fnName}(${command.stand}.${pinName})`;
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
        setIsAddingCommand(false);
    }

    // Send the current editableCommands to the server under the given name
    const saveCommandsAs = (name) => {
        const cleanedCommands = editableCommands.filter(cmd => cmd.trim());

        emit('SAVESEQUENCE', {
            name: name,
            commands: cleanedCommands
        });

        // Exit edit mode
        setIsEditing(false);
        setIsAddingCommand(false);

        // Show confirmation. The server updates its live state as part of handling
        // SAVESEQUENCE, so the table view will reflect the change automatically
        // once the next state broadcast arrives - no separate reload needed.
        alert(`Sequence saved as "${name}"!`);
    }

    // Save edited sequence, overwriting the currently loaded file
    const handleSave = () => {
        saveCommandsAs(currentSequenceName);
    }

    // Save edited sequence under a new name, leaving the original file untouched
    const handleSaveAs = () => {
        const name = prompt("Enter a name for the new sequence file (letters and numbers only, no spaces):");
        if (!name) return;
        if (!/^[a-zA-Z0-9]+$/.test(name)) {
            alert("Invalid name. Use only letters and numbers.");
            return;
        }
        setCurrentSequenceName(name);
        saveCommandsAs(name);
    }

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setIsAddingCommand(false);
    }

    // Delete the currently loaded sequence file, after user confirmation
    const handleDelete = () => {
        // The server silently ignores DELETESEQUENCE while unarmed, so guard here too -
        // otherwise we'd clear local state as if it succeeded while the file stays on disk.
        if (!armed) {
            alert("Arming must be enabled to delete a sequence.");
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to delete the sequence "${currentSequenceName}"? This cannot be undone.`);
        if (!confirmed) return;

        emit('DELETESEQUENCE', currentSequenceName);

        setIsEditing(false);
        setIsAddingCommand(false);
        setEditableCommands([]);
        setCurrentSequenceName('');
    }

    // Update a command in the editor
    const updateCommand = (index, newValue) => {
        const newCommands = [...editableCommands];
        newCommands[index] = newValue;
        setEditableCommands(newCommands);
    }

    // Open the command builder with default selections
    const startAddCommand = () => {
        setNewCommandAction('Open');
        setNewCommandStand('LOX');
        setNewCommandValve('Main');
        setNewCommandSeconds('5');
        setIsAddingCommand(true);
    }

    // Confirm the command builder selections and append the resulting command
    const confirmAddCommand = () => {
        const cmdStr = newCommandAction === 'Sleep'
            ? `Sleep(seconds=${(parseFloat(newCommandSeconds) || 0).toFixed(1)})`
            : `${newCommandAction}(${newCommandStand}.${newCommandValve})`;
        setEditableCommands([...editableCommands, cmdStr]);
        setIsAddingCommand(false);
    }

    // Discard the command builder without adding anything
    const cancelAddCommand = () => {
        setIsAddingCommand(false);
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

    // Move a command line to a new position (drag and drop reordering)
    const reorderCommand = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        const newCommands = [...editableCommands];
        const [moved] = newCommands.splice(fromIndex, 1);
        newCommands.splice(toIndex, 0, moved);
        setEditableCommands(newCommands);
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
        <Panel title="Sequences" className="panel sequences">
            <div className="flex">
                <div style={{ width: '200px', borderRight: '1px solid #999', height: '100%' }}>
                    <div className='frame'>
                        <h2 style={{ fontSize: '16px', margin: '5px 0' }}>
                            Start
                        </h2>
                        <div>
                            <select
                                value={availableSequences.includes(currentSequenceName) ? currentSequenceName : ''}
                                onChange={handleChange}
                                disabled={!armed || isEditing}
                                style={compactButtonStyle}
                            >
                                <option value="" disabled>Choose sequence</option>
                                {availableSequences.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
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
                                        onClick={handleSaveAs}
                                        style={{
                                            ...compactButtonStyle,
                                            backgroundColor: '#90caf9',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Save As New File
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
                                    <button
                                        onClick={handleDelete}
                                        disabled={!currentSequenceName || currentSequenceName === 'abort' || !armed}
                                        title={currentSequenceName === 'abort' ? 'The abort sequence cannot be deleted' : undefined}
                                        style={{
                                            ...compactButtonStyle,
                                            backgroundColor: (!currentSequenceName || currentSequenceName === 'abort' || !armed) ? 'lightgrey' : 'tomato',
                                            color: 'white',
                                            cursor: (!currentSequenceName || currentSequenceName === 'abort' || !armed) ? 'default' : 'pointer',
                                        }}
                                    >
                                        Delete Sequence
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ overflow: 'auto', width: '600px', height: '100%' }}>
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
                                    <div key={index}
                                        draggable
                                        onDragStart={() => setDraggedIndex(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => {
                                            if (draggedIndex !== null) reorderCommand(draggedIndex, index);
                                            setDraggedIndex(null);
                                        }}
                                        onDragEnd={() => setDraggedIndex(null)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '5px',
                                            opacity: draggedIndex === index ? 0.4 : 1,
                                            background: draggedIndex === index ? '#f0f0f0' : 'transparent'
                                        }}
                                    >
                                        <span
                                            style={{
                                                cursor: 'grab',
                                                padding: '0 8px',
                                                userSelect: 'none',
                                                color: '#888',
                                                fontSize: '16px'
                                            }}
                                            title="Drag to reorder"
                                        >
                                            ⠿
                                        </span>
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
                            {isAddingCommand ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <select value={newCommandAction} onChange={(e) => setNewCommandAction(e.target.value)}
                                        style={{ padding: '5px' }}>
                                        <option value="Open">Open</option>
                                        <option value="Close">Close</option>
                                        <option value="Sleep">Sleep</option>
                                    </select>
                                    {newCommandAction === 'Sleep' ? (
                                        <input
                                            type="number"
                                            value={newCommandSeconds}
                                            onChange={(e) => setNewCommandSeconds(e.target.value)}
                                            style={{ width: '80px', padding: '5px' }}
                                            placeholder="seconds"
                                        />
                                    ) : (
                                        <>
                                            <select value={newCommandStand} onChange={(e) => setNewCommandStand(e.target.value)}
                                                style={{ padding: '5px' }}>
                                                <option value="LOX">LOX</option>
                                                <option value="ETH">ETH</option>
                                            </select>
                                            <select value={newCommandValve} onChange={(e) => setNewCommandValve(e.target.value)}
                                                style={{ padding: '5px' }}>
                                                <option value="Main">Main</option>
                                                <option value="Vent">Vent</option>
                                                <option value="Purge">Purge</option>
                                                <option value="Pressure">Pressure</option>
                                                <option value="Igniter">Igniter</option>
                                                <option value="Fill">Fill</option>
                                                <option value="Drain">Drain</option>
                                                <option value="Chill">Chill</option>
                                            </select>
                                        </>
                                    )}
                                    <button
                                        onClick={confirmAddCommand}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: 'lime',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={cancelAddCommand}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#ff9999',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✗
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={startAddCommand}
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
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Panel>
    );
}