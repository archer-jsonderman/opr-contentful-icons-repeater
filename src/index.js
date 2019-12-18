import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import { init } from 'contentful-ui-extensions-sdk';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import update from 'immutability-helper';
import arrayMove from 'array-move';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import {
	CardDragHandle,
	EntryCard, 
	ModalConfirm,
	Button,
	Form,
	TextInput,
	Textarea,
	TextField,
	Icon } from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import Overview from './components/section-overview/index';
import './index.css'; 

let Block = Quill.import('blots/block');
class TextBlock extends Block { }
TextBlock.tagName = 'l';
Quill.register(TextBlock);

//Cap # of entires based on install param
//for grid, set Sortable List axis to xy. need to have different CSS to resize the areas
 //truncate P content after xx numbver of words/characters
const DragHandle = SortableHandle(() => {
	return(
		<div className="CardDragHandle__CardDragHandle___2rqnO">
			<svg data-test-id="cf-ui-icon" 
				className="Icon__Icon___38Epv Icon__Icon--small___1yGZK Icon__Icon--muted___3egnD" 
				xmlns="http://www.w3.org/2000/svg" 
				width="24" 
				height="24" 
				viewBox="0 0 24 24"
			>
				<path 
					fill="none" 
					d="M0 0h24v24H0V0z">
				</path>
				<path 
					d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
				</path>
			</svg>
		</div>
	)
});

const SortableItem = SortableElement((props) => {
	return (

		<div className="Item" >
			<DragHandle/>
			<div>
				<h3 dangerouslySetInnerHTML={{ __html:props.child.fields.headline}}/>
				<p dangerouslySetInnerHTML={{ __html:props.child.fields.content}}/>
			</div>

			<div className="buttonArea">
				<button onClick={()=>props.onChildEdit(props)}
				type="button"
					className="editButton">
					<Icon icon="Edit"/>

				</button>
					
			    <button onClick={()=>props.onChildRemove(props)}
			    	className="removeButton">
			    	<Icon icon="Close"/>
				</button>
			</div>				
		</div>

	)
});
//add items length check. if it matches, hide add button. 
const SortableList = SortableContainer((props) => {

	return (
		<div className="sortableList">
		  {props.items.map((item, index) => (
			    <SortableItem
			    	key={item.id} 	 
			    	index={index} 
			    	value={item} 
			    	onChildEdit={props.onEdit}
			    	onChildRemove={props.onRemove}
			    	id={item.id}
			    	childIndex={index}
			    	child={item}
			    	/>
			    )   	
		  )}
		  <Button 
		      buttonType="naked" 
		      isFullWidth={true} 
		      icon="Plus" 
		      id="add-new-item"
		      onClick={props.onAddItem}
			  />
	</div>
	);
});



export default class MainContent extends React.Component {
	static propTypes = {
		sdk: PropTypes.object.isRequired
	};
	constructor(props) {
		super(props);
		this.handleRTEchange = this.handleRTEchange.bind(this);
		this.handleRemoveModal = this.handleRemoveModal.bind(this)
		this.clearAndSave = this.clearAndSave.bind(this);
		this.state=this.props.sdk.field.getValue();

			
	}
	componentWillMount(){
	  this.props.sdk.window.updateHeight();
	  this.props.sdk.window.startAutoResizer();
	}
	
	onSortEnd = ({oldIndex, newIndex}) => {	  
		this.setState(({items}) => ({
	      items: arrayMove(items, oldIndex, newIndex),
	    }))
		this.props.sdk.field.setValue(this.state);
	};
  
  	handleAddItem=()=>{
		const {items} = this.state;//destructure, pull items object out
		const newId = 'item-'+[...Array(5)].map(_=>(Math.random()*36|0).toString(36)).join('');
		const newObj = {"id":newId	,"fields":{"content":"","headline":"..."}}
		const AddState = [...items, newObj]//add new item to items object
		this.setState({items:AddState},this.handleEditModal({id:newObj.id, childIndex:(items.length), child:newObj}));

  	}
  	handleEdit=(props)=>{
	  	const {fieldChange,items, target} = {...this.state}
  		const updateTarget = update(
  			this.state,
  			{
		  		modal:{
			  		shown:{$set:false},
			  		},
		  		items:{
			  		[props.index]:
			  		{fields:
				  		{
				  		content:{$set:target.fields.content},
				  		headline:{$set:target.fields.headline}
				  		}
				  	}
		  		}
	  		})
  		this.setState(updateTarget,()=>{this.clearAndSave(true)})
	}
	//TODO: combine this and handleRemoveModal, since both are just setting states
	handleEditModal=(props)=>{
		console.log(props)
		const modalSet = update(
			this.state,{
				modal:{
				  	shown:{$set:true},
				  	type:{$set:'edit'},
				  	title: {$set:"Edit Entry"},
				  	intent:{$set:"primary"},
				  	confirm:{$set:"Change Entry"},
			  	
			  	},
				target:{
					index:{$set:props.childIndex},
					id:{$set:props.id},
					fields:{
						headline:{$set:props.child.fields.headline},
						content:{$set:props.child.fields.content}
					}
				}
			
		  	}
		  	)
		  	this.setState({...modalSet})
		  	
	}
	handleRemoveModal=(props)=>{
	  	const modalSet = update(
		  	this.state,{
			  	modal:{
				  	shown:{$set:true},
				  	type:{$set:'delete'},
				  	title: {$set:"Confirm Entry Removal"},
				  	intent:{$set:"negative"},
				  	confirm:{$set:"Confirm Entry Removal"},
				  	}, 
			  	target:{
				  	index:{$set:props.childIndex},
				  	id:{$set:''},
				  	fields:{
					  	content:{$set:''},
					  	headline:{$set:''}
					  	}
				  	}
				 }
	
		  	)

	  	this.setState({...modalSet})
	}	

	handleFieldChange(event){
		const {name, value} = event.target
		const updates = update(this.state,{
			target:{
				fields:{
					[name]:{$set:value}
				}
			}
		})
		this.setState(updates)
	}
	handleRTEchange(value, parent, field){
		console.log(parent+' parent')
		let target = {...this.state.target}

		const changed = update(this.state,{
			[parent]:{
				fields:{
					[field]:{
						$set:value
					}
				}
			}
		})
		this.setState(changed);
	}
	
    handleRemove=(props)=>{
	  	const removal = update(this.state,{
	  		items:{$splice:[[props.index,1]]}	
	  		} )
	  	this.setState(removal,()=>{this.clearAndSave(true)})
	  	 	
  	}
  	
  	onConfirm(props){
	  	if(this.state.modal.type==="delete"){
		  	this.handleRemove(props)
	  	}else{
		  	this.handleEdit(props)
	  	}
  	}
  	clearAndSave(save){
	  	const clear = update(this.state,{
		  	modal:{shown:{$set:false}},
		  	target:{
			  	id:{$set:''},
			  	index:{$set:''},
			  	fields:{
				  	content:{$set:''},
				  	headline:{$set:''}
			  	}}
	  	})
	  	this.setState(clear)
	  	if(save===true)this.props.sdk.field.setValue(this.state)
  	}
  	//prefill each with the base tag... H3, P, etc
  	renderSwitch(param) {
	  switch(param) {
	    case 'edit':
	  		return(
		  		<Form onSubmit={this.onHandleEdit}>
			  		<ReactQuill 
			  		name="headline" 
			  		className="value-item item-heading"
			  		value={this.state.target.fields.headline||''}
			  		defaultValue={'<h3></h3>'}
			  		onChange={(value)=>this.handleRTEchange(value,'target','headline')} 
			  		modules={this.modulesBubble}
			  		theme="bubble"
			  		/>
			  		
			  		<ReactQuill 
			  		name="content" 
			  		className="value-item item-content"
			  		value={this.state.target.fields.content||''}
			  		defaultValue={'<p></p>'}
			  		onChange={(value)=>this.handleRTEchange(value,'target','content')} 
			  		modules={this.modulesBubble}
			  		theme="bubble"
			  		/>
			  		
		  		</Form>
		  		)
		break;
		case 'delete':
			return 'You are about to delete this entry.'
		break;
		default:
		break;	  
		}
	}
	modulesBubble = {
		toolbar: [
			['bold', 'italic', {'script':'super'}],
			['clean']
		    ]
    }
	 modules = {
		toolbar: [
			['bold', 'italic', {'script':'super'}],
			[{'list': 'ordered'}, {'list': 'bullet'}],
			['clean']
		    ]
	}
  	render() {
	    return (
		    <>
		    <Overview
		    	modulesBubble={this.modulesBubble}
		    	modules={this.modules}
		    	handleRTEChange = {()=>this.handleRTEChange}
		    	overview = {this.state.overview}
	    	/>
		    <SortableList 
			    items={this.state.items} 
			    onSortEnd={this.onSortEnd} 
			    onAddItem={this.handleAddItem}
			    onEdit = {this.handleEditModal}
			    onRemove = {this.handleRemoveModal}
		    /> 
		    
		    <ModalConfirm
		        isShown={this.state.modal.shown||false}
		        size="large"
		        title={this.state.modal.title||"Modal"}
		        intent={this.state.modal.intent||"positive"}
		        confirmLabel={this.state.modal.confirm||"Confirm"}
		        cancelLabel="Cancel" 										
		        onCancel={()=>{
			        this.clearAndSave(false)
			        }
		        }
		        onConfirm={() => {	
					this.onConfirm(this.state.target)
		        }}
		      >
      	        {this.renderSwitch(this.state.modal.type)}
      	        {this.props.children}
	      </ModalConfirm>
		 
	      </>
		);
	  }
}
init(sdk => {render(<MainContent sdk={sdk} />, document.getElementById('root'));});
