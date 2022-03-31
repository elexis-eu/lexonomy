<dict-new>
	<div>
		<div class="row">
			<div class="input-field col s12">
				<input id="title" type="text" class="validate invalid" required/>
				<label for="title">Title</label>
				<span class="helper-text">Enter a human-readable title such as "My Esperanto Dictionary". You will be able to change this later.</span>
			</div>
		</div>
		<div class="row">
			<div class="col s6 input-field">
					<input id="baseUrl" type="text" disabled value="https://www.lexonomy.eu/"/>
			</div>
			<div class="col s6 input-field">
					<input id="url" type="text" class="validate" required minlength="5" pattern="[a-zA-Z0-9\-]*"/>
					<label for="url">URL</label>
					<span class="helper-text">This will be your dictionary's address on the web. You will be able to change this later. Allowed: characters, numbers, -</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s12">
				<select id="template">
					<option value="blank">(none)</option>
					<option value="smd">Simple Monolingual Dictionary</option>
					<option value="sbd">Simple Bilingual Dictionary</option>
				</select>
				<label>Template</label>
				<span class="helper-text">You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.</span>
			</div>
		</div>
		<div if={ errorMessage != ''} class="row">
			<div class="col s8">
				<div class="card red darken-2">
					<div class="card-content white-text">
						<p>{ errorMessage }</p>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<button class="btn waves-effect waves-light" type="submit" name="makeDict" id="makeButton" onclick={ doMake }>Create dictionary
			<i class="material-icons left">add</i>
			</button>
		</div>
	</div>

	<script>
		export default {
			errorMessage: '',
			onMounted() {
				console.log('list dict')
				$.get("/makesuggest.json", (response) => {
					$('#url').val(response.suggested);
					$('#baseUrl').val(response.baseUrl);
					M.updateTextFields();
				});
				$('select').formSelect();
			},

			doMake(event) {
				if ($('#url').val() != '' && $('#title').val() != '') {
					$.post("/make.json", {url: $('#url').val(), template: $('#template').val(), title: $('#title').val()}, (response) => {
						if (response.success) {
							this.errorMessage = '';
							route('/'+response.url);
						} else {
							this.errorMessage = 'Selected URL is already taken.';
							this.update();
						}
					});
				}
			},
		}
	</script>
</dict-new>
