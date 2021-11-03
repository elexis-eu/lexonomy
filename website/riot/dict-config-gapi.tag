<dict-config-gapi>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div class="row">
		<div class="row">
			<div class="input-field col s6">
				<select id="img_licence">
					<option value='any' selected>any licence</option><option value='comm'>permits commercial use</option><option value='der'>permits derivative works</option><option value='code'>permits commercial and derivative use</option><option value='public'>public domain</option>
				</select>
				<label>Image licence</label>
				<span class="helper-text">Select licence type when searching for images.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<input type="text" id="gapi_key" value={ this.configData.apikey }/>
				<label>Google Custom Search API key</label>
				<span class="helper-text">Insert your Google Custom Search API key to allow multimedia search.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<input type="text" id="gapi_cx" value={ this.configData.cx }/>
				<label>Google Custom Search ID</label>
				<span class="helper-text">Insert ID of your Custom Search - see <a href='https://developers.google.com/custom-search/v1/introduction'>documentation</a>.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<input type="text" id="pixabay_key" value={ this.configData.pixabaykey }/>
				<label>Pixabay API key</label>
				<span class="helper-text">Insert your <a href='https://pixabay.com/api/docs/'>Pixabay API key</a>.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<input type="text" id="voice_key" value={ this.configData.voicekey }/>
				<label>VoiceRSS API key</label>
				<span class="helper-text">Insert your <a href='http://www.voicerss.org/api/'>VoiceRSS</a> API key to enable text-to-speech.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<select id="voice_lang">
					<option value=''>.</option><option value='ar-eg'>Arabic (Egypt)</option><option value='ar-sa'>Arabic (Saudi Arabia)</option><option value='bg-bg'>Bulgarian</option><option value='ca-es'>Catalan</option><option value='zh-cn'>Chinese (China)</option><option value='zh-hk'>Chinese (Hong Kong)</option><option value='zh-tw'>Chinese (Taiwan)</option><option value='hr-hr'>Croatian</option><option value='cs-cz'>Czech</option><option value='da-dk'>Danish</option><option value='nl-be'>Dutch (Belgium)</option><option value='nl-nl'>Dutch (Netherlands)</option><option value='en-au'>English (Australia)</option><option value='en-ca'>English (Canada)</option><option value='en-gb'>English (Great Britain)</option><option value='en-in'>English (India)</option><option value='en-ie'>English (Ireland)</option><option value='en-us'>English (United States)</option><option value='fi-fi'>Finnish</option><option value='fr-ca'>French (Canada)</option><option value='fr-fr'>French (France)</option><option value='fr-ch'>French (Switzerland)</option><option value='de-at'>German (Austria)</option><option value='de-de'>German (Germany)</option><option value='de-ch'>German (Switzerland)</option><option value='el-gr'>Greek</option><option value='he-il'>Hebrew</option><option value='hi-in'>Hindi</option><option value='hu-hu'>Hungarian</option><option value='id-id'>Indonesian</option><option value='it-it'>Italian</option><option value='ja-jp'>Japanese</option><option value='ko-kr'>Korean</option><option value='ms-my'>Malay</option><option value='nb-no'>Norwegian</option><option value='pl-pl'>Polish</option><option value='pt-br'>Portuguese (Brazil)</option><option value='pt-pt'>Portuguese (Portugal)</option><option value='ro-ro'>Romanian</option><option value='ru-ru'>Russian</option><option value='sk-sk'>Slovak</option><option value='sl-si'>Slovenian</option><option value='es-mx'>Spanish (Mexico)</option><option value='es-es'>Spanish (Spain)</option><option value='sv-se'>Swedish</option><option value='ta-in'>Tamil</option><option value='th-th'>Thai</option><option value='tr-tr'>Turkish</option><option value='vi-vn'>Vietnamese</option>
				</select>
				<label>VoiceRSS language</label>
			</div>
		</div>
		<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
		</button>
		<hr/>
		<div class="row">
			<h5>Auto download images to each entry</h5>
		</div>
		<div class="row">
			<div class="col s10">
				<p>If you want to add images to each entry automatically, Lexonomy can do that for you. First, go to Entry structure and add element with content type <i>media</i>. When you're ready, select element and number of images you want to add.</p>
			</div>
		</div>
		<div class="row">
			<div class="col s4 input-field">
				<select id="add_element">
				</select>
				<label>Image element to add</label>
			</div>
			<div class="col s2 input-field">
				<input type="number" id="add_number" value="3"/>
				<label>Add X images</label>
			</div>
			<div class="col s3 input-field">
				<button class="btn waves-effect waves-light" id="addimages" onclick={ addImages } data-bgjob="">Add images</button>
			</div>
		</div>
		<div class="row">
			<div class="col s10">
				<p id="addinfo" style="display:none">...</p>
			</div>
		</div>
	</div>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Multimedia API', 
			configData: {},

			addImages() {
				var addElem = $("#add_element").val();
				var addNumber = $("#add_number").val();
				if (addElem != "" && parseInt(addNumber) > 0) {
					$('#addinfo').show();
					$("#addinfo").html("Adding images to dictionary, please wait...");
					$.post("/" + this.dictId + "/autoimage.json", {"addElem": addElem, "addNumber": addNumber}, (response) => {
						$("#addimages").data("bgjob", response.bgjob);
					});
					this.waitImages(this.dictId);
				}
			},

			waitImages(dictId) {
				var imageTimer = setInterval(checkImages, 1000);
				function checkImages() {
					var jobid = $("#addimages").data("bgjob");
					if (jobid != "") {
						$.get("/" + dictId + "/autoimageprogress.json", {"jobid": jobid}, (response) => {
							if (response.status == "finished") {
								clearInterval(imageTimer);
								$("#addinfo").show();
								$("#addinfo").html("Dictionary now contains automatically added images. <a href='#"+dictId+"/edit'>See results.</a>");
							} else if (response.status == "failed") {
								$("#addinfo").show();
								clearInterval(imageTimer);
								$("#addinfo").html("Adding images failed :(");
							}
						});
					}
				}
			},

			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				console.log(this.props);
				M.updateTextFields();
				$('select').formSelect();
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					console.log(this.configData)
					this.update();
					if (this.configData.image_licence) {
						$('#img_licence').val(this.configData.image_licence);
					}
					$('#voice_lang').val(this.configData.voicelang);
					M.updateTextFields();
					$('select').formSelect();
				});
			},

			onUpdated() {
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
					if ($('#add_element option').length == 0) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							if (info.filling == "med") {
								$('#add_element').append('<option value="' + key + '">' + key + '</option>');
							}
						});
					}
					$('select').formSelect();
				}
			},

			getConfigData() {
				var newData = {
					image_licence: $('#img_licence').val(),
					apikey: $('#gapi_key').val(),
					cx: $('#gapi_cx').val(),
					pixabaykey: $('#pixabay_key').val(),
					voicekey: $('#voice_key').val(),
					voicelang: $('#voice_lang').val()
				};
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-gapi>
