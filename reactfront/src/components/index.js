import React from 'react';
import { Paper } from '@material-ui/core';

export function SectionTitle({ children }) {
    return (
        <Paper style={{width:"100%"}}>
            {children}
        </Paper>
    );
}
