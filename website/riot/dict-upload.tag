<dict-upload>
	<nav>
		<div class="nav-wrapper deep-orange lighten-4">
			<div class="col s12">
				<a href="#/{ this.props.dictId }" class="breadcrumb">{ this.props.dictDetails.title }</a>
				<a href="#/{ this.props.dictId }/upload" class="breadcrumb">Upload</a>
			</div>
		</div>
	</nav>
	<div class="row">
    <div class="file-field input-field col s6">
      <div class="btn">
        <span>XML file</span>
        <input type="file" id="file">
      </div>
      <div class="file-path-wrapper">
        <input class="file-path validate" type="text">
      </div>
    </div>
	</div>		
	<div class="row">
		<div class="col s6">
      <label>
        <input type="checkbox" id="purge" />
        <span>Purge dictionary before upload</span>
      </label>
		</div>
	</div>
	<div class="row">
		<div class="col s6">
			<a class="waves-effect waves-light btn" onclick={ doUpload } id="startButton"><i class="material-icons left">file_upload</i>Upload file</a>
		</div>
	</div>
	<div class="row">
		<div class="col s10" id="info">
		</div>
	</div>
	<div class="row">
		<div class="col s10" id="errors">
			<pre>
			</pre>
		</div>
	</div>

	<script>
		export default {
			dictId: '',
			onMounted() {
				this.dictId = this.props.dictId;
				console.log('upload dict '+ this.dictId)
				this.props.loadDictDetail();
				console.log(this.props)
				this.update()
			},

			doUpload() {
				var purge = $('#purge').is(':checked');
				console.log($('#file'))
				console.log($('#file').val())
				console.log(purge)
				var fd = new FormData();
				var files = $('#file')[0].files[0];
				fd.append('myfile', files);
				if (purge) fd.append('purge', 'on');
				$.ajax({
					url: '/' + this.dictId + '/upload.html',
					data: fd,
					processData: false,
					contentType: false,
					type: 'POST',
					success: function(response) {
						console.log(response)
						if (response.success) {
							$('#info').data('file', response.file);
							$('#info').data('uploadStart', response.uploadStart);
							$('#startButton').attr('disabled', 'disabled');
						} else {
							$('#info').html('Error while uploading file');
						}
					}
				});
				this.startImport(this.dictId);
			},

			startImport(dictId) {
				var importTimer = setInterval(checkImport, 500);
				function checkImport() {
					var file = $('#info').data('file');
					var uploadStart = $('#info').data('uploadStart');
					if (file != '') {
						$.get('/' + dictId + '/import.json', {filename: file, uploadStart: uploadStart}, (response) => {
							console.log(response)
							$('#info').html(response.progressMessage);
							if (response.finished) {
								$('#info').html(response.progressMessage + '<br/>Dictionary import finished. <a href="/#'+dictId+'/edit">See dictionary</a>');
								clearInterval(importTimer);
								$('#startButton').removeAttr('disabled');
							}
							if (response.errors) {
								$('#info').html('There were some errors during XML parsing');
								$.get('/' + dictId + '/import.json', {filename: file, uploadStart: uploadStart, showErrors: true, truncate: 10000}, (response) => {
									$('#errors pre').html(response.errorData)
								});
								clearInterval(importTimer);
								$('#startButton').removeAttr('disabled');
							}
						});
					}
				}
			}
		}
	</script>
</dict-upload>
