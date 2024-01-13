import { Alert, Avatar, Card, CardContent, CardHeader, Divider, Grid, Skeleton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { green, grey, red, yellow } from "@mui/material/colors";
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Link } from "react-router-dom";

const Main = () => {

    // snack bar variable & function
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const handleClose = (event, reason) => {
        if(reason === 'clickaway'){
            return;
        }

        setOpen(false);
    }

    const [users, setUsers] = useState(null);
    const [cars, setCars] = useState(null);
    const [bookedCars, setBookedCars] = useState(null);
    const [loading, setLoading] = useState(true);

    const getData = () => {
        fetch('/api/v1/dashboard/main', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let arr = data.users; let brr = data.cars; let drr = data.booked;
                setUsers([...arr]);
                setCars([...brr]);
                setBookedCars([...drr]);
                setLoading(false);
            }else{
                setMessage(data.message);
                setSeverity('error');
                setOpen(true);
            }
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true);
        })
    }

    // LINE CHART LOGIC, VARIABLES AND FUNCTIONS
    const [chartData, setChartData] = useState(null);

    // get 7 days befor now
    function generateLast6Days() {
        let firstDay = getReadableTime(-6)
        let secondDay = getReadableTime(-5);
        let thirdDay = getReadableTime(-4);
        let forthDay = getReadableTime(-3);
        let fifthDay = getReadableTime(-2)
        let sixthDay = getReadableTime(-1)
        let today = getReadableTime(0)

        let res = {firstDay, secondDay, thirdDay, forthDay, fifthDay, sixthDay, lastDay: today}

        return res;
    }
    // Change the dates to readble date
    function getReadableTime(num) {
        let date = new Date();
        let readble = new Date(date.setDate(date.getDate() + (num)))
        
        return readble.toUTCString();
    }

    //shorten date to standard
    const getDate = (date) => {
        let new_date = date.toString().substring(0, 16);
        return new_date;
    }

    const matchingDates = () => {
        //intantiate get7daysoftheweek
        let day = generateLast6Days();
        let days = [
            getDate(day.firstDay),getDate(day.secondDay),getDate(day.thirdDay),getDate(day.forthDay),
            getDate(day.fifthDay),getDate(day.sixthDay),getDate(day.lastDay),
        ]
        console.log(days);
        let dataArray = [];

        //fetch loop
        for(let x = 0; days.length > x; x++){
            fetch('/api/v1/dahsboard/days-match', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
                body: JSON.stringify({day: days[x]})
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    //save data to dataArray
                    dataArray.push({
                        name: days[x].substring(0,3).toUpperCase(), // dynamically add day name
                        users: data.users_length // save the users length value
                    });
                    //check to see if all data has been added
                    //eslint-disable-next-line
                    if(days.length == x+1){
                        setChartData([...dataArray]); // save dataArray to chart data
                    }
                }else{
                    setMessage(data.error);
                    setSeverity('error');
                    setOpen(true);
                }
            }).catch(err => {
                setMessage(err.message);
                setSeverity('error');
                setOpen(true);
            });
        }
    }


    // PIE CHART LOGIC, VARIABLE AND FUNCTIONS
    const [pieChartData, setPieChartData] = useState(null);
    const [pchartLoading, setPchartLoading] = useState(true);

    const getPixel = () => {
        fetch('/api/v1/dashboard/pixel', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let pieDataArray = [];
                pieDataArray = [
                    {name: 'mobile', value: data.mobile},
                    {name: 'desktop', value: data.desktop}
                ];
                setPieChartData([...pieDataArray]);
                setPchartLoading(false);
            }else{
                setMessage(data.error);
                setSeverity('error');
                setOpen(true);
            }
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true);
        })
    }
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


    // REQUESTS VARIABLES AND FUNCTIONS
    const [requests, setRequests] = useState(null);
    const [carsDetails, setCarsDetails] = useState(null);

    const getRequests = () => {
        fetch('/api/v1/dashboard/requests', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let arr = data.requests.slice(0, 3); //limiting the data to 3
                let carDetails = data.cars.slice(0, 3); //limiting the data to 3
                //check if data.requests have data
                if(arr.length > 0){
                    setRequests([...arr])
                    setCarsDetails([...carDetails])
                }else{
                    setRequests([...arr]); // this will allow code to process no data handler
                }
            }else{
                setMessage(data.error);
                setSeverity('error');
                setOpen(true);
            }
        })
        .catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true);
        })
    }

    const convertDate = (timestamp) => {
        let d = new Date(parseInt(timestamp));
        let date = d.toString().substring(0, 16);
        return date;
    }

   //check and remove all booked cars without users
   const checkBookedUsers = () => {
        fetch('/api/check-booked-cars', {
            credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                console.log(data.status);
            }else{
                console.log(data.err)
            }
        }).catch(err => console.log(err.message));
    }
    
    useEffect(()=> {
        getData();
        matchingDates();
        getPixel();
        getRequests();
        checkBookedUsers();
        //  eslint-disable-next-line
    }, [])

    return ( 
        <div className="main">
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            <Grid container spacing={2}>
                <Grid item xs={1} md={4}>
                    {loading ? <Skeleton width="80%" height="200px" sx={{margin: '10px auto'}} /> :
                        <Card elevation={0} className="col" >
                            <CardHeader 
                                avatar={
                                    <Avatar sx={{backgroundColor: red[900]}}>
                                        <SupervisedUserCircleOutlinedIcon sx={{color: 'white'}}/>
                                    </Avatar>
                                }
                                title={'Total Users'}
                                subheader={
                                    <Typography sx={{fontSize: '10px', color: grey[400]}}>
                                        Total number of users registered
                                    </Typography>
                                }
                            />
                            <CardContent>
                                {users &&
                                    <Typography variant="h3" align="center">
                                        {users.length}
                                    </Typography>
                                }
                            </CardContent>
                        </Card>
                    }
                </Grid>
                <Grid item xs={1} md={4}>
                    {loading ? <Skeleton width="80%" height="200px" sx={{margin: '10px auto'}} /> :
                        <Card elevation={0} className="col" >
                            <CardHeader 
                                avatar={
                                    <Avatar sx={{backgroundColor: green[800]}}>
                                        <CloudUploadIcon sx={{color: 'white'}}/>
                                    </Avatar>
                                }
                                title={'Active Fleet'}
                                subheader={
                                    <Typography sx={{fontSize: '10px', color: grey[400]}}>
                                        Total number of uploaded cars
                                    </Typography>
                                }
                            />
                            <CardContent>
                                {cars &&
                                    <Typography variant="h3" align="center">
                                        {cars.length}
                                    </Typography>
                                }
                            </CardContent>
                        </Card>
                    }
                </Grid>
                <Grid item xs={1} md={4}>
                    {loading ? <Skeleton width="80%" height="200px" sx={{margin: '10px auto'}} /> :
                        <Card elevation={0} className="col" >
                            <CardHeader 
                                avatar={
                                    <Avatar sx={{backgroundColor: yellow[800]}}>
                                        <BookmarkAddedIcon sx={{color: 'white'}}/>
                                    </Avatar>
                                }
                                title={'Pending Tasks'}
                                subheader={
                                    <Typography sx={{fontSize: '10px', color: grey[400]}}>
                                        Unresolved booked cars
                                    </Typography>
                                }
                            />
                            <CardContent>
                                {bookedCars &&
                                    <Typography variant="h3" align="center">
                                        {bookedCars.length}
                                    </Typography>
                                }
                            </CardContent>
                        </Card>
                    }
                </Grid>
                <Grid item xs={12}>
                    <div className="space-box-20"></div>
                </Grid>
                {/* Chart Girid item */}
                <Grid item xs={12} md={8} className="chart-holder">
                    <div className="col">
                        <div className="title space-box-20">
                            <Typography>
                                Registered users this week
                            </Typography>
                        </div>
                        <Divider light />
                        <div className="content space-box-20">
                        {chartData && 
                            <div>
                                {chartData.length === 0 ? <Typography>No available data</Typography> : 
                                    <LineChart
                                        width={500} // change when you need to make responsive
                                        height={300}
                                        data={chartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="users" stroke="#0088FE" />
                                    </LineChart>
                                }
                            </div>
                        }
                        </div>
                    </div>
                </Grid>
                {/* Pie Chart  */}
                <Grid item xs={12} md={4}>
                    <div className="col">
                        <div className="title space-box-20">
                            <Typography>
                                Traffic by device
                            </Typography>
                        </div>
                        <Divider light />
                        <div className="content space-box-20">
                            {pchartLoading ? <Skeleton width="200px" height="200px" animation="wave" variant="circular"/>
                                : <div>
                                    { pieChartData && <PieChart width={230} height={240}>
                                        <Pie
                                            data={pieChartData}
                                            cx={120}
                                            cy={120}
                                            innerRadius={10}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        </Pie>
                                    </PieChart>}
                                </div>
                            }
                        </div>
                        <div className="content space-box-20">
                            {pchartLoading ?  <Skeleton width="100%" heigth={20} animation="wave" />
                             : <div>
                                    {pieChartData &&
                                        <div className="color-pallete">
                                            <div className="holder">
                                                <div>
                                                    <div className="color" style={{backgroundColor: '#0088FE'}}></div>
                                                    <Typography variant="body2" sx={{fontSize: '12px'}}>Mobile {pieChartData[0].value} visits</Typography>
                                                </div>
                                                <div>
                                                    <div className="color" style={{backgroundColor: '#00C49F'}}></div>
                                                    <Typography variant="body2" sx={{fontSize: '12px'}}>Desktop {pieChartData[1].value} visits</Typography>
                                                </div>
                                            </div>
                                        </div>                            
                                    }
                             </div>
                            }
                        </div>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div className="col">
                        <div className="title space-box-20">
                            <Typography>
                                Recent Requests
                            </Typography>
                        </div>
                        <Divider />
                        <div className="content space-box-20">
                            {requests && 
                                <div>
                                    {requests.length < 1 ? <Typography> No available data</Typography> :
                                        <div>
                                            { requests.length === carsDetails.length &&
                                                <TableContainer>
                                                    <Table sx={{minWidth: '100%'}}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell> Car Name</TableCell>
                                                                <TableCell sx={{textAlign: 'right'}}> Fullname </TableCell>
                                                                <TableCell sx={{textAlign: 'right'}}> Email </TableCell>
                                                                <TableCell sx={{textAlign: 'right'}}> Date </TableCell>
                                                                <TableCell sx={{textAlign: 'right'}}> Status </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {requests.map((req, index) => (
                                                                <TableRow key={index}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: index%2 === 1 ? grey[100] : 'white' }}
                                                                >
                                                                    <TableCell sx={{whiteSpace: 'nowrap'}}>{carsDetails[index]['car name']}</TableCell>
                                                                    {/* <TableCell sx={{whiteSpace: 'nowrap'}}>car name</TableCell> */}
                                                                    <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right'}}> {req['_fieldsProto']['firstname'].stringValue} { req['_fieldsProto']['lastname'].stringValue} </TableCell>
                                                                    <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right'}}> {req['_fieldsProto']['email'].stringValue}</TableCell>
                                                                    <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right'}}> {convertDate(req['_fieldsProto']['timestamp'].integerValue)}</TableCell>
                                                                    <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right'}}> {req['_fieldsProto']['status'].stringValue}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                        <Divider light />
                        <div className="space-box-20">
                            <div style={{textAlign: 'right'}}>
                                <Link to="/dashboard/requests"> <Typography variant="body2"> View More</Typography> </Link>
                            </div>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </div>
     );
}
 
export default Main;