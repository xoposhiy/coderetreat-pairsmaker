import React from 'react';
import { connect } from 'react-firebase';
import { Link } from 'react-router-dom';
import { RiseLoader } from 'react-spinners'
import firebase from 'firebase'
import auth from './auth'

function createEvent (user, eventName){
  return {
    owners: {[user.uid]: user.displayName},
    created: new Date().toString(),
    id: eventName,
    currentSessionIndex: 0,
    guests: {},
    sessions: []
  };
}

function formatDate(d){
  let res = d.getFullYear() + "";
  if (d.getMonth()+1 < 10) res +="0";
  res += d.getMonth()+1;
  if (d.getDate() < 10) res +="0";
  res += d.getDate();
  return res;
}

function deleteEvent(id, updateEvent){
  auth().then(() => updateEvent(id, {})).catch(e => console.log(e))
}

function renderEvent(id, e, currentUser, updateEvent){
  return (
    <li key={id}>
      <Link className="btn btn-sm" to={"/event/"+id} title={e.created}>{id}</Link>
      {
        e.owners && currentUser && e.owners[currentUser.uid] && (
          <span>
            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteEvent(id, updateEvent)}>удалить</button>
            <Link className="btn btn-sm btn-outline-warrning" to={"/admin/"+id}>редактировать</Link>
          </span>
        )
      }
    </li>)
}

const EventsList = ({events, updateEvent}) => {

  const eventNameInput = React.createRef()
  
  function insertNewEvent(updateEvent){
    auth().then(user => {
      const event = createEvent(user, eventNameInput.current.value)
      updateEvent(event.id, event).catch(e => console.log(e))
    })
  }


  const currentUser = firebase.auth().currentUser;
  const now = new Date();
  const nextEventName = formatDate(now);
  return (
    <div>
      <h1 className="mb-3">Мероприятия</h1>
      {
        !currentUser ? <a href="#" onClick={auth}>Войти</a> 
        : ( 
        <div className="input-group mb-3">
          <input ref={eventNameInput} type="text" className="form-control" defaultValue={nextEventName}/>
          <div className="input-group-append">
            <button className="btn btn-sm btn-primary" onClick={() => insertNewEvent(updateEvent)}>Создать</button>
          </div>
        </div>
        )
        }
      { events ? (
      <ul>
          {
            Object.keys(events).map(e=>renderEvent(e, events[e], currentUser, updateEvent))
          }
      </ul>) : <div className="loader"><RiseLoader /></div>
      }
  </div>)
};

export default connect((props, ref) => ({ 
    events: '/',
    updateEvent: (id, event) => ref(id).set(event)
  }))(EventsList)