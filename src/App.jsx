import React from 'react';
import { Switch, Route } from 'react-router-dom';
import EventsList from './EventsList';
import Event from './Event';
import AdminEventCommon from './AdminEventCommon';
import AdminEventGuests from './AdminEventGuests';
import AdminEventSessions from './AdminEventSessions';

const App = () => (
  <Switch>
    <Route exact path='/' component={EventsList} />
    <Route exact path='/event/:event_id' component={Event} />
    <Route exact path='/adminsessions/:event_id' component={AdminEventSessions} />
    <Route exact path='/admin/:event_id' component={AdminEventCommon} />
    <Route exact path='/adminguests/:event_id' component={AdminEventGuests} />
  </Switch>
);



export default App;