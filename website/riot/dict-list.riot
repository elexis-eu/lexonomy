<dict-list>
	<ul class="collection">
		<li each={ dict in userdicts } class="collection-item ">
			<div>
				<a href="#/{ dict.id }" style="cursor: pointer">{ dict.title }</a>
				<span if={ dict.lang } class="dict-lang">{ dict.lang }</span>
				<a style="cursor: pointer" if={ dict.currentUserCanDelete } class="secondary-content" data-dict-id={ dict.id } data-dict-title={ dict.title } title="delete dictionary" onclick={ doDeleteDict }><i class="material-icons">delete</i></a>
				<a style="cursor: pointer" class="secondary-content" data-dict-id={ dict.id } title="clone dictionary" onclick={ doCloneDict }><i class="material-icons">content_copy</i></a>
				<a style="cursor: pointer" if={ dict.currentUserCanDelete } class="secondary-content" data-dict-id={ dict.id } data-dict-title={ dict.title } title="config dictionary" onclick={ doConfigDict }><i class="material-icons">settings</i></a>
				<a style="cursor: pointer" if={ dict.currentUserCanEdit } class="secondary-content" data-dict-id={ dict.id } title="edit dictionary" onclick={ doEditDict }><i class="material-icons">edit</i></a>
			</div>
		</li>
	</ul>
	<a href="#/make" class="waves-effect waves-light btn-small"><i class="material-icons left">add</i>create new dictionary</a>

	<script>
		export default {
			userdicts: [],
			onMounted() {
				console.log('list dict')
				$.get("/userdicts.json", (response) => {
					console.log(response.dicts);
					this.userdicts = response.dicts;
					this.update();
				});
			}, 
		
			doEditDict(event) {
				var dictId = event.target.parentNode.getAttribute('data-dict-id');
				route(dictId + "/edit");
			},

			doConfigDict(event) {
				var dictId = event.target.parentNode.getAttribute('data-dict-id');
				route(dictId + "/config");
			},

			doCloneDict(event) {
				var dictId = event.target.parentNode.getAttribute('data-dict-id');
				$.post("/" + dictId + "/clone.json", (response) => {
					if (response.success) {
						this.userdicts = response.dicts;
						this.update();
					}
				});
			},

			doDeleteDict(event) {
				var dictId = event.target.parentNode.getAttribute('data-dict-id');
				var dictTitle = event.target.parentNode.getAttribute('data-dict-title');
				if (confirm("Are you sure you want to delete dictionary " + dictTitle + "? You will not be able to undo this.")) {
					$.post("/" + dictId + "/destroy.json", (response) => {
						if (response.success) {
							this.userdicts = response.dicts;
							this.update();
						}
					});
				}
			}
		}
	</script>

	<style>
		.dict-lang {
			padding-left: 0.5em;
		}
	</style>
</dict-list>
