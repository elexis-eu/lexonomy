<dict-config-autonumber>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
		<div class="row">
			<h4>Auto-numbering of elements</h4>
			<p>If you need to number some of entry elements automatically, Lexonomy can do that for you. First, go to Entry structure and add element/attribute where you want to store the number. Eg. in element <tt>sense</tt> add attribute <tt>number</tt>. When you're ready, select element to number (eg. <tt>sense</tt>) and element/attribute to store numbering (eg. <tt>@number</tt>). Lexonomy will fill the numbers where missing.</p>
		</div>
		<div class="row">
			<div class="input-field col s4">
				<select id="elements" onchange={ changeElem }>
				</select>
				<label for="elements">Element to number</label>
			</div>
			<div class="input-field col s4">
				<select id="children">
				</select>
				<label for="children">Add numbers to</label>
			</div>
			<div class="col s3">
				<a class="btn waves-effect waves-light" onclick={ addNumbers } id="submit_button"><i class="material-icons right">add</i>Add numbers</a>
			</div>
		</div>
		<div class="row" id="numberinfo" style="display:none">
			<div class="col s10">
				<div class="card red">
					<div class="card-content white-text">
					</div>
				</div>
			</div>
		</div>
	</div>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Auto-numbering', 
			configData: {elements:[]},
		
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				console.log(this.props);
			},

			onUpdated() {
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
					if ($('#elements option').length == 0) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							$('#elements').append('<option value="' + key + '">' + key + '</option>');
						});
					}
					$('select').formSelect();
					M.updateTextFields();
				}
			},

			changeElem() {
				$("#children").find('option').remove();
				var elem = $("#elements").val();
				for(var atName in this.props.dictConfigs.xema.elements[elem]['attributes']){
					$("#children").append("<option value='@"+atName+"'>@"+atName+"</option>");
				}
				for(var child in this.props.dictConfigs.xema.elements[elem]['children']){
					$("#children").append("<option value='"+this.props.dictConfigs.xema.elements[elem]['children'][child].name+"'>"+this.props.dictConfigs.xema.elements[elem]['children'][child].name+"</option>");
				}
				$('select').formSelect();
			},

			addNumbers() {
				var countElem = $("#elements").val();
				var storeElem = $("#children").val();
				if (countElem != "" && storeElem != null && storeElem != "") {
					$("#numberinfo").show();
					$("#numberinfo .card-content").html('<p>Auto numbering in progress</p>');
					$.post("/" + this.dictId + "/autonumber.json", {"countElem": countElem, "storeElem": storeElem}, (response) => {
						if(!response.success) {
							$("#numberinfo .card-content").html('<p>Auto numbering failed</p>');
						} else {
							$("#numberinfo .card-content").html('<p>Auto-numbering finished, '+response.processed+' entries updated.</p>')
						}
					});
				}
			}
		}
	</script>
	
</dict-config-autonumber>