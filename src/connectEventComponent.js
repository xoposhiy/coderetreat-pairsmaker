import React from 'react'
import firebase from 'firebase'
import { connect } from 'react-firebase'
import auth from './auth'

export default function connectEventComponent(Component){
  
  return function ConnectedAdminEventCommon({match}){
    const event_id = match.params.event_id
    const Connected = connect((props, ref) => ({
      event: event_id,
      auth: auth,
      set: (path, value) => ref(event_id + '/' + path).set(value),
    }))(Component)
  
    return <Connected event_id={event_id} />
  }
}
