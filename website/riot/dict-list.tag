<dict-list>
	<ul class="collection">
		<li each={ dict in userdicts } class="collection-item ">
			<div>
				<a href="#/{ dict.id }" style="cursor: pointer">{ dict.title }</a>
				<span if={ dict.lang }>{ dict.lang }</span>
				<a style="cursor: pointer" if={ dict.currentUserCanDelete } class="secondary-content" data-dict-id={ dict.id } data-dict-title={ dict.title } title="delete dictionary" onclick={ doDeleteDict }><i class="material-icons">delete</i></a>
				<a style="cursor: pointer" class="secondary-content" data-dict-id={ dict.id } title="clone dictionary" onclick={ doCloneDict }><i class="material-icons">content_copy</i></a>
			</div>
		</li>
	</ul>

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
		
			onShowDict(event) {
				var dictid = event.target.getAttribute('data-dictid');
				route('dict/'+dictid);
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
</dict-list>
