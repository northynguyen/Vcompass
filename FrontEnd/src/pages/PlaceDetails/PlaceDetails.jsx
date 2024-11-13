import './PlaceDetails.css'
import PlaceReview from '../../components/PlaceReview/PlaceReview'
import SlideBar from '../../components/SlideBar/SlideBar'
import HotelDetailsInfo from '../../components/HotelDetailsInfo/HotelDetailsInfo'
import FoodDetailsInfo from '../../components/FoodDetailsInfo/FoodDetailsInfo'
import AttractionDetailsInfo from '../../components/AttractionDetailsInfo/AttractionDetailsInfo'
import {  useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js'
const PlaceDetails = () => {
  const { type, serviceId } = useParams(); // Use useParams to get params
  const decodedServiceId = decodeURIComponent(serviceId);
    const bytes = CryptoJS.AES.decrypt(decodedServiceId, 'mySecretKey');
    const originalServiceId = bytes.toString(CryptoJS.enc.Utf8);
  
  if (!serviceId || !type) {
    return <p>Error: Missing data.</p>;
  }
  return (
    <div className='place-details'>
     {type === 'accommodation' && <HotelDetailsInfo serviceId={originalServiceId} />}
      {type === 'attraction' && <AttractionDetailsInfo serviceId={originalServiceId} />}
      {type === 'food' && <FoodDetailsInfo serviceId={originalServiceId} />}
      <SlideBar type={type}/>
      <PlaceReview id={originalServiceId} type={type}/>
    </div>
  )
}

export default PlaceDetails