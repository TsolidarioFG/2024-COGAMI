import { Snackbar, Alert, AlertColor } from '@mui/material';
import React, { createContext, useContext, useState } from 'react';
type Position = {
    vertical: 'bottom' | 'top',
    horizontal: 'center' | 'left' | 'right'
}

type SnackBarContextActions = {
  showSnackBar: (text : string, typeColor : AlertColor, position : Position, autoHideDuration: number | null ) => void;
};

const SnackBarContext = createContext({} as SnackBarContextActions);

interface SnackBarContextProviderProps {
  children: any;
}

const SnackBarProvider: React.FC<SnackBarContextProviderProps> = ({
  children,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>('');
  const [typeColor, setTypeColor] = React.useState<AlertColor>('info');
  const [position, setPosition] = useState<Position>();
  const [autoHideDuration, setAutoHideDuration] = useState<number | null>(3000)

  const showSnackBar = (text: string, color: AlertColor, position: Position, autoHideDuration: number | null) => {
    setMessage(text);
    setTypeColor(color);
    setPosition(position);
    setAutoHideDuration(autoHideDuration)
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackBarContext.Provider value={{ showSnackBar }}>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        anchorOrigin={position}
        onClose={handleClose}>
        <Alert onClose={handleClose} severity={typeColor} sx={{ whiteSpace: "pre-line" }}>
          {message}
        </Alert>
      </Snackbar>
      <>
        {children}
      </>
    </SnackBarContext.Provider>
  );
};

const useSnackBar = (): SnackBarContextActions => {
  const context = useContext(SnackBarContext);

  if (!context) {
    throw new Error('useSnackBar must be used within an SnackBarProvider');
  }

  return context;
};

export { SnackBarProvider, useSnackBar };