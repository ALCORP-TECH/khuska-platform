/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, useMediaQuery, Divider, FormControl, Button, Modal, Box, TextField } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@mui/material/CircularProgress';
import AnimateButton from 'components/extended/AnimateButton';
import AuthCard from './AuthCard';
import Logo from 'components/Logo';
import google from 'assets/images/google.webp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authentication } from 'config/firebase';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { uiStyles } from './styles';
import { genConst } from 'store/constant';
import { fullDate, generateDate } from 'utils/validations';
import { createDocument, isExistUser } from 'config/firebaseEvents';
import {
  collInbox,
  collNotifications,
  collSubscription,
  collUserAddress,
  collUserBillData,
  collUserLog,
  collUserPaymentMethod,
  collUserPhone,
  collUsers
} from 'store/collections';
import { generateOwnReferalNumber } from 'utils/idGenerator';

const provider = new GoogleAuthProvider();

const useStyles = makeStyles(() => ({
  root: {
    '& .MuiInputBase-root': {
      color: '#FFF'
    },
    '& .MuiFilledInput-root': {
      backgroundColor: '#242526',
      borderRadius: 10,
      marginBottom: 15,
      color: '#FFF'
    },
    '& .MuiFilledInput-root:hover': {
      backgroundColor: '#242526',
      color: '#FFF',
      '@media (hover: none)': {
        backgroundColor: '#242526'
      }
    },
    '& .MuiFilledInput-root.Mui-focused': {
      backgroundColor: '#242526',
      color: '#FFF',
      border: '1px solid #242526'
    },
    '& .MuiInputLabel-outlined': {
      color: '#FFF'
    }
  }
}));

export default function Login() {
  const theme = useTheme();
  let navigate = useNavigate();
  const auth = getAuth();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    onAuthStateChanged(authentication, async (user) => {
      if (user) {
        navigate('/market/main');
      }
    });
  }, []);

  const createUserAditionalData = (uid, email) => {
    //Subscription
    const objSubscription = {
      idUser: uid,
      startDate: null,
      endDate: null,
      cancelDate: null,
      state: genConst.CONST_STATE_IN
    };
    createDocument(collSubscription, uid, objSubscription);
    //Log
    const userLog = {
      idUser: uid,
      loginDate: fullDate(),
      email: email,
      state: genConst.CONST_STATE_IN,
      message: 'Registro de nuevo usuario.'
    };
    createDocument(collUserLog, uid, userLog);
    //Address
    const userAddress = {
      idUser: uid,
      principal: '',
      secondary: '',
      number: '',
      city: '',
      province: '',
      reference: ''
    };
    createDocument(collUserAddress, uid, userAddress);
    //Phone
    const userPhone = {
      idUser: uid,
      phone: ''
    };
    createDocument(collUserPhone, uid, userPhone);
    //BillData
    const userBillData = {
      idUser: uid,
      name: '',
      ci: '',
      address: '',
      email: '',
      city: '',
      phone: '',
      postal: ''
    };
    createDocument(collUserBillData, uid, userBillData);
    //Payment Data
    const userPaymentData = {
      idUser: uid,
      name: '',
      number: '',
      numberMask: null,
      date: '',
      cvc: '',
      cvcmd5: null
    };
    createDocument(collUserPaymentMethod, uid, userPaymentData);
    //Inbox
    const inbox = {
      to: email,
      from: 'Khuska Admin',
      date: generateDate(),
      message: 'Bienvenido a Khuska',
      subject: 'Bienvenida'
    };
    createDocument(collInbox, uid, inbox);
    //Notifications
    const notifications = {
      to: email,
      from: 'Khuska Admin',
      date: generateDate(),
      message: 'No olvides actualizar tu información de perfil.',
      subject: 'Notificación',
      state: genConst.CONST_NOTIF_NL
    };
    createDocument(collNotifications, uid, notifications);
  };

  const handleLogin = () => {
    if (!email || !password) {
      toast.info('Correo electrónico y contraseña son obligatorios!.', { position: toast.POSITION.TOP_RIGHT });
    } else {
      setOpen(true);
      signInWithEmailAndPassword(authentication, email, password)
        .then((userCredencials) => {
          const user = userCredencials.user;
          console.log(user);
          setTimeout(() => {
            setOpen(false);
            navigate('/market/main');
          }, 2000);
        })
        .catch((error) => {
          setOpen(false);
          if (error.code === 'auth/user-not-found') {
            toast.error('Upsss! Usuario no encontrado. Por favor regístrate.', { position: toast.POSITION.TOP_RIGHT });
          } else if (error.code === 'auth/wrong-password') {
            toast.error('Upsss! Contraseña incorrecta.', { position: toast.POSITION.TOP_RIGHT });
          } else if (error.code === 'auth/user-disabled') {
            toast.error('Upsss! Tu cuenta se encuentra inhabilitada!.', { position: toast.POSITION.TOP_RIGHT });
          } else if (error.code === 'auth/invalid-login-credentials') {
            toast.error('Upsss! Datos de inicio de sesión no válidos!.', { position: toast.POSITION.TOP_RIGHT });
          } else if (error.code === 'auth/internal-error') {
            toast.error('Error interno, por favor comuniquese con el administrador del sistema!.', {
              position: toast.POSITION.TOP_RIGHT
            });
          } else if (error.code === 'auth/network-request-failed') {
            toast.error('Error en la red, por favor intente más tarde!.', { position: toast.POSITION.TOP_RIGHT });
          } else {
            console.log(error);
          }
        });
    }
  };

  const handleLoginGoogle = () => {
    setOpen(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        //const credential = GoogleAuthProvider.credentialFromResult(result);
        //const token = credential.accessToken;
        const user = result.user;
        //console.log(user);
        //console.log(token);
        isExistUser(user.uid).then((res) => {
          if (res) {
            console.log(res, 'User valid');
          } else {
            let refCode = generateOwnReferalNumber(6);
            const userObject = {
              id: user.uid,
              fullName: user.displayName,
              name: user.displayName,
              lastName: '',
              email: user.email,
              description: '',
              gender: '',
              birthday: '',
              avatar: user.photoURL,
              state: genConst.CONST_STATE_IN,
              subState: genConst.CONST_STATE_IN,
              profile: genConst.CONST_PRO_DEF,
              createAt: fullDate(),
              registerDate: fullDate(),
              date: fullDate(),
              city: null,
              ci: null,
              refer: null,
              ownReferal: refCode,
              url: user.photoURL
            };
            createDocument(collUsers, user.uid, userObject);
            createUserAditionalData(user.uid, user.email);
            toast.success('Usuario registrado correctamente!.', { position: toast.POSITION.TOP_RIGHT });
          }
        });
        setTimeout(() => {
          setOpen(false);
          navigate('/market/main');
        }, 2000);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const errorEmail = error.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, errorEmail, credential);
        toast.error('Ups, algo salio mal!!!', { position: toast.POSITION.TOP_RIGHT });
        setOpen(false);
      });
  };

  return (
    <Grid container direction="column">
      <ToastContainer />
      <Grid item xs={12}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'transparent' }}
        >
          <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
            <AuthCard>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item>
                  <Logo />
                </Grid>
                <Grid item xs={12}>
                  <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                    <Grid item>
                      <Typography color={theme.palette.secondary.light} gutterBottom variant={matchDownSM ? 'h5' : 'h4'}>
                        Bienvenido KHUSKA MARKET
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ ...theme.typography.customInputAuth }}>
                    <TextField
                      id="outlined-adornment-email-login"
                      variant="filled"
                      type="email"
                      name="email"
                      className={classes.root}
                      fullWidth
                      label="Correo Electrónico"
                      color="info"
                      onChange={(ev) => setEmail(ev.target.value)}
                      sx={{ input: { color: '#FFF' } }}
                    />
                  </FormControl>
                  <FormControl fullWidth sx={{ ...theme.typography.customInputAuth }}>
                    <TextField
                      id="outlined-adornment-password-login"
                      variant="filled"
                      type="password"
                      name="password"
                      className={classes.root}
                      fullWidth
                      label="Contraseña"
                      color="info"
                      onChange={(ev) => setPassword(ev.target.value)}
                      sx={{ input: { color: '#FFF' } }}
                    />
                  </FormControl>
                  <AnimateButton>
                    <Button
                      disableElevation
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="secondary"
                      style={{ borderRadius: 10 }}
                      onClick={handleLogin}
                    >
                      Iniciar Sesión
                    </Button>
                  </AnimateButton>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: '#3E4042' }} />
                </Grid>
                <Grid item xs={12}>
                  <Grid item container direction="column" alignItems="center" xs={12}>
                    <Typography
                      component={Link}
                      to="/market/recovery"
                      variant="h5"
                      sx={{ textDecoration: 'none', color: theme.palette.secondary.light }}
                    >
                      Olvidaste tu contraseña?
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h4" style={{ textAlign: 'center', marginBottom: 10, color: '#FFF' }}>
                    Aún no tienes una cuenta?
                  </Typography>
                  <Grid item container direction="column" alignItems="center" xs={12}>
                    <Typography
                      component={Link}
                      to="/market/register"
                      variant="subtitle1"
                      sx={{ textDecoration: 'none', color: theme.palette.secondary.contrastText }}
                    >
                      Regístrate
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: '#3E4042' }} />
                </Grid>
                <Grid item xs={12}>
                  <center>
                    <Typography variant="subtitle1" sx={{ textDecoration: 'none', color: '#FFF' }}>
                      o inicia sesión con:
                    </Typography>
                  </center>
                  <Button
                    disableElevation
                    fullWidth
                    size="large"
                    type="submit"
                    variant="outlined"
                    startIcon={<img src={google} alt="brand google" width={22} />}
                    style={{ color: theme.palette.secondary.light, height: 50, borderRadius: 12, marginTop: 10 }}
                    onClick={handleLoginGoogle}
                  >
                    Inicia sesión con Google
                  </Button>
                </Grid>
              </Grid>
            </AuthCard>
          </Grid>
        </Grid>
      </Grid>
      <Modal open={open} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <center>
          <Box sx={uiStyles.modalLoader}>
            <CircularProgress color="info" size={100} />
          </Box>
        </center>
      </Modal>
    </Grid>
  );
}
