<list-headword>
	<a onclick={ doSelectEntry } class="headword-link collection-item"></a>
  <script>
		export default {
			doSelectEntry() {
				this.props.changeEntryEdit(this.props.entryData.id)
			},
			setInnerHTML() {
				$('.headword-link', this.root).html(this.props.entryData.title);
      },
      onMounted() {
        this.setInnerHTML()
      },
      onUpdated() {
        this.setInnerHTML()
      }
    }
  </script>
</list-headword>
