import React from 'react';
import { Paper, Typography } from '@material-ui/core';

export function SectionTitle({ children }) {
    return (
        <Paper style={{width:"100%"}}>
            <Typography>
                {children}
            </Typography>
        </Paper>
    );
}
