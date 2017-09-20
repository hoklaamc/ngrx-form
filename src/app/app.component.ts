import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	rForm: FormGroup;
	serialNum: string = '';

	constructor(private fb: FormBuilder, private http: HttpClient) {
		this.rForm = fb.group({
			'serialNum': ['', Validators.required],
			'file': [null, null]
		});
	}

	fileEvent(fileInput: any) {
		console.log('File event triggered');
		let file: File = <File>fileInput.target.files[0];
		console.log(file);
		var reader: FileReader = new FileReader();
		reader.onloadend = (e) => {
			var content = (<FileReader> e.target).result;
			if (content.includes('data:image/jpeg')) {
			  this.sendFileToCloudVision(content.replace('data:image/jpeg;base64,', ''));
			} else if (content.includes('data:image/png')) {
			  this.sendFileToCloudVision(content.replace('data:image/png;base64,', ''));
			}
		}
		reader.readAsDataURL(file);
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
		console.log(request);

		let headers = new Headers({ 'Content-Type': 'applicatoin/json'});

		this.http.post(
			'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCQm74K6zKe9FF_gHyL8j6KlDvxvgwve5E',
			JSON.stringify(request)
			).subscribe(data => {
				console.log(data);
				content = <Array<Object>>data;
				var response = content.responses[0].fullTextAnnotation.text;
				response = response.replace(/\n/g, " ");
				console.log(response);
				this.serialNum=response;
			}, (err) => { console.log(err); });
	}
}
