import React from 'react'

export default function Checkbox(props) {
  const {label, value, set, children} = props
  const id = Math.floor(Math.random()*100000000);
  return (
    <div className={'form-check ' + props.className}>
      <input id={id} type='checkbox' className='form-check-input'
        defaultChecked={value}
        onChange={(e) => set(e.target.checked)}
        />
      {label && <label htmlFor={id} className='form-check-label'>{label}</label>}
      {children && <small className='form-text text-muted'>{children}</small>}
    </div>
  )
}

