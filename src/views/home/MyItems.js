/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authentication } from 'config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { deleteDocument, getProductByUserId } from 'config/firebaseEvents';
import {
  Typography,
  Box,
  Grid,
  OutlinedInput,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  ButtonGroup,
  Button,
  Modal
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { searchingProductsByNameOrCategory } from 'utils/search';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons';
import MessageDark from 'components/message/MessageDark';
import { collProducts } from 'store/collections';
import { uiStyles } from './styles';

export default function MyItems() {
  let navigate = useNavigate();
  const [dataList, setDataList] = useState([]);
  const [search, setSearch] = useState('');
  const [openLoader, setOpenLoader] = useState(false);

  useEffect(() => {
    onAuthStateChanged(authentication, async (user) => {
      if (user) {
        getProductByUserId(user.uid).then((data) => {
          setDataList(data);
        });
      } else {
        navigate('/market/main');
      }
    });
  }, []);

  const reloadData = () => {
    onAuthStateChanged(authentication, async (user) => {
      if (user) {
        getProductByUserId(user.uid).then((data) => {
          setDataList(data);
        });
      } else {
        navigate('/market/main');
      }
    });
  };

  return (
    <Box>
      <Box sx={{ flexGrow: 0, mt: 1 }}>
        <OutlinedInput
          id={'search'}
          type="text"
          name={'search'}
          onChange={(ev) => setSearch(ev.target.value)}
          placeholder={'Buscar por nombre o categoría'}
          style={{ width: '100%' }}
        />
      </Box>
      {dataList.length > 0 ? (
        <Grid container spacing={0} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Grid container spacing={0.5}>
              {dataList.filter(searchingProductsByNameOrCategory(search)).map((item) => {
                return (
                  <Grid key={item.id} item xs={6} sm={6} md={3} lg={2}>
                    <Card sx={{ maxWidth: '100%', height: 300, borderRadius: 3, backgroundColor: '#242526', cursor: 'pointer' }}>
                      <CardMedia
                        sx={{ borderRadius: 3, padding: 0.5 }}
                        component="img"
                        height={194}
                        image={item.picture1}
                        alt="Portada img"
                      />
                      <CardContent sx={{ backgroundColor: '#242526', marginTop: -2, paddingLeft: 1, paddingRight: 1 }}>
                        <Typography variant="h4" color="#FFF">
                          ${item.price}
                        </Typography>
                        <p
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            color: '#FFF',
                            fontSize: 11,
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}
                        >
                          {item.name}
                        </p>
                      </CardContent>
                      <CardActionArea style={{ marginTop: -20 }}>
                        <center>
                          <ButtonGroup>
                            <div
                              aria-hidden="true"
                              onClick={() => {
                                navigate({
                                  pathname: '/market/item/',
                                  search: `?id=${item.id}`
                                });
                              }}
                              style={{ marginRight: 20 }}
                            >
                              <IconEye color="#FFF" />
                            </div>
                            <div
                              aria-hidden="true"
                              onClick={() => {
                                navigate({
                                  pathname: '/market/item/edit',
                                  search: `?id=${item.id}`
                                });
                              }}
                              style={{ marginRight: 20 }}
                            >
                              <IconEdit color="#FFF" />
                            </div>
                            <div
                              aria-hidden="true"
                              onClick={() => {
                                setOpenLoader(true);
                                deleteDocument(collProducts, item.id);
                                setTimeout(() => {
                                  setOpenLoader(false);
                                  reloadData();
                                }, 1000);
                              }}
                              style={{ marginRight: 20 }}
                            >
                              <IconTrash color="#FFF" />
                            </div>
                          </ButtonGroup>
                        </center>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid container style={{ marginTop: 20 }}>
          <Grid item xs={12}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <MessageDark message={'No existen productos publicados por ti!'} submessage="" />
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <center>
                <Button
                  disableElevation
                  size="large"
                  type="submit"
                  variant="outlined"
                  color="primary"
                  style={{ borderRadius: 10, height: 40, marginTop: 10, fontSize: 12, color: '#FFF' }}
                  onClick={() => navigate('/market/create')}
                >
                  Crear Producto
                </Button>
              </center>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Modal open={openLoader} aria-labelledby="modal-loader" aria-describedby="modal-loader">
        <center>
          <Box sx={uiStyles.modalLoader}>
            <CircularProgress color="info" size={100} />
          </Box>
        </center>
      </Modal>
    </Box>
  );
}