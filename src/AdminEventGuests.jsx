import React from 'react'
import { Link } from 'react-router-dom'
import { parseGuests, createExpert } from './coderetreat'
import LoadingEvent from './LoadingEvent'
import AdminEventNav from './AdminEventNav'
import connectEventComponent from './connectEventComponent'
import SubmittableInput from './SubmittableInput'

function AdminEventGuests(props){
  const {event_id, event, set} = props;
  return (
    <LoadingEvent event={event} forceAuth={true}>
      {() => {
        const guests = event.guests || {}
        return (
          <div>
            <h1>Участники мероприятия {event_id}</h1>
            <AdminEventNav {...props} tab='guests' />
            <Statistics guests={guests} />
            <Table guests={guests} set={set} />
            <AddExpert guests={guests} set={set} />
            <Import guests={guests} set={set}/>
          </div>
      )}}
    </LoadingEvent>
  )
}

function Statistics ({guests}) {
  const nonExperts = Object.keys(guests).filter(id => !guests[id].expert)
  const experts = Object.keys(guests).filter(id => guests[id].expert)
  const presentNonExperts = nonExperts.filter(id => guests[id].present)
  const presentExperts = experts.filter(id => guests[id].present)
  return (
    <div className='mt-3'>
      <p>Гостей присутствует {presentNonExperts.length} из {nonExperts.length}</p>
      <p>Экспертов присутствует {presentExperts.length} из {experts.length}</p>
    </div>
  )
}

function AddExpert({guests, set}) {

  function addExpert(guests, set){
    const experts = createExpert(guests || {});
    const newGuests = Object.assign(experts, guests || {});
    set('guests', newGuests);
  }

  return (
    <div className='mt-3'>
      <button className='btn btn-primary' onClick={() => addExpert(guests, set)}>Добавить эксперта</button>
    </div>)

}
function Import ({guests, set}){
  
  function importGuests (set, guests, guestsTsv) {
    const parsedGuests = parseGuests(guestsTsv)
    const newGuests = Object.assign(parsedGuests, guests)
    set('guests', newGuests)
  }
  
  const textArea = React.createRef()

  return (
    <div className='mt-3'>
      <h2>Импорт из *.tsv</h2>
      <p>
        Вставьте список участников в формате TSV (Tab separated values) и нажмите «Replace Guests». После этого можно будет генерировать сессии.
      </p>
      <div>
        <textarea
          ref={textArea}
          defaultValue='id	name	group	present	expert	table'
          cols='100'
          rows='7' />
      </div>
      <button 
        className='btn btn-primary' 
        onClick={() => importGuests(set, guests, textArea.current.value)}>
        Импортировать
      </button>
    </div>
  );
}

function Table ({guests, set}) {
  
  const setPresent = (id, present) => set('guests/' + id + '/present', present);
  const deleteGuest = (id) => set('guests/' + id, null);

  function renderGuestRow(id, guest){
    const setProp = (prop, value) => set('guests/' + id + '/' + prop, value);
    return (
      <tr key={"g-" + id}>
        <th>{id}</th>
        <th><SubmittableInput defaultValue={guest.name} set={(v) => setProp('name', v)} /></th>
        <th><SubmittableInput defaultValue={guest.group} set={(v) => setProp('group', v)} /></th>
        <td><input type='checkbox' checked={guest.present} onChange={e => setProp('present', e.target.checked)}/></td>
        <td><input type='checkbox' checked={guest.expert} onChange={e => setProp('expert', e.target.checked)}/></td>
        <th><SubmittableInput defaultValue={guest.table} set={(v) => setProp('table', v)} /></th>
        <td><button className='btn btn-sm btn-outline-danger' onClick={()=>deleteGuest(id)}>удалить</button></td>
      </tr>
    )
  }

  return (
    <div className='guests1'>
      <h1>Список участников</h1>
      {guests && (
        <table className='table table-sm'>
        <thead>
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
            <th>
              Present
            </th>
            <th>
              Expert
            </th>
            <th>
              Table
            </th>
            <th>
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          {Object.keys(guests).map(id => renderGuestRow(id, guests[id]))}
          </tbody>
        </table>
        )}
    </div>)
}

export default connectEventComponent(AdminEventGuests)