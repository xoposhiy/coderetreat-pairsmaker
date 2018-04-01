import ReactDOM from 'react-dom'
import React from 'react'
import firebase from 'firebase'
import { HashRouter, Switch, Route } from 'react-router-dom'
import EventsList from './EventsList';
import Event from './Event';
import AdminEventCommon from './AdminEventCommon';
import AdminEventGuests from './AdminEventGuests';
import AdminEventSessions from './AdminEventSessions';

const config = {
  apiKey: 'AIzaSyAD98USTaFV6BOidsqgh1eqPNJFt2g-SuU',
  authDomain: 'code-reatreat.firebaseapp.com',
  databaseURL: 'https://code-reatreat.firebaseio.com',
  storageBucket: 'code-reatreat.appspot.com',
  messagingSenderId: '260899568163'
}

firebase.initializeApp(config)

const el = document.getElementById('app')

ReactDOM.render((
  <HashRouter>
    <Switch>
      <Route exact path='/' component={EventsList} />
      <Route exact path='/event/:event_id' component={Event} />
      <Route exact path='/adminsessions/:event_id' component={AdminEventSessions} />
      <Route exact path='/admin/:event_id' component={AdminEventCommon} />
      <Route exact path='/adminguests/:event_id' component={AdminEventGuests} />
    </Switch>
  </HashRouter>
  ), el)
