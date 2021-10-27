<dict-config-links>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
		<div class="row">
			<h4>Manual linking between entries</h4>
			<p>Elements listed here can be used as target of cross-reference link. For each element, specify unique identifier in the form of placeholders <tt>'%(element)'</tt>. Eg. element <tt>entry</tt> can have identifier <tt>%(lemma)-%(pos)</tt>, element <tt>sense</tt> can have identifier <tt>%(lemma)-%(number)</tt>. Optionally, specify element you want to show as preview when selecting links.</p>
		</div>
		<div class="row element-info" each={ element in this.configData.elements } data-element={ element.linkElement }>
			<div class="col s2">
				<p><strong>{ element.linkElement }</strong></p>
			</div>
			<div class="input-field col s3">
				<input type="text" value={ element.identifier } placeholder="" id="identifier_{element.linkElement}" class="identifier"/>
				<label for="identifier_{element.linkElement}">Identifier</label>
			</div>
			<div class="input-field col s3">
				<input type="text" value={ element.preview } placeholder="" id="preview_{element.linkElement}" class="preview"/>
				<label for="preview_{element.linkElement}">Preview</label>
			</div>
			<div class="col s1">
				<a class="btn-floating delete-el" data-element={ element.linkElement } onclick={ doDeleteEl }><i class="material-icons">delete</i></a>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<select id="new-element">
				</select>
				<label for="new-element">Linking element</label>
			</div>
			<div class="col s1">
				<a class="btn-floating add-el" onclick={ doAddEl }><i class="material-icons">add</i></a>
			</div>
		</div>
		<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
		</button>
		<div class="row">
			<h4>Automatic linking using NAISC</h4>
		</div>
		<div class="row">
			<div class="col s5 input-field">
				<input type="text" id="otherdict" oninput={ checkOtherDict }/>
				<label for="otherdict">Other dictionary code</label>
			</div>
			<div class="col s3 input-field">
				<button class="btn waves-effect waves-light" id="naisc_link" onclick={ startLinking } data-bgjob="" disabled>Checking status, wait...</button>
			</div>
		</div>
	</div>
	<style>
		.delete-el, .add-el {
			float: right;
		}
	</style>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Linking', 
			configData: {elements:[]},
		
			doDeleteEl(event) {
				var el = event.target.parentNode.getAttribute('data-element');
				this.configData.elements = this.configData.elements.filter(val => val.linkElement != el);
				this.update()

			},

			doAddEl(event) {
				if ($('#new-element').val() != '') {
					this.configData.elements.push({linkElement: $('#new-element').val()});
					this.update();
				}
			},

			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				M.updateTextFields();
				console.log(this.props);

				//check NAISC status
				$.get("/" + this.dictId + "/linking.json", (response) => {
					if (response.bgjob != -1) {
						$("#naisc_link").html("Linking to '" + response.otherdictID + "' already in progress, please wait...");
					} else {
						$("#naisc_link").html("Start linking");
					}
				});
			},

			onUpdated() {
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
					if ($('#new-element option').length == 0) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							$('#new-element').append('<option value="' + key + '">' + key + '</option>');
						});
					}
					$('select').formSelect();
					M.updateTextFields();
				}
			},

			checkOtherDict() {
				$("#naisc_link").prop("disabled", $("#otherdict").val().length == 0);
			},

			startLinking() {
				var otherdict = $("#otherdict").val();
				$("#naisc_link").html("Initiating linking ...");
				$("#naisc_link").prop("disabled", true);
				$.get("/" + this.dictId + "/linknaisc.json", {"otherdictID": otherdict}).done(function(data) {
					$("#naisc_link").html("Linking in progress, please wait...");
					$("#naisc_link").data("bgjob", data["bgjob"]);
				});
				this.waitForLinking(otherdict, this.dictId);
			},

			waitForLinking(otherdict, dictId) {
				var naiscTimer = setInterval(checkNaisc, 1000);
				function checkNaisc() {
					var jobid = $("#naisc_link").data("bgjob");
					if (jobid != "") {
						$.get("/" + dictId + "/naiscprogress.json", {"otherdictID": otherdict, "jobid": jobid}).done(function(data) {
							if (data["status"] == "finished") {
								clearInterval(naiscTimer);
								$("#naisc_link").html("Linking done. <a href='#/" + this.dictId + "/links'>See results.</a>");
								$("#naisc_link").data("bgjob", "");
							} else if (data["status"] == "failed") {
								clearInterval(naiscTimer);
								$("#naisc_link").html("Linking failed :(");
								$("#naisc_link").data("bgjob", "");
							}
						});
					}
				}
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = {elements:[]}
					for (var key in response) {
						this.configData.elements.push(response[key]);
					}
					this.update();
				});
			},

			getConfigData() {
				var newData = {};
				$('.element-info').each(function() {
					var el = $(this).data('element');
					newData[el] = {linkElement: el, identifier: $('#identifier_'+el).val(), preview: $('#preview_'+el).val()};
				});
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-links>
