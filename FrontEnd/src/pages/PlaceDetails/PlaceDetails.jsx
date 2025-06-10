import './PlaceDetails.css'
import PlaceReview from '../../components/PlaceReview/PlaceReview'
import SlideBar from '../../components/SlideBar/SlideBar'
import HotelDetailsInfo from '../../components/HotelDetailsInfo/HotelDetailsInfo'
import FoodDetailsInfo from '../../components/FoodDetailsInfo/FoodDetailsInfo'
import AttractionDetailsInfo from '../../components/AttractionDetailsInfo/AttractionDetailsInfo'
import { useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import CryptoJS from 'crypto-js'

const PlaceDetails = ({ setShowLogin }) => {
  const { type, serviceId } = useParams(); // Use useParams to get params
  const location = useLocation();
  const decodedServiceId = decodeURIComponent(serviceId);
  const bytes = CryptoJS.AES.decrypt(decodedServiceId, 'mySecretKey');
  const originalServiceId = bytes.toString(CryptoJS.enc.Utf8);
  const { filterData } = location.state || {};
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!serviceId || !type) {
    return <p>Error: Missing data.</p>;
  }

  return (
    <div className='place-details'>
      {type === 'accommodation' && <HotelDetailsInfo serviceId={originalServiceId} filterData={filterData} setShowLogin={setShowLogin} />}
      {type === 'attraction' && <AttractionDetailsInfo serviceId={originalServiceId} setShowLogin={setShowLogin} />}
      {type === 'food' && <FoodDetailsInfo serviceId={originalServiceId} setShowLogin={setShowLogin} />}
      <SlideBar type={type} />
      <PlaceReview id={originalServiceId} type={type} setShowLogin={setShowLogin} />
    </div>
  )
}

export default PlaceDetails