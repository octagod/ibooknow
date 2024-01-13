import Login from "./pages/Login";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/Reset";
import ForgottenPassword from "./pages/ForgottenPassword";
import Cars from './components/layout/Cars'
import Main from './components/layout/Main'
import Request from './components/layout/Request'
import Users from './components/layout/Users'
import Widget from "./components/layout/Widget";
import EditCar from "./components/layout/EditCar";
import Booked from "./components/layout/Booked";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignUp from "./pages/Signup";
import Expired from "./pages/Expired";
import NotFound from "./pages/NotFound";

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Comfortaa',
      textTransform: 'none',
      fontSize: 16,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/sign-up" element={<SignUp />}/>
          <Route path="/reset/:email" element={<ResetPassword/>}/>
          <Route path="/forgotten-password" element={<ForgottenPassword/>}/>
          <Route path="/dashboard" element={<Dashboard/>}>
            <Route path='users' element={<Users />} />
            <Route path='main' element={<Main />} />
            <Route path='cars' element={<Cars />} />
            <Route path='requests' element={<Request />} />
            <Route path='widget' element={<Widget />} />
            <Route path="cars/edit" element={<EditCar />} />
            <Route path="cars/booked" element={<Booked />} />
          </Route>
          <Route path="/expired" element={<Expired />}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
