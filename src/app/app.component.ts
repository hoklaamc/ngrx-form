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
	debugging = true;

	rfi: any;
	rForm: FormGroup;
	id: number = 1;
	request: string;
	serialNum: Observable<String>; // For ngrx
	serialNumField: string; // For html
	
	fileSubmitted: boolean = false;
	fileValid: boolean;
	
	responseReceived: boolean;
	responseSucceeded: boolean;
	
	rfiSubmitted: boolean = false;
	rfiSuccess: boolean;

	constructor(private fb: FormBuilder, private http: HttpClient, private store: Store<AppState>) {
		this.rForm = fb.group({
			'id': [this.id, Validators.required],
			'request': [null, Validators.compose([Validators.required, Validators.maxLength(300)])],
			'serialNumField': [null, Validators.required]
		});
		this.serialNum = store.select('serialNum');
	}

	updateInput(value: any) {
		this.serialNumField = value;
		if (this.debugging) {
			console.log('updateInput');
			console.log(value);
			console.log(this.serialNumField);
		}
		this.rForm.patchValue({serialNumField: value});
		this.store.dispatch({ type: UPDATE_SERIALNUM, payload: this.serialNumField });
	}

	fileEvent(fileInput: any) {
		if (this.debugging) console.log(fileInput);
		let file: File = <File>fileInput.target.files[0];
		if (this.debugging) console.log(file);
		if (file) {
			var reader: FileReader = new FileReader();
			reader.onloadend = (e) => {
				var content = (<FileReader> e.target).result;
				this.fileSubmitted = true;
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

	sendFileToCloudVision(content) {
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
		if (this.debugging) console.log(request);

		let headers = new Headers({ 'Content-Type': 'applicatoin/json'});

		this.responseReceived = false;
		this.responseSucceeded = false;

		this.http.post(
			'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCQm74K6zKe9FF_gHyL8j6KlDvxvgwve5E',
			JSON.stringify(request))
			.subscribe(data => {
				this.responseReceived = true;
				if (this.debugging) console.log(data);
				content = (<Array<Object>>data);
				if (content.responses[0].fullTextAnnotation) {
					var response = content.responses[0].fullTextAnnotation.text;
					response = response.replace(/\n/g, " ");
					if (this.debugging) console.log(response);
					this.updateInput(response);
					this.responseSucceeded = true;
				} else {
					this.responseSucceeded = false;
				}
			}, (err) => { console.log(err); });
	}

	submitRfi(rfi) {
		this.rfiSubmitted = true;
		this.rfiSuccess = true;
		this.id = rfi.id;
		this.request = rfi.request;
	}

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