import './PlaceDetails.css'
import PlaceDetailsInfo from '../../components/PlaceDetailsInfo/PlaceDetailsInfo'
import PlaceReview from '../../components/PlaceReview/PlaceReview'
import SlideBar from '../../components/SlideBar/SlideBar'
const PlaceDetails = () => {
  return (
    <div className='place-details'>
      <PlaceDetailsInfo />
      <SlideBar />
      <PlaceReview />
    </div>
  )
}

export default PlaceDetails