import React from 'react'

export default class SubmittableInput extends React.Component{
  constructor(props){
    super(props)
    this.label = props.label
    this.placeholder = props.placeholder
    this.defaultValue=props.defaultValue
    this.set = props.set
    this.className = props.className
    this.state = {changed:false, value:this.defaultValue}
    this.id = Math.floor(Math.random()*100000000)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }
  handleChange(event){
    const value = event.target.value
    this.setState({value: value, changed: true})
  }

  handleClick(ev){
    this.set(this.state.value)
    this.setState({changed: false})
  }
  
  render(){
    const btnClass = this.state.changed ? 'btn-primary' : 'btn-light disabled'
    return (
      <div className={'input-group ' + (this.props.className || '')}>
        {this.label && <span className='input-group-prepend input-group-text' htmlFor={this.id}>{this.label}</span>}
        <input 
          id={this.id}
          type="text" 
          className="form-control" 
          placeholder={this.placeholder}
          value={this.state.value}
          onChange={this.handleChange}
          />
          {this.state.changed && <div className='input-group-append'>
            <button className='btn btn-primary' onClick={this.handleClick}>Сохранить</button>
          </div>}
      </div>
    )
  }
}
