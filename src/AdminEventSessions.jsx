import React from 'react'
import { Link } from 'react-router-dom'
import { parseGuests, generateExperts, generateNextSession, getGuestScore} from './coderetreat'
import LoadingEvent from './LoadingEvent'
import AdminEventNav from './AdminEventNav'
import connectEventComponent from './connectEventComponent'


function AdminEventSessions(props){
  const {event_id, event, set} = props;
  return (
    <LoadingEvent event={event} forceAuth={true}>
      {() => (
        <div>
          <h1>Сессии мероприятия {event_id}</h1>
          <AdminEventNav {...props} tab='sessions' />
          <Session {...props}/>
          <History {...props}/>
        </div>
      )}
    </LoadingEvent>
  )
}

function Session ({event_id, event, set}){
  const curSession = event.currentSessionIndex
  let sessionsCount = 0
  if (event.sessions)
    sessionsCount = event.sessions.length
  const presentGuestsCount = Object.keys(event.guests || {}).filter(id => event.guests[id].present).length
  const canGenerate = presentGuestsCount % 2 == 0
  return (
    <div className='mt-4'>
      <p>Присутствует участников: {presentGuestsCount}</p>
      <Link to={'/event/' + event_id}>Рассадка</Link>
      <div className='btn-group-toggle' data-toggle='buttons'>
        <span>Текущая сессия: </span>

        {event.sessions && event.sessions.map(
            (s, i) => (
                <button 
                    key={i} 
                    className={"btn " + ((curSession==i)? "btn-primary active" : "")} 
                    onClick={() => set('currentSessionIndex', i)}>
                    {i}
                </button>))}
        
        <button className={'admin-sessions-create btn btn-success' + (canGenerate ? '' : ' disabled')} disabled={!canGenerate} onClick={() => set('sessions/'+sessionsCount, generateNextSession(event.guests || {}, event.sessions || []))}>
          Сгенерировать новую сессию
        </button>
        <button className='admin-sessions-remove-last btn btn-danger' onClick={() => set('sessions/'+(sessionsCount-1), {})}>
          Удалить последнюю сессию
        </button>
      </div>
    </div>
  )
}

const History = ({event}) => {
  function renderGuest (guestId) {
    function renderPair (pairId, index) {
      const pair = event.guests[pairId] || {}
      let classes = pair.expert ? 'with-expert' : ''
      if (pair.group == event.guests[guestId].group && event.guests[guestId].group != undefined)
        classes += ' same-group'
      return (
        <td key={'guest-' + guestId + '-' + index} className={classes}>
          {pairId}
        </td>
      )
    }

    return (
      <tr key={'guest-' + guestId}>
        <th>
          {guestId}
        </th>
        <th>
          {event.guests[guestId].name}
        </th>
        <th>
          {event.guests[guestId].group}
        </th>
        {event.sessions.map((s, i) => s[guestId] ? renderPair(s[guestId].pairId, i) : <td>
                                                                                        —
                                                                                      </td>)}
        <td>
          {getGuestScore(guestId, event.sessions, event.guests)}
        </td>
      </tr>
    )
  }
  return (
    <div className='mt-5'>
      <h1>История</h1>
      {event.sessions && (
        <table className='table table-striped table-sm'>
          <tr>
            <th>
              Id
            </th>
            <th>
              Name
            </th>
            <th>
              Group
            </th>
            {event.sessions.map((s, i) => <th key={'session' + i}>{i + 1}</th>)}
            <th>
              Score
            </th>
          </tr>
          {Object.keys(event.guests).map(renderGuest)}
        </table>)}
    </div>)
}

export default connectEventComponent(AdminEventSessions)