import './PlaceDetails.css'
import PlaceReview from '../../components/PlaceReview/PlaceReview'
import SlideBar from '../../components/SlideBar/SlideBar'
import HotelDetailsInfo from '../../components/HotelDetailsInfo/HotelDetailsInfo'
import FoodDetailsInfo from '../../components/FoodDetailsInfo/FoodDetailsInfo'
import AttractionDetailsInfo from '../../components/AttractionDetailsInfo/AttractionDetailsInfo'
const PlaceDetails = () => {
  return (
    <div className='place-details'>
      {/* if .... thì mình sẽ gửi hotel/food/attraction phù hợp, tương tự như slideBar và placeReview */}
      {/* <HotelDetailsInfo /> */}
      {/* <FoodDetailsInfo /> */}
      <AttractionDetailsInfo />
      <SlideBar />
      <PlaceReview />
    </div>
  )
}

export default PlaceDetails