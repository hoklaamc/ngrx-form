import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	debugging = false;

	rForm: FormGroup;
	serialNum: string = '';
	fileSubmitted: boolean = false;
	fileValid: boolean;

	constructor(private fb: FormBuilder, private http: HttpClient) {
		this.rForm = fb.group({
			'serialNum': ['', Validators.required],
			'file': [null, null]
		});
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

		this.http.post(
			'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCQm74K6zKe9FF_gHyL8j6KlDvxvgwve5E',
			JSON.stringify(request)
			).subscribe(data => {
				if (this.debugging) console.log(data);
				content = <Array<Object>>data;
				var response = content.responses[0].fullTextAnnotation.text;
				response = response.replace(/\n/g, " ");
				if (this.debugging) console.log(response);
				this.serialNum=response;
			}, (err) => { console.log(err); });
	}
}
