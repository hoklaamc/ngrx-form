import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { UPDATE_SERIALNUM } from './serial-num';
import { Observable } from 'rxjs/Observable';

interface AppState {
	serialNum: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
	//Your API key
	apiKey: string = ''; //Add your Google Vision API key here


	rfi: any;
	rForm: FormGroup;
	id: number = 1;
	request: string;
	serialNum: Observable<String>; // For ngrx
	serialNumField: string; //For html
	
	fileSubmitted: boolean = false;
	fileValid: boolean;
	
	responseReceived: boolean;
	responseSucceeded: boolean;
	
	rfiSubmitted: boolean = false;
	rfiSuccess: boolean;

	constructor(private fb: FormBuilder, private http: HttpClient, private store: Store<AppState>) {
		
		//Initialize form group
		this.rForm = fb.group({
			'id': [this.id, Validators.required],
			'request': [null, Validators.compose([Validators.required, Validators.maxLength(300)])],
			'serialNumField': [null, Validators.required]
		});
		
		//Initialize ngrx store
		this.serialNum = store.select('serialNum');
	}

	//Update serial number input value and ngrx store
	updateInput(value: any) {
		//Update serial number field
		this.serialNumField = value;

		//Update form group value
		this.rForm.patchValue({serialNumField: value});

		//Update ngrx store
		this.store.dispatch({ type: UPDATE_SERIALNUM, payload: this.serialNumField });
	}

	//If file is valid, convert file to a data URL
	fileEvent(fileInput: any) {
		
		//Reference file
		let file: File = <File>fileInput.target.files[0];

		//Check if file was uploaded
		if (file) {
			
			//Use filereader to read file as a data URL
			var reader: FileReader = new FileReader();
			reader.onloadend = (e) => {
				var content = (<FileReader> e.target).result;
				this.fileSubmitted = true;
				
				//Remove prefix
				if (content.includes('data:image/jpeg')) {
					this.fileValid = true;
				  this.sendFileToCloudVision(content.replace('data:image/jpeg;base64,', ''));
				} else if (content.includes('data:image/png')) {
					this.fileValid = true;
				  this.sendFileToCloudVision(content.replace('data:image/png;base64,', ''));
				} else {
					this.fileValid = false;
					console.log("File invalid");
				}
			}
			
			reader.readAsDataURL(file);
		}
	}

	//Upload file to Google Cloud Vision and handle response
	sendFileToCloudVision(content) {
		
		const VISION_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + this.apiKey;
		
		var request = {
		  requests: [{
		    image: {
		      content: content
		    },
		    features: [{
		      type: 'TEXT_DETECTION',
		      maxResults: 200
		    }]
		  }]
		};

		let headers = new Headers({ 'Content-Type': 'application/json' });

		this.responseReceived = false;
		this.responseSucceeded = false;

		//Post to Google Cloud Vision API
		this.http.post(
			VISION_URL,
			JSON.stringify(request))
			.subscribe(
				//Response received
				data => {
				this.responseReceived = true;
				
				console.log(data);

				//Reference content
				content = (<Array<Object>>data);
				
				if (content.responses[0].fullTextAnnotation) {
					
					var response = content.responses[0].fullTextAnnotation.text;
					
					//Replace new lines with spaces
					response = response.replace(/\n/g, " ");

					console.log(response);
					
					// Call updateInput to update serial number field
					this.updateInput(response);
					this.responseSucceeded = true;
				} else {
					this.responseSucceeded = false;
				}
			}, (err) => { console.log(err); });
	}

	//Submit an RFI
	submitRfi(rfi) {
		this.rfiSubmitted = true;
		this.rfiSuccess = true;
		this.id = rfi.id;
		this.request = rfi.request;
	}

	//Reset the form after submitting an RFI
	resetForm() {
		this.id++;
		this.request = '';
		this.serialNumField = null;

		this.fileSubmitted = false;
		this.fileValid = null;

		this.responseReceived = false;
		this.responseSucceeded = null;

		this.rfiSubmitted = false;
		this.rfiSuccess = null;
		this.rForm.reset({
			id: this.id
		});
	}
}