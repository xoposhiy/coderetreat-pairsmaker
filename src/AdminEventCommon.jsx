import React from 'react'
import { Link } from 'react-router-dom'
import AdminEventNav from './AdminEventNav'
import connectEventComponent from './connectEventComponent'
import LoadingEvent from './LoadingEvent'
import Checkbox from './Checkbox'
import SubmittableInput from './SubmittableInput'

function AdminEventCommon({event_id, event, set}) {
  return (
    <LoadingEvent event={event} forceAuth={true}>
      {() => (
        <div>
        <h1>Настройка мероприятия {event_id}</h1>
        <AdminEventNav event_id={event_id} tab='common' />
        <nav className='nav flex-column mb-3'>
          <Link className='nav-link' to={'/event/' + event_id}>Рассадка</Link>
          <Link className='nav-link' to='/'>Список мероприятий</Link>
        </nav>
        <div className="card">
          <div className="card-body">
            <form>
              <SubmittableInput
                className='mb-3'
                label='Ссылка на анкету обратной связи'
                placeholder='https://'
                defaultValue={event.feedbackUrl}
                set={v => set('feedbackUrl', v)}
              />
              <Checkbox 
                className='mb-3'
                label='Выделять пары с экспертами на рассадке' 
                value={event.highlightExperts} 
                set={v => set('highlightExperts', v)}>
                При включенной опции, на рассадке будут выделяться пары с экспертами, а также участники, которые уже были в паре с экспертами. 
                Удобно, для мониторинга кто сколько раз уже побывал с экспертом.
              </Checkbox>
              <Checkbox 
                className='mb-3'
                label='Показывать в рассадке экспертов' 
                value={event.showExperts} 
                set={v => set('showExperts', v)}>
                  Как правило удобнее выключить эту опцию, эксперты автоматически садяться за присвоенные им столы, 
                  поэтому рассадка им не нужна.
              </Checkbox>
              <Checkbox 
                className='mb-3'
                label='Идентифицировать участников именами, а не номерами' 
                value={event.showGuestsByName} 
                set={v => set('showGuestsByName', v)}>
                  Если участников не много, до 30 человек, а на регистрации собрали имена, то можно включить эту опцию, 
                  без необходимости присваивать участникам номера.
              </Checkbox>
            </form>
          </div>
        </div>
      </div>
      )}
    </LoadingEvent>
  )
}

export default connectEventComponent(AdminEventCommon)