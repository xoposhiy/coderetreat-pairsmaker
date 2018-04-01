import React from 'react'
import { RiseLoader } from 'react-spinners'
import auth from './auth'
import PropTypes from 'prop-types';

LoadingEvent.propTypes = {
  event: PropTypes.object,
  forceAuth: PropTypes.bool,
  children: PropTypes.func.isRequired,
}

export default function LoadingEvent({event, forceAuth, children}){
  if (!event){
    return (
      <div className='loader'>
        <RiseLoader />
      </div>)
  }
  if (forceAuth) auth(); //.then(user => show user in UI)
  return (<div>{children()}</div>)
}
