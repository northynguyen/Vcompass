import './PlaceDetails.css'
import PlaceDetailsInfo from '../../components/PlaceDetailsInfo/PlaceDetailsInfo'
import PlaceReview from '../../components/PlaceReview/PlaceReview'

const PlaceDetails = () => {
  return (
    <div className='place-details'>
      <PlaceDetailsInfo />
      <PlaceReview />
    </div>
  )
}

export default PlaceDetails