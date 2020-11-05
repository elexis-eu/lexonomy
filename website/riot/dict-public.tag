<dict-public>
	<div class="row">
		<div class="col s10 offset-s1">
			<h3 class="header">{ this.props.dictDetails.title }</h3>
			<p class="blurb">{ this.props.dictDetails.blurb }</p>
		</div>
	</div>
	<div if={ this.props.dictDetails.public } class="row">
		<div class="divider"></div>
		<a class="btn-floating waves-effect waves-light right" onclick={ reloadRandom }><i class="material-icons">refresh</i></a>
		<ul class="random-entries s10" if={ this.randomEntries }>
			<li each={ entry in randomEntries }><a href="#/{ this.dictId }/{ entry.id }">{ entry.titlePlain }</a></li>
		</ul>
		<div class="divider"></div>
		<div class="section">
			{ this.props.dictDetails.licence }
		</div>
	</div>

	<script>
		export default {
			dictId: '',
			randomEntries: [],

			reloadRandom() {
				$.post("/" + this.dictId + "/random.json", (response) => {
					console.log(response)
					this.randomEntries = response.entries;
					this.update();
				});
			},

			onMounted() {
				this.dictId = this.props.dictId;
				console.log('list dict '+ this.dictId)
				this.props.loadDictDetail();
				console.log(this.props)
			},
			onUpdated() {
				console.log('list dict update'+ this.dictId)
				$('.blurb').html(this.props.dictDetails.blurb);
				if (this.props.dictDetails.public && this.randomEntries.length == 0) {
					this.reloadRandom();
				}
			}
		}
	</script>

	<style>
		.random-entries li {display: inline; padding: 5px 10px;}
		.random-entries li a:hover {text-decoration: underline;}
	</style>
</dict-public>

