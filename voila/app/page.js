'use client'
import {Box, Stack, Typography, Button, Modal, TextField, IconButton, Icon} from '@mui/material'
import { PieChart} from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { collection, getDocs, query, setDoc, doc, deleteDoc, getDoc} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from './firebase';
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

const aData = [500,600,1100]
const bData = [400, 300, 900]
const xLabels = ['a','b','c']

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
  const [pantry, setPantry] = useState([])
  const [itemName, setItemName] = useState('');
  const [open, setOpne] = useState(false)
  const [totalCount, setTotalCount] = useState(0);
  const [totalAdditions, setTotalAdditions] = useState(0);
  const [totalDeletions, setTotalDeletions] = useState(0);
  
  const handleOpen = () => setOpne(true)
  const handleClose = () => setOpne(false)
  


  // Update pantry function
  const updatePantry = async () => { 
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
    });
    setPantry(pantryList)
  }

  const updateMonthlyCounter = async() => {
    const snapshot = query(collection(firestore, 'monthlyCounter'))
    const docs = await getDocs(snapshot)
    let additions = 0

    let deletions = 0
    docs.forEach((doc) => {
      if(doc.id === 'Add')
      {
        additions = doc.data().count
      }
      else if(doc.id === 'Delete')
      {
        deletions = doc.data().count
      }
      setTotalAdditions(additions)
      setTotalDeletions(deletions)
    });

  }

  //Synchronizes updatePantry with firebase db
  useEffect(() => {
    updatePantry()
    updateMonthlyCounter()
  },[])


  // Here, I have defined functions for adding items to the list
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'),item)
    const docRef2 = doc(collection(firestore,'monthlyCounter'),item)
    const docSnap = await getDoc(docRef)
    const docSnap2 = await getDoc(docRef2)
    if(docSnap2.exists())
    {
      const {totalCount} = docSnap2.data()
      await setDoc(docRef2, {totalCount:totalCount+1})
    }
    else
    {
      await setDoc(docRef2, {totalCount:1})
    }

    if (docSnap.exists()){
      const {count} = docSnap.data()
      
      await setDoc(docRef, {count:count+1})
      //await setDoc(docRef2, {totalCount:totalCount+1})
    }
    else
    {
      await setDoc(docRef, {count:1})
    }
    await updatePantry()
  }

  // This will remove item from the list
  

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'),item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists())
    {
      const {count} = docSnap.data()
      if(count == 1)
      {
        await deleteDoc(docRef)
      }
      else
      {
        await setDoc(docRef, {count: count -1})
      }
    }
    await addDoc(collection(firestore, 'monthlyCounter'), {
      action: 'Subtract',
      timestamp: serverTimestamp()
    });

    await updatePantry();
    await updateMonthlyCounter();
  };


  return (
  // This is the full body of the app
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
      <Button
        position={'absolute'}
        top={'0'}
        right={'0'}
        backgroundColor={'#34495e'}
        height={'20px'}
        width={'20px'}
    >
      <Icon />
    </Button>
    </Box>
    
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////// Highlights section //////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}

    <Box width="100vw" height={"12vh"} display={'flex'} justifyContent={'space-between'} alignItems={'center'} margin={'5px'}>

    <Box
      sx = {smallBox}
      backgroundColor={"#685DAE"}
    >
      <Typography
        fontSize={'1.2em'}
        color={'#fff'}
        variant={'h4'}
        textAlign={'center'}
      >
        Number of items:{totalCount}
      </Typography>
      
    </Box>
    <Box
      sx = {smallBox}
      backgroundColor={"#3c6382"}
    >
    
    <Typography
        fontSize={'1.2em'}
        color={'#fff'}
        variant={'h4'}
        textAlign={'center'}
      >
        Total Inventory:{totalCount}
      </Typography>
    </Box>
    <Box
      sx = {smallBox}
      backgroundColor={"#6a89cc"}
    >
      <Typography
        fontSize={'1.2em'}
        color={'#fff'}
        variant={'h4'}
        textAlign={'center'}
      >
        Total Additions:{totalCount}
      </Typography>
    </Box>
    <Box
      sx = {smallBox}
      backgroundColor={"#1abc9c"}
    >
    <Typography
        fontSize={'1.2em'}
        color={'#fff'}
        variant={'h4'}
        textAlign={'center'}
      >
        Total Deletions:{totalCount}
      </Typography>      
    </Box>
    </Box>
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////// Modal for adding items //////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
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

    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////// Inventory List section //////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    {/*///////////////////////////////////////////////////////////////////////////////*/}
    
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
              Add items
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
              bgcolor={'#f0f0f0'}
              padding={1}
              position={'relative'}
            >
              <Typography mt={2} variant='h5' color={'#111'} margin={'0.05em'} fontSize={'0.9em'} textAlign={'left'}>
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
          <PieChart
            series={[
              {
                data: [{value:5, color:'#6a89cc', label:'Additions'},{value:6, color:'#82ccdd', label:'Deletions'}],
                innerRadius: 50,  
                outerRadius: 80,
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
        <Box
        width="25vw"
        margin={'5px'}
        backgroundColor={'#34495e'}
        sx={largerBox}
        >
          <PieChart
            series={[
              {
                data: [{value:5, color:'#6a89cc', label:'Additions'},{value:6, color:'#82ccdd', label:'Deletions'}],
                innerRadius: 50,
                outerRadius: 80,
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
                    { data: aData, label: 'pv', id: 'pvId' },
                    { data: bData, label: 'uv', id: 'uvId' },
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
            >
              <Typography
                mt={2}
                margin={'20px'}
                color={'#fff'}
                variant='h6'
              >
                Recent Activities
              </Typography>
            </Box>
        </Box>
      </Box>
      
      

  );
  
}
