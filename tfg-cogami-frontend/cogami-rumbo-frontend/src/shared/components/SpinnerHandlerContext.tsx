import { CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import { createContext, useCallback, useMemo, useState } from "react";

export const SpinnerContext = createContext({ increaseLoader: () => {}, decreaseLoader: () => {} })

const SpinnerHandler: React.FC<any> = ({ children } ) => {
    const [counter, setCounter] = useState(0)

    const increaseLoader = useCallback(() => {
        setCounter(prev => prev+1)
    }, [])

    const decreaseLoader = useCallback(() => {
        setCounter(prev => prev-1)
    }, [])

    const value = useMemo(() => { return { increaseLoader, decreaseLoader } }, [])

    return (
        <SpinnerContext.Provider value={value}>
            {document.body.classList.add('stop-scrolling')}
            {counter > 0 ?
                <Box sx={{ position:'fixed', width:'100%', height: '100%', display:'flex', backgroundColor:'rgba(0,0,0,0.5)', zIndex: (theme: any) => theme.zIndex.modal + 2 }}>
                    <CircularProgress sx={{ margin: 'auto' }} />
                </Box>
                : 
                document.body.classList.remove('stop-scrolling')
            }
            {children}
        </SpinnerContext.Provider>
    )
}

export default SpinnerHandler