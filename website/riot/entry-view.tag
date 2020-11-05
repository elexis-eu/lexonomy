<entry-view>
	<div class="viewer" id="viewer">
	</div>
	<script>
		export default {
			entryId: '',

			readEntry() {
				if (this.props.dictId != '') {
					$.post("/" + this.props.dictId + "/entryread.json", {id: this.props.entryId}, (response) => {
						console.log(response)
						if (response.success) {
							$('.viewer').html(response.contentHtml);
						}
					});
				}
			},

			onMounted() {
				this.entryId = this.props.entryId;
				console.log('view '+this.props.dictId+'-'+this.props.entryId)
				this.readEntry();
			},

			onUpdated() {
				console.log('up view '+this.props.dictId+'-'+this.props.entryId+'-'+this.entryId)
				if (this.entryId != this.props.entryId) {
					this.entryId = this.props.entryId;
					this.readEntry();
				}
			}
		}
	</script>
</entry-view>
