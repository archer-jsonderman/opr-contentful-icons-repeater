import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import update from 'immutability-helper';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import './index.css'; 


	

export default class Overview extends React.Component {
	changeHandler=(value, content)=>{
		console.log(value)
		this.props.handleRTEChange(value,'overview','content');
	}
	render(){

		return(
			<div className="overview">
			<label className="FormLabel__FormLabel___3d6zQ" data-test-id="cf-ui-form-label" htmlFor="overview-heading">Headline</label>
				<ReactQuill 
			  		name="overview-heading" 
			  		value={this.props.overview.fields.headline||''}
			  		onChange={()=>this.changeHandler}  
			  		modules={this.props.modulesBubble}
			  		theme="bubble"
		  		/>
			  	<label className="FormLabel__FormLabel___3d6zQ" data-test-id="cf-ui-form-label" htmlFor="overview-content">Introduction</label>
			  	<ReactQuill 
			  		name="overview-content" 
			  		value={this.props.overview.fields.content||''}
			  		onChange={this.changeHandler}  
			  		modules={this.props.modules}
		  		/>
		  	</div>

		)
	}
}
