import { useState } from 'react';
import { Camera, CameraType } from 'react-camera-pro';
import '@tensorflow/tfjs'; // TensorFlow.js
import { firestore, doc, getDoc, setDoc } from 'firebase/firestore';

export default function CameraComponent({ onClose }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (photo) => {
    setLoading(true);
    setPhoto(photo);

    const item = await classifyImage(photo); // comes from a different component as ML classifier model

    // Add item to the pantry
    await addItemToPantry(item);
    setLoading(false);
    onClose(); // Close the camera component after processing
  };

  const addItemToPantry = async (item) => {
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

    // Refresh parent component's state
    await updatePantry();
    await updateTotalCount();
    await updateTotalInventory();
    await updateTotalAdditions();
    await updateTotalDeletions();
    await fetchLastFiveActivities();
  };

  return (
    <div>
      <Camera
        onCapture={handleCapture}
        onError={(err) => console.error(err)}
        type={CameraType.USER}
      />
      {loading && <p>Processing...</p>}
      {photo && <img src={photo} alt="Captured" />}
    </div>
  );
}
