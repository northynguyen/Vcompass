import React from 'react'
import './PlaceDetails.css'
import PlaceDetailsInfo from '../../components/PlaceDetailsInfo/PlaceDetailsInfo'
import Header from '../../components/Header/Header'
import PlaceReview from '../../components/PlaceReview/PlaceReview'

const PlaceDetails = () => {
  return (
    <div className='place-details'> 
        <Header />
        <PlaceDetailsInfo />
        <PlaceReview />
    </div>
  )
}

export default PlaceDetails