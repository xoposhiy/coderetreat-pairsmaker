import React from 'react'
import { Link } from 'react-router-dom'
export default function AdminEventNav ({tab, event_id}) {
  return (
        <nav className="nav nav-tabs">
          <Link to={'/admin/'+event_id}
            className={"nav-link" + (tab == 'common' ? ' active' : '')}>Общие</Link>
          <Link to={'/adminguests/'+event_id}
            className={"nav-link" + (tab == 'guests' ? ' active' : '')}>Участники</Link>
          <Link to={'/adminsessions/'+event_id}
            className={"nav-link" + (tab == 'sessions' ? ' active' : '')}>Сессии</Link>
        </nav>
    )
}
