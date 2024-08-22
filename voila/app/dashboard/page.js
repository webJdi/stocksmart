// eslint-disable-next-line react/no-unescaped-entities
'use client'
import * as React from 'react';
import {Box, Stack, Typography, Button, Modal, TextField, Timestamp, Icon} from '@mui/material'
import { PieChart} from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { collection, getDocs, query, setDoc, doc, deleteDoc, getDoc, where, limit, orderBy} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import AppAppBar from '../components/AppAppBar';
import { Camera, CameraType } from 'react-camera-pro';
import '@tensorflow/tfjs'; // TensorFlow.js
//import CameraComponent from './Cams';
import { Quicksand } from 'next/font/google';
import Head from 'next/head';

//import { Camera, CameraType } from 'react-camera-pro';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  gap: 3
};




const smallBox = {
      width:"calc(25% - 10px)",
      height:"15vh",
      margin:'10px',
      borderRadius:'1em',
      display:'block',
      alignContent:'center',
      justifyContent:'space-between'
}

const largerBox = {
      height:"calc(40vh-20px)",
      display:'block',
      alignContent:'center',
      justifyContent:'space-between'

}

export default function Home() {
  const [mode, setMode] = React.useState('light');
  const [pantry, setPantry] = useState([])
  const [itemName, setItemName] = useState('');
  const [open, setOpne] = useState(false)
  const [totalCount, setTotalCount] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [totalAdditions, setTotalAdditions] = useState(0);
  const [totalDeletions, setTotalDeletions] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [aData, setAData] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  
  const handleOpen = () => setOpne(true)
  const handleClose = () => setOpne(false)
  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);
  
// This code only runs on the client side, to determine the system color preference
React.useEffect(() => {
  // Check if there is a preferred mode in localStorage
  const savedMode = localStorage.getItem('themeMode');
  if (savedMode) {
    setMode(savedMode);
  } else {
    // If no preference is found, it uses system preference
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    setMode(systemPrefersDark ? 'dark' : 'light');
  }
}, []);

const toggleColorMode = () => {
  const newMode = mode === 'dark' ? 'light' : 'dark';
  setMode(newMode);
  localStorage.setItem('themeMode', newMode); // Save the selected mode to localStorage
};

  // Update pantry function
  const updatePantry = async () => { 
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
      
    });
    setPantry(pantryList)
    console.log(pantryList)
    const itemNames = pantryList.map(item => item.name);
    const itemCounts = pantryList.map(item => item.count);
  
    setXLabels(itemNames);
    setAData(itemCounts);
  }

  const updateTotalCount = async () => {
    const snapshot = await getDocs(collection(firestore, 'pantry'));
    const totalCount = snapshot.size; // Number of documents in the 'pantry' collection
    setTotalCount(totalCount);
  };

  const updateTotalInventory = async () => {
    const snapshot = await getDocs(collection(firestore, 'pantry'));
    let totalInventory = 0;
    snapshot.forEach((doc) => {
      const { count } = doc.data();
      totalInventory += count;
    });
    setTotalInventory(totalInventory);
  };

  const updateTotalAdditions = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'monthlyCounter'), where('type','==','Add')));
    let totalAdditions = 0;
    snapshot.forEach((doc) => {
        totalAdditions += 1;
    });
    setTotalAdditions(totalAdditions);
  };

  const updateTotalDeletions = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'monthlyCounter'), where('type','==','Delete')));
    let totalDeletions = 0;
    snapshot.forEach((doc) => {
        totalDeletions += 1;
    });
    setTotalDeletions(totalDeletions);
  };

  const fetchLastFiveActivities = async () => {
    const q = query(
      collection(firestore, 'monthlyCounter')
      
    );
    const snapshot = await getDocs(q);
    let activities = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const datetime = data.datetime.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const formattedDate = datetime.toLocaleString(); // Format the date as a string
      activities.push({ id: doc.id, ...data, formattedDate });
    });
    
    activities = activities.sort((a, b) => b.datetime - a.datetime).slice(0, 5);

    

    setRecentActivities(activities);
  };
  

  //Synchronizes fuunctions with firebase db
  useEffect(() => {
    document.title = "StockSmart - Inventory Management"
    updatePantry()
    updateTotalCount()
    updateTotalInventory()
    updateTotalAdditions()
    updateTotalDeletions()
    fetchLastFiveActivities()
  },[])


  // Here, I have defined functions for adding items to the list
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }

    await setDoc(doc(collection(firestore, 'monthlyCounter')), {
      type: 'Add',
      name: item,
      datetime: new Date()
    });

    await updatePantry();
    await updateTotalCount()
    await updateTotalInventory()
    await updateTotalAdditions()
    await updateTotalDeletions()
    await fetchLastFiveActivities()
  };

  // This will remove item from the list
  

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }

      await setDoc(doc(collection(firestore, 'monthlyCounter')), {
        type: 'Delete',
        name: item,
        datetime: new Date()
      });

      await updatePantry();
      await updateTotalCount()
      await updateTotalInventory()
      await updateTotalAdditions()
      await updateTotalDeletions()
      await fetchLastFiveActivities
      //await updateMonthlyCounter();
    }
  };


  return (
    <>
      

  
  <Box
    width="100vw"
    height="100vh"
    display={"flex"}
    justifyContent={'left'}
    alignItems={'top'}
    flexDirection={'Column'}
    backgroundColor={'#2c3e50'}
    overflow={'hidden'}
    position={'relative'}
    >
    {/* Top horizontal bar for logo */}
    <Box width="100vw" height={"7vh"} display={'flex'} margin={'5px'}>
      <Typography
        color={'#fff'}
        fontSize={'1.8em'}
        margin={'0.2em 1em'}
      >
        StockSmart
      </Typography>

      {/* ///// This section is to be completed ///// 
      <Button
        position={'absolute'}
        top={'0'}
        right={'0'}
        backgroundColor={'#34495e'}
        height={'20px'}
        width={'20px'}
        onClick={handleCameraOpen}
    >
      Open Camera
    </Button>
    */}
        <Modal open={cameraOpen} onClose={handleCameraClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, pt: 2, px: 4, pb: 3, gap: 3 }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Camera
              </Typography>
              {/* <CameraComponent onClose={handleCameraClose} /> */}

            </Box>
          </Modal>
    </Box>
    
    {/*///////////////////////////////////// Highlights section //////////////////////*/}
    
    <Box width="100vw" height={"12vh"} display={'flex'} justifyContent={'space-between'} alignItems={'center'} margin={'5px'}>

    <Box
      sx = {smallBox}
      backgroundColor={"#685DAE"}
      position={'relative'}
    >
      <Typography

        color={'#fff'}
        fontSize={'0.7em'}
        textAlign={'center'}
      >
        Number of items
        <span
          style={{fontSize:'4em', display:'block'}}
        >
        {totalCount}
        </span>
      </Typography>
      
    </Box>
    <Box
      sx = {smallBox}
      backgroundColor={"#3c6382"}
    >
    
    <Typography

        color={'#fff'}
        fontSize={'0.7em'}
        textAlign={'center'}
      >
        Total Inventory
        <span
          style={{fontSize:'4em', display:'block'}}
        >
        {totalInventory}
        </span>
        
      </Typography>
    </Box>
    <Box
      sx = {smallBox}
      backgroundColor={"#6a89cc"}
    >
      <Typography
        color={'#fff'}
        fontSize={'0.7em'}
        textAlign={'center'}
      >
        Total Additions
        <span
          style={{fontSize:'4em', display:'block'}}
        >
        {totalAdditions}
        </span>
        
      </Typography>
    </Box>
    <Box
      sx = {smallBox}
      backgroundColor={"#1abc9c"}
    >
    <Typography
        color={'#fff'}
        fontSize={'0.7em'}
        textAlign={'center'}
      >
        Total Deletions
        <span
          style={{fontSize:'4em', display:'block'}}
        >{totalDeletions}</span>
      </Typography>      
    </Box>
    </Box>
    {/*///////////////////////////////// Modal for adding items //////////////////////*/}
    
<Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={style}>
    <Typography id="modal-modal-title" variant="h6" component="h2">
      Add Item
    </Typography>
    <Stack width={'100%'} direction={'row'} spacing={'2'}>
          <TextField
          id="outlined-basic"
          label="item"
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          />
          <Button
          variant='outlined'
          onClick={()=>{
            addItem(itemName)
            setItemName()
            handleClose()
          }}
          >Add</Button>
    </Stack>
  </Box>
</Modal>

    
    <Box
    width={"100vw"}
    height={"40vh"}
    display={'flex'}
    justifyContent={"space-between"}
    alignContent={'center'}
    boxSizing={'border-box'}
    margin={'5px'}
    >

      <Box
      width="calc(50vw)"
      sx={largerBox}
      boxSizing={'border-box'}
      margin={'5px'}
       >
        <Box
        width={'calc(50vw)'}
        height={'8vh'}
        margin={'5px'}
        bgcolor={'#7ed6df'}
        display={'flex'}
        justifyContent={'center'}
        alignContent={'center'}
        position={'relative'}
        >
          <Typography
            mt={2}
            variant='h6'
            margin={'0.5em'}
          >
            Inventory
          </Typography>
          <Box
            position={'absolute'}
            right={'1vw'}
            top={'2vh'}
          >
            <Button
              onClick={handleOpen}
              variant="contained"
              size='small'
            >
              Add items <Icon />
            </Button>
          </Box>
          
          

        </Box>
        <Stack
          width={'50vw'}
          height={'30vh'}
          margin={'5px'}
          overflow={'auto'}
          backgroundColor={'#3A3941'}
          boxSizing={'border-box'}
        >
          {pantry.map(({name, count}) =>(
            <Stack key={name} direction={'row'} justifyContent={'center'} alignContent={'center'}>
            <Box
              key={name}
              width="100%"
              height="40px"
              display={'block'}
              justifyContent={'center'}
              alignContent={'space-between'}
              bgcolor={'#40739e'}
              padding={1}
              position={'relative'}
            >
              <Typography mt={2} variant='h5' color={'#fff'} margin={'0.05em'} fontSize={'0.9em'} textAlign={'left'}>
                {name}
              </Typography>
            </Box>
            <Typography backgroundColor={'#079992'} color={'#fff'} padding={'10px 15px'} mt={2} variant='h5' margin={'0.05em'} textAlign={'right'} fontSize={'1em'}>
              {count}
              </Typography>
            <Button variant='contained' color='error' size='small' onClick={() => removeItem(name)}>Remove</Button>
            </Stack>
          ))};
        </Stack>
        
        </Box>
        
      <Box
        width="25vw"
        backgroundColor={'#34495e'}
        margin={'5px'}
        sx={largerBox}
        >
        <Typography
        variant='h5'
        fontSize={'1.1em'}
        textAlign={'center'}
        color={'#fff'}
        >
          Additions vs Deletions of items
        </Typography>
          <PieChart
            series={[
              {
                data: [{value:totalAdditions, color:'#6a89cc', label:'Additions'},{value:totalDeletions, color:'#82ccdd', label:'Deletions'}],
                innerRadius: 50,  
                outerRadius: 80,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -180,
                endAngle: 180,
                cx: 150,
                cy: 150
              }
            ]}
          />
        </Box>
        <Box
        width="25vw"
        margin={'5px'}
        backgroundColor={'#34495e'}
        sx={largerBox}
        >
          <Typography
            variant='h5'
            fontSize={'1.1em'}
            textAlign={'center'}
            color={'#fff'}
            >
              Present Inventory vs Consumption
          </Typography>
          <PieChart
            series={[
              {
                data: [{value:totalInventory, color:'#6a89cc', label:'Inventory'},{value:totalDeletions, color:'#82ccdd', label:'Consumption'}],
                innerRadius: 20,
                outerRadius: 60,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -180,
                endAngle: 180,
                cx: 150,
                cy: 150,
              }
            ]}
          />
        </Box>

        </Box>

        <Box
        width={"100vw"}
        height={"35vh"}
        display={'flex'}
        justifyContent={"space-between"}
        alignContent={'center'}
        boxSizing={'border-box'}
        margin={'5px'}
        >
            <Box
            width={"50vw"}
            height={'35vh'}
            display={'block'}
            margin={'5px'}
            backgroundColor={'#34495e'}
            boxSizing={'border-box'}
            >
                <BarChart
                  series={[
                    { data: aData, label: 'products', id: 'pvId' }
                  ]}
                  xAxis={[{ data: xLabels, scaleType: 'band' }]}
                />


            </Box>

            <Box
            width={"50vw"}
            height={'35vh'}
            display={'block'}
            margin={'5px'}
            backgroundColor={'#34495e'}
            boxSizing={'border-box'}
            overflow={'auto'}
            >
              <Typography
                mt={2}
                margin={'20px'}
                color={'#fff'}
                variant='h6'
              >
                Recent Activities
              </Typography>
              <Stack spacing={1} margin={'5px'} >
                {recentActivities.map(activity => (
                  <Box
                    key={activity.id}
                    padding={1}
                    backgroundColor={'#40739e'}
                    borderRadius={1}
                    fontSize={'0.8em'}
                  >
                    <Typography variant='body1' color={'#fff'}>{activity.name} {activity.type}&#39;d at {activity.formattedDate}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
        </Box>
      </Box>
      
      </>

  );
  
}
