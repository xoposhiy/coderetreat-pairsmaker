import React from 'react'
import { connect } from 'react-firebase'
import { Link } from 'react-router-dom'
import LoadingEvent from './LoadingEvent'
import connectEventComponent from './connectEventComponent'

const DistributionByGuestId = ({event, event_id}) => {
  const items = []
  let unknownGuests = [];
  if (event.sessions && event.sessions.length > event.currentSessionIndex) {
    const sessions = event.sessions.slice(0, event.currentSessionIndex + 1)
    const guests = event.guests
    const pairs = event.sessions[event.currentSessionIndex]
    const comparer = (a, b) => event.showGuestsByName ? (guests[a].name || '').localeCompare(guests[b].name || '') : a-b;
    const guestIds = Object.keys(pairs).sort(comparer);
    for (let guestId of guestIds) {
      if (!guests[guestId]){
        unknownGuests.push(guestId)
        continue
      }
      if (guests[guestId].expert && !event.showExperts) continue
      const pairId = pairs[guestId].pairId
      const p = guests[pairId]
      if (!p) {
        unknownGuests.push(pairId);
        continue;
      }
      const score = pairs[guestId].score
      let title = 'пара: ' + (p.expert ? 'Эксперт ' + pairId : pairId) + ' score: ' + score
      let classes = 'guest-info'
      if (p.expert && event.highlightExperts) classes += ' with-expert'
      if (pairId == guestId) classes += ' nopair'
      for(let s of sessions){
        if (!s[guestId]) continue;
        if (guests[s[guestId].pairId]){
          if (guests[s[guestId].pairId].expert && event.highlightExperts) {
            classes += ' lucky'
            break;
          }
        }
        else{
          unknownGuests.push(s[guestId].pairId);
        }
      }
      let item
      if (event.showGuestsByName)
        item = (<div key={guestId} className={classes} title={title}>
                   {guests[guestId].name || guestId} → стол {pairs[guestId].table}
                 </div>)
      else 
        item = (<div key={guestId} className={'guest-info-bynumbers ' + classes} title={title}>
                   №
                   {guestId} → стол {pairs[guestId].table}
                 </div>)
      items.push(item)
    }
  }
  return (
    <div>
      <h1>Сессия № {event.currentSessionIndex + 1} <Link to={'/admin/' + event_id} className='hidden-link'> администрирование </Link> <Link to='/' className='hidden-link'> к списку </Link></h1>
      {event.feedbackUrl && <h3>Заполни анкету <a href={event.feedbackUrl}>{event.feedbackUrl}</a></h3>}
      {unknownGuests.length > 0 && <div className='alert alert-danger' role='alert'>Неизвестные участники {unknownGuests.join(', ')}</div>}
      <div className='guests-distribution'>
        {items}
      </div>
      <div className='clearfix' />
    </div>
  )
}
function Event ({event, event_id}){
  return (
    <LoadingEvent forceAuth={false} event={event}>
      {() => (
        <DistributionByGuestId event={event} event_id={event_id}/>
      )}
    </LoadingEvent>
  )
}
export default connectEventComponent(Event)