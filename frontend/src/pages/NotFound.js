import { Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";


const NotFound = () => {
    return (
        <Container>
            <div className="space-box"></div>
            <div className="space-box"></div>
            <div className="space-box"></div>
            <div className="space-box"></div>
            <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h3" component="h3" sx={{ fontSize: '30px' }}>
                        Opps!
                    </Typography>
                    <div className="space-box"></div>
                    <div style={{ width: '2px', height: '15px', background: '#000000' }} ></div>
                    <div className="space-box"></div>
                    <Typography sx={{ fontSize: '16px' }}>
                        It seems this page doesn't exist
                    </Typography>
                </div>
            </div>
            <div className="space-box"></div>
            <div style={{ textAlign: 'center' }}>
                <Link to="/">
                    back to home
                </Link>
            </div>
        </Container>
    );
}

export default NotFound;