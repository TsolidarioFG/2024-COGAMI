import { Box, Tooltip } from "@mui/material"
import { SummaryTagSection } from "../../../types"
import { ReactElement } from "react"

import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import BalconyOutlinedIcon from '@mui/icons-material/BalconyOutlined';
import HailOutlinedIcon from '@mui/icons-material/HailOutlined';
import PoolOutlinedIcon from '@mui/icons-material/PoolOutlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import DeckIcon from '@mui/icons-material/Deck';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

interface Props {
    tagSection: SummaryTagSection
}

const TagSection : React.FC<Props> = ({ tagSection }) => {

    const iconFromKey = {
        hasElevator: <ElevatorOutlinedIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasVideo: <OndemandVideoIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasGuidedVisite: <HailOutlinedIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasSwimmingPool: <PoolOutlinedIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasTerrace: <BalconyOutlinedIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasVirtualTour: <TourOutlinedIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasAC: <AcUnitOutlinedIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        hasGarden: <DeckIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />,
        newDevelopment: <NewReleasesIcon color="primary" sx={{ fontSize: "1.95rem", mr: "0.5rem" }} />
    }

    const renderTooltips = () => {
        const tooltips = Object.entries(tagSection).map(([key, value]) => {
            if (value?.value) {
                return (
                    <Tooltip key={value?.title} sx={{ mx: "0.75rem" }} title={value?.title}>
                        {iconFromKey[key as keyof typeof iconFromKey]}
                    </Tooltip>
                )
            }
        })

        return tooltips
    }

    return (
        <Box display="flex" sx={{ mt: "1rem", flexWrap: "wrap", alignContent: "center", alignItems: "center" }}>
            { 
                renderTooltips()
            }
        </Box>
    )

}

export default TagSection