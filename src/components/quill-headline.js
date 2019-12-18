import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';

let Block = Quill.import('blots/block');
class HeadingBlock extends Block { }
HeadingBlock.tagName = 'l';
Quill.register(HeadingBlock);

export default class HeadlineEditor extends React.Component{
	modules = {
		toolbar: [
			['italic', {'script':'super'}],
	      ['clean']
		    ],
	  }	
	render(){
		return(
			<ReactQuill 
	  		name="headline" 	
	  		modules={this.modules}
	  		/>
		)
	}
}