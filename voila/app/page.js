'use client'
import {Box, Stack, Typography, Button, Modal, TextField} from '@mui/material'
import { collection, getDocs, query, setDoc, doc, deleteDoc, getDoc} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from './firebase';

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


export default function Home() {
  const [pantry, setPantry] = useState([])
  const [itemName, setItemName] = useState('');
  const [open, setOpne] = useState(false)
  const handleOpen = () => setOpne(true)
  const handleClose = () => setOpne(false)

  const updatePantry = async () => { 
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
    });  
    console.log(pantryList)
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  },[])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'),item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()){
      const {count} = docSnap.data()
      await setDoc(docRef, {count:count+1})
    }
    else
    {
      await setDoc(docRef, {count:1})
    }
    await updatePantry()
  }

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
    await updatePantry()
  }


  return (
  <Box
    width="100vw"
    height="100vh"
    display={"flex"}
    justifyContent={'center'}
    alignItems={'center'}
    flexDirection={'Column'}
    gap={2}
    >

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

      <Button
      onClick={handleOpen}
      variant="contained"
      >
        Add
      </Button>
      <Box
      width={'800px'}
      height={'100px'}
      bgcolor={'#7ed6df'}
      display={'flex'}
      justifyContent={'center'}
      alignContent={'center'}
      >
        <Typography
          mt={2}
          variant='h3'
        >
          Pantry Items
        </Typography>
      </Box>


      <Stack
        width="800px"
        height="300px"
        spacing={2}
        overflow={'auto'}      
      >
        {pantry.map(({name, count}) =>(
          <Stack key={name} direction={'row'} spacing={2} justifyContent={'center'} alignContent={'center'}>
          <Box
            key={name}
            width="100%"
            height="100px"
            display={'flex'}
            justifyContent={'center'}
            alignContent={'space-between'}
            bgcolor={'#f0f0f0'}
            padding={3}
          >
            <Typography mt={2} variant='h4' color={'#111'} margin={'0.1em'}>
              {name}
            </Typography>

            <Typography mt={2} variant='h4' color={'#111'} margin={'0.1em 1em'}>
              Quantity: {count}
            </Typography>

          </Box>
          <Button variant='contained' onClick={() => removeItem(name)}>Remove</Button>
          </Stack>
        ))};
      </Stack>
  </Box>

  );
  
}
