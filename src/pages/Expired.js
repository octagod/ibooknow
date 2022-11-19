import { Box, Button, Container, Typography } from "@mui/material";

const Expired = () => {

    return ( 
        <Container maxWidth="xs">
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 8
            }}>
                <div className="content" style={{textAlign: 'center'}}>
                    <img src="/assets/cards.png" alt="creadit cards" className="cards" style={{width: '100%'}}/>
                    <div className="space-box"></div>
                    <Typography variant="h3" component="h3" sx={{fontSize: '30px'}}>
                        Your trial has expired
                    </Typography>
                    <Typography variant="body2" sx={{color: '#ababab'}}>
                        Two ways to keep enjoying iBookNow
                    </Typography>
                    <div className="space-box"></div>
                    <div className="flex" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        {/* TODO: SEND THE USER TO THE PAYMENT PLAN */}
                        <Button variant="contained" color="primary" disableElevation>
                            Upgrade Plan
                        </Button>

                        <a href="mailto:support@ibooknow.digital" style={{textDecoration: 'none', color: '#2196f3'}}>Contact Us</a>
                    </div>
                </div>
            </Box>
        </Container>
     );
}
 
export default Expired;